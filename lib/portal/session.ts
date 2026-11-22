import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/supabase/auth";
import type { Section } from "./layer";
import { getPortalAccess, getPortalData } from "./notion";

/** The signed-in client, once per request (layout and page share it). */
export const currentClient = cache(() => requireUser());

/**
 * The client's Notion data, once per request. An unconfirmed email sees
 * nothing: anyone can sign up with any address, so the address must be
 * proven before it unlocks a customer's projects and invoices.
 */
export const portalData = cache(async () => {
  const client = await currentClient();
  return getPortalData(client.verified ? client.email : "");
});

/** Which sections the signed-in client may open, once per request. */
export const portalAccess = cache(async () => {
  const client = await currentClient();
  return getPortalAccess(client.verified ? client.email : "");
});

/** False when this section is closed for the signed-in client («قريبًا»). */
export async function sectionOpen(section: Section) {
  return (await portalAccess()).open.includes(section);
}
