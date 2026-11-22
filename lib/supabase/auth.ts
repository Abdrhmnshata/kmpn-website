import "server-only";
import { createClient, type User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionClaims } from "./claims";

/**
 * Supabase client bound to the visitor's session cookies, for the client
 * portal (/portal, /login, /signup). The public pages keep using the
 * cookie-less client in ./server.ts so they stay static.
 *
 * Returns null when Supabase is not configured, like getSupabase().
 */
export async function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        // Server Components cannot write cookies; the middleware refreshes
        // the session for them, so the failure here is harmless.
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {}
      },
    },
  });
}

/**
 * The signed-in user, asked from Supabase's auth server (a round trip to
 * Tokyo). For server actions, which write: it also notices a session that
 * was signed out elsewhere. Pages use requireUser(), which is local.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await getAuthClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Whether this account's address is confirmed. Only a confirmed address may
 * see the Notion data linked to it, and the access token does not say, so
 * the auth server is asked once per account and address; a "yes" is kept
 * (a confirmation never goes back), a "no" is asked again next time.
 */
async function emailConfirmed(id: string, email: string, token: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !email) return false;
  const check = unstable_cache(
    async () => {
      const plain = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data } = await plain.auth.getUser(token);
      const user = data.user;
      if (user?.id !== id || (user.email ?? "").toLowerCase() !== email || !user.email_confirmed_at) {
        throw new Error("[auth] not confirmed, not kept");
      }
      return true;
    },
    ["email-confirmed-v1", id, email],
    { revalidate: false },
  );
  return check().catch(() => false);
}

export type Profile = {
  name: string;
  firstName: string;
  company: string;
  phone: string;
  email: string;
  /** Only a confirmed address may see the Notion data linked to it. */
  verified: boolean;
};

function toProfile(email: string, meta: Record<string, unknown>, verified: boolean): Profile {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(meta.full_name) || email.split("@")[0];
  return {
    name,
    firstName: name.split(/\s+/)[0],
    company: str(meta.company),
    phone: str(meta.phone),
    email,
    verified,
  };
}

/** A user from the auth server (server actions) as the portal shows it. */
export function profileOf(user: User): Profile {
  return toProfile(
    (user.email ?? "").toLowerCase(),
    (user.user_metadata ?? {}) as Record<string, unknown>,
    Boolean(user.email_confirmed_at),
  );
}

/** For pages: the signed-in visitor, verified locally; null when signed out. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await getAuthClient();
  if (!supabase) return null;
  const claims = await sessionClaims(supabase);
  if (!claims) return null;
  const token = (await supabase.auth.getSession()).data.session?.access_token ?? "";
  const verified = await emailConfirmed(claims.id, claims.email, token);
  return toProfile(claims.email, claims.meta, verified);
}

/** For portal pages: the signed-in visitor, or a redirect to /login. */
export async function requireUser(next = "/portal"): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return profile;
}

/** The non-secret cookie the public header reads to greet a signed-in client. */
export const GREETING_COOKIE = "kp_name";
