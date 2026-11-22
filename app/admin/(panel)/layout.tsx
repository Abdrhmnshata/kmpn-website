import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container portal">
      <AdminNav />
      <div className="portal-main">{children}</div>
    </main>
  );
}
