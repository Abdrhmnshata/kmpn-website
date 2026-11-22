import Link from "next/link";
import { adminSnapshot } from "@/lib/admin/data";
import type { AdminClient } from "@/lib/portal/notion";
import { Empty, PageHead, Status } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { AddEmail, EmailChip, SectionsForm } from "@/components/admin/AdminForms";
import { customerStatus } from "@/lib/portal/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء والصلاحيات · لوحة المدير" };

function ClientCard({ c }: { c: AdminClient }) {
  const [label, tone] = customerStatus(c.status);
  return (
    <article className="card p-card a-client">
      <div className="a-client-head">
        <h2>{c.company}</h2>
        <Status label={label} tone={tone} />
        <Link href={`/admin/view/${c.id}`} prefetch={false} className="p-link a-view">
          شوف بوابته ←
        </Link>
      </div>

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
    </article>
  );
}

export default async function ClientsPage() {
  const { clients, errors } = await adminSnapshot();
  const current = clients.filter((c) => c.emails.length || c.status === "Active" || c.status === "In Pipeline");
  const rest = clients.filter((c) => !current.includes(c));

  return (
    <>
      <PageHead
        title="العملاء والصلاحيات"
        lead="لكل عميل: مين يدخل بوابته، وأنهي أقسام يشوفها. القسم اللي مش متعلّم بيظهرله «قريبًا». التعديلات بتتحفظ في صف العميل في KC على نوشن."
      />
      <SourceErrors errors={errors} />
      {current.length ? (
        <div className="p-list">
          {current.map((c) => (
            <ClientCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <Empty>مفيش عملاء.</Empty>
      )}
      {rest.length ? (
        <details className="a-rest">
          <summary>باقي العملاء في KC ({rest.length})</summary>
          <div className="p-list">
            {rest.map((c) => (
              <ClientCard key={c.id} c={c} />
            ))}
          </div>
        </details>
      ) : null}
    </>
  );
}
