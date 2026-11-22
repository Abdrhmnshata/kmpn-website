import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortalNav } from "@/components/portal/PortalNav";
import { currentClient, portalAccess } from "@/lib/portal/session";
import { isAdminEmail } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "بوابة العملاء · كامبين",
  robots: { index: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await currentClient(); // redirects to /login when signed out
  const admin = client.verified && isAdminEmail(client.email);
  return (
    <div className="page">
      <Header ctaHref="/contact" />
      <main className="container portal">
        <Suspense fallback={<PortalNav admin={admin} />}>
          <ClientNav admin={admin} />
        </Suspense>
        <div className="portal-main">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

async function ClientNav({ admin }: { admin: boolean }) {
  const { open } = await portalAccess();
  return <PortalNav open={open} admin={admin} />;
}
