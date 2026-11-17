import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PageHead } from "@/components/portal/Bits";
import { listPreviewCustomers } from "@/lib/portal/notion";

/** Local-only list of clients whose portal can be previewed (see [customer]). */

export const metadata: Metadata = { title: "معاينة البوابة", robots: { index: false } };

export default async function PreviewIndex() {
  if (process.env.NODE_ENV === "production") notFound();
  const customers = await listPreviewCustomers();

  return (
    <div className="page">
      <Header ctaHref="/contact" />
      <main className="container" style={{ paddingBlock: "48px 96px", display: "grid", gap: 20 }}>
        <PageHead
          title="معاينة البوابة"
          lead="العملاء اللي ليهم داشبورد في KC. اختار عميل عشان تشوف البوابة زي ما هو هيشوفها."
        />
        <div className="p-list">
          {customers.map((c) => (
            <Link key={c.id} href={`/preview/${c.id}`} className="card p-row">
              <strong>{c.company}</strong>
              <span className="p-meta">{c.portalEmails ? "مربوط بإيميل" : "لسه مفيش إيميل في Portal Emails"}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
