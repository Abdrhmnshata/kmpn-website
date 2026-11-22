import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getProfile, getUser, profileOf, type Profile } from "@/lib/supabase/auth";

/**
 * Who may open the director's dashboard (/admin): confirmed portal accounts
 * whose email is in ADMIN_EMAILS (comma-separated). Only the director today.
 */
const ADMINS = (process.env.ADMIN_EMAILS ?? "a@kmpn.agency")
  .split(/[\s,;]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string) => ADMINS.includes(email.trim().toLowerCase());

/** The signed-in visitor for /admin pages, checked locally, once per request. */
const pageProfile = cache(getProfile);

/**
 * For /admin pages and actions: the signed-in director, a redirect to /login
 * when signed out, and a plain 404 for anyone else, so the page does not
 * even admit it exists.
 *
 * Pages check the session locally (fast). Actions pass `strict`, which asks
 * Supabase's auth server, so a write also notices a session signed out
 * elsewhere.
 */
export async function requireAdmin({ strict = false } = {}): Promise<Profile> {
  let profile: Profile | null;
  if (strict) {
    const user = await getUser();
    profile = user ? profileOf(user) : null;
  } else {
    profile = await pageProfile();
  }
  if (!profile) redirect("/login?next=/admin");
  if (!profile.verified || !isAdminEmail(profile.email)) notFound();
  return profile;
}
