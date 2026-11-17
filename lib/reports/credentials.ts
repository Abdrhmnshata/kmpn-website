/**
 * Reads a service-account key pasted into an environment variable.
 *
 * Pasting a key file into a dashboard field can mangle it, so besides plain
 * JSON this accepts: the value wrapped in quotes, JSON encoded twice, the
 * file in base64, and line breaks that turned real inside the private key.
 * On failure it says why, without echoing any of the secret.
 */
export type ServiceAccount = { client_email: string; private_key: string };

export function parseServiceAccount(raw: string): { account: ServiceAccount } | { error: string } {
  const value = raw.trim().replace(/^﻿/, "");
  if (!value) return { error: "empty" };

  const candidates = [value];
  if (/^(["'])[\s\S]*\1$/.test(value)) candidates.push(value.slice(1, -1));
  if (!value.startsWith("{")) {
    const decoded = Buffer.from(value, "base64").toString("utf8").trim();
    if (decoded.startsWith("{")) candidates.push(decoded);
  }

  let lastError = "not JSON";
  for (const candidate of candidates) {
    for (const text of [candidate, candidate.replace(/\r?\n/g, "\\n")]) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
      } catch {
        continue;
      }
      const obj = parsed as Partial<ServiceAccount> | null;
      if (!obj || typeof obj !== "object") {
        lastError = "JSON but not an object";
        continue;
      }
      if (!obj.client_email || !obj.private_key) {
        lastError = `JSON without ${!obj.client_email ? "client_email" : "private_key"}`;
        continue;
      }
      const key = obj.private_key.replace(/\\n/g, "\n");
      if (!key.includes("BEGIN PRIVATE KEY")) {
        lastError = "private_key is not a PEM key";
        continue;
      }
      return { account: { client_email: obj.client_email, private_key: key } };
    }
  }
  return {
    error: `${lastError} (length ${value.length}, starts with ${JSON.stringify(value.slice(0, 1))}, ends with ${JSON.stringify(value.slice(-1))})`,
  };
}
