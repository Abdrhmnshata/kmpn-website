import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase with the service-role key, for the director's dashboard only:
 * it lists every portal account. The key bypasses all access rules, so it
 * lives in SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC_) and
 * nothing here may ever reach a client component.
 */
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const isAdminApiConfigured = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

export type Signup = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  verified: boolean;
  created: string;
  lastSignIn: string | null;
};

/** Every portal account, newest first; null when the key is not set. */
export async function listSignups(): Promise<Signup[] | null> {
  const supabase = adminClient();
  if (!supabase) return null;
  const users: Signup[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
      users.push({
        id: u.id,
        email: (u.email ?? "").toLowerCase(),
        name: str(meta.full_name),
        company: str(meta.company),
        phone: str(meta.phone),
        verified: Boolean(u.email_confirmed_at),
        created: u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
      });
    }
    if (data.users.length < 200) break;
  }
  return users.sort((a, b) => b.created.localeCompare(a.created));
}
