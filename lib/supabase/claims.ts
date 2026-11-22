import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Who is signed in, read from the session cookie and verified on our own
 * server: the access token is signed with the project's ES256 key, and
 * getClaims() checks that signature against the public key (fetched once and
 * kept for ten minutes). No call to Supabase's auth server per click, which
 * used to cost 0.3–1s each time: the project lives in Tokyo.
 *
 * Shared by the middleware (Edge) and the server pages, so it imports no
 * Node-only code.
 */
export type SessionClaims = {
  id: string;
  email: string;
  meta: Record<string, unknown>;
};

export async function sessionClaims(supabase: SupabaseClient): Promise<SessionClaims | null> {
  try {
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub || claims.is_anonymous) return null;
    return {
      id: claims.sub,
      email: String(claims.email ?? "").toLowerCase(),
      meta: (claims.user_metadata ?? {}) as Record<string, unknown>,
    };
  } catch (err) {
    // The public key could not be fetched (network): ask the auth server.
    console.warn("[auth] getClaims failed, asking Supabase:", err instanceof Error ? err.message : err);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user || user.is_anonymous) return null;
    return {
      id: user.id,
      email: (user.email ?? "").toLowerCase(),
      meta: (user.user_metadata ?? {}) as Record<string, unknown>,
    };
  }
}
