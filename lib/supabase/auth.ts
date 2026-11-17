import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

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

export async function getUser(): Promise<User | null> {
  const supabase = await getAuthClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** For portal pages: the signed-in user, or a redirect to /login. */
export async function requireUser(next = "/portal"): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
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

export function profileOf(user: User): Profile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const email = (user.email ?? "").toLowerCase();
  const name = str(meta.full_name) || email.split("@")[0];
  return {
    name,
    firstName: name.split(/\s+/)[0],
    company: str(meta.company),
    phone: str(meta.phone),
    email,
    verified: Boolean(user.email_confirmed_at),
  };
}

/** The non-secret cookie the public header reads to greet a signed-in client. */
export const GREETING_COOKIE = "kp_name";
