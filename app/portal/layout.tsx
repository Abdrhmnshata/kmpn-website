import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortalNav } from "@/components/portal/PortalNav";
import { currentClient } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "بوابة العملاء · كامبين",
  robots: { index: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await currentClient(); // redirects to /login when signed out
  return (
    <div className="page">
      <Header ctaHref="/contact" />
      <main className="container portal">
        <PortalNav />
        <div className="portal-main">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
