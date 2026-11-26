import type { Metadata } from "next";
import { currentClient, portalAccess } from "@/lib/portal/session";
import { isAdminEmail } from "@/lib/admin/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: "بوابة العملاء · كامبين",
  robots: { index: false },
};

/**
 * The portal is an app of its own: a rail (phones: a bottom bar) instead of
 * the site's header and footer (components/portal/PortalShell.tsx). The
 * open sections come from the same per-request read the pages use.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await currentClient(); // redirects to /login when signed out
  const admin = client.verified && isAdminEmail(client.email);
  const { open } = await portalAccess();
  return (
    <div className="page ps-page">
      <PortalShell open={open} admin={admin} name={client.firstName}>
        <div className="container portal portal-wide">
          <div className="portal-main">{children}</div>
        </div>
      </PortalShell>
    </div>
  );
}
