import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { currentClient, portalAccess } from "@/lib/portal/session";
import { isAdminEmail } from "@/lib/admin/auth";
import { DEFAULT_OPEN } from "@/lib/portal/layer";

export const metadata: Metadata = {
  title: "بوابة العملاء · كامبين",
  robots: { index: false },
};

/** The portal's menu lives in the site header (components/portal/PortalMenu.tsx). */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await currentClient(); // redirects to /login when signed out
  const admin = client.verified && isAdminEmail(client.email);
  return (
    <div className="page">
      <Suspense fallback={<Header portal={{ open: DEFAULT_OPEN, admin }} />}>
        <PortalHeader admin={admin} />
      </Suspense>
      <main className="container portal portal-wide">
        <div className="portal-main">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

/** The header once the client's open sections are known. */
async function PortalHeader({ admin }: { admin: boolean }) {
  const { open } = await portalAccess();
  return <Header portal={{ open, admin }} />;
}
