import "server-only";
import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Read-only access to Google Sheets with a service account.
 *
 * Credentials, in order:
 *  - GOOGLE_SERVICE_ACCOUNT_JSON: the whole key file as one value (Vercel).
 *  - GOOGLE_SERVICE_ACCOUNT_FILE: a path to the key file (local only).
 *
 * The account only needs Viewer on the spreadsheet; nothing here writes.
 */

type ServiceAccount = { client_email: string; private_key: string };

const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

let cachedAccount: ServiceAccount | null | undefined;
let cachedToken: { value: string; expires: number } | null = null;

async function serviceAccount(): Promise<ServiceAccount | null> {
  if (cachedAccount !== undefined) return cachedAccount;
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const file = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  let raw: string | null = null;
  if (inline) raw = inline;
  else if (file) raw = await readFile(file, "utf8").catch(() => null);
  if (!raw) return (cachedAccount = null);
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return (cachedAccount = null);
    return (cachedAccount = parsed);
  } catch {
    return (cachedAccount = null);
  }
}

export async function googleConfigured(): Promise<boolean> {
  return (await serviceAccount()) !== null;
}

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const account = await serviceAccount();
  if (!account) throw new Error("Google service account is not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(account.private_key));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/*
 * Successful responses are kept in memory for `maxAge` seconds, and parallel
 * requests for the same URL share one call. Next's fetch cache isn't used:
 * it would also keep an error response (a 403 while the API was off, say).
 */
const memo = new Map<string, { expires: number; value: Promise<unknown> }>();

/** Calls the Sheets API; a successful response is reused for `maxAge` seconds. */
export async function sheetsGet<T>(path: string, params: URLSearchParams, maxAge: number): Promise<T> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${path}?${params}`;
  const hit = memo.get(url);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;

  const value = (async () => {
    const token = await accessToken();
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) throw new Error(`Sheets API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return (await res.json()) as T;
  })();
  memo.set(url, { expires: Date.now() + maxAge * 1000, value });
  value.catch(() => memo.delete(url));
  if (memo.size > 200) for (const [k, v] of memo) if (v.expires <= Date.now()) memo.delete(k);
  return value;
}
