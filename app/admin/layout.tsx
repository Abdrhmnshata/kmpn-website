import type { Metadata } from "next";
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

/** The dashboard pages bring the site header (app/admin/(panel)/layout.tsx); "view as client" brings the portal's shell. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
