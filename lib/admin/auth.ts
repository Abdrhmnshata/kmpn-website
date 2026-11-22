import "server-only";
import { notFound, redirect } from "next/navigation";
import { getUser, profileOf, type Profile } from "@/lib/supabase/auth";

/**
 * Who may open the director's dashboard (/admin): confirmed portal accounts
 * whose email is in ADMIN_EMAILS (comma-separated). Only the director today.
 */
const ADMINS = (process.env.ADMIN_EMAILS ?? "a@kmpn.agency")
  .split(/[\s,;]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string) => ADMINS.includes(email.trim().toLowerCase());

/**
 * For /admin pages and actions: the signed-in director, a redirect to /login
 * when signed out, and a plain 404 for anyone else, so the page does not
 * even admit it exists.
 */
export async function requireAdmin(): Promise<Profile> {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  const profile = profileOf(user);
  if (!profile.verified || !isAdminEmail(profile.email)) notFound();
  return profile;
}
