import "server-only";
import { cache } from "react";
import { requireUser, profileOf } from "@/lib/supabase/auth";
import { getPortalData } from "./notion";

/** The signed-in client, once per request (layout and page share it). */
export const currentClient = cache(async () => profileOf(await requireUser()));

/**
 * The client's Notion data, once per request. An unconfirmed email sees
 * nothing: anyone can sign up with any address, so the address must be
 * proven before it unlocks a customer's projects and invoices.
 */
export const portalData = cache(async () => {
  const client = await currentClient();
  return getPortalData(client.verified ? client.email : "");
});
