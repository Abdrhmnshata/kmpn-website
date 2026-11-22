import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/portal/notion";
import { Status } from "@/components/portal/Bits";
import { AddEmail, EmailChip, SectionsForm } from "@/components/admin/AdminForms";
import { customerStatus, serviceLabel } from "@/lib/portal/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "العميل · لوحة المدير" };

/** One KC row: who opens its portal, and which sections it gets. */
export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getClient(id);
  if (!c) notFound();
  const [label, tone] = customerStatus(c.status);
  const back = c.internal
    ? { href: "/admin/internal", label: "المشاريع الداخلية" }
    : { href: "/admin/clients", label: "كل العملاء" };

  return (
    <>
      <Link href={back.href} prefetch={false} className="p-link a-back">
        → {back.label}
      </Link>
      <header className="p-head a-detail-head">
        <h1>{c.company}</h1>
        <Status label={label} tone={tone} />
        <Link href={`/admin/view/${c.id}`} prefetch={false} className="p-link a-view">
          شوف بوابته ←
        </Link>
      </header>
      {c.services.length ? <p className="p-meta a-detail-services">{c.services.map(serviceLabel).join(" · ")}</p> : null}

      <section className="card p-card a-client">
        <div className="a-block">
          <strong className="a-block-title">الإيميلات اللي تدخل بوابته</strong>
          <div className="a-chips">
            {c.emails.length ? (
              c.emails.map((e) => <EmailChip key={e} clientId={c.id} email={e} />)
            ) : (
              <span className="p-meta">مفيش إيميلات لسه.</span>
            )}
          </div>
          <AddEmail clientId={c.id} />
        </div>

        <div className="a-block">
          <strong className="a-block-title">الأقسام اللي يشوفها</strong>
          <SectionsForm clientId={c.id} open={c.open} isDefault={c.sections === null} />
        </div>
      </section>
    </>
  );
}
