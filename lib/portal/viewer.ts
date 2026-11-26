import "server-only";
import { getProfile } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/lib/admin/auth";
import { getPortalData } from "./notion";

const bare = (id: string) => id.replace(/-/g, "").toLowerCase();

/**
 * For routes that hand out one client's files (report pages, covers,
 * videos): true for that client's own confirmed account and the director.
 * The team's local preview (app/preview) has no sign-in and 404s in
 * production, so development lets everyone through.
 */
export async function mayViewCustomers(customerIds: string[]) {
  if (process.env.NODE_ENV !== "production") return true;
  if (!customerIds.length) return false;
  const profile = await getProfile();
  if (!profile?.verified) return false;
  if (isAdminEmail(profile.email)) return true;
  const wanted = new Set(customerIds.map(bare));
  const data = await getPortalData(profile.email);
  return data.customers.some((c) => wanted.has(bare(c.id)));
}
