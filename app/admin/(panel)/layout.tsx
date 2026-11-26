import { AdminNav } from "@/components/admin/AdminNav";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <Header ctaHref="/contact" />
      <main className="container portal">
        <AdminNav />
        <div className="portal-main">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
