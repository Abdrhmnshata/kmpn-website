import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { requireAdmin } from "@/lib/admin/auth";

/**
 * The director's dashboard: portal accounts, clients and what each one may
 * open, and support tickets. Only ADMIN_EMAILS get in (lib/admin/auth.ts);
 * anyone else gets a 404.
 */
export const metadata: Metadata = {
  title: "لوحة المدير · كامبين",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="page">
      <Header ctaHref="/contact" />
      {children}
      <Footer />
    </div>
  );
}
