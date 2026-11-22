import Link from "next/link";
import type { AdminClient } from "@/lib/portal/notion";
import { Status } from "@/components/portal/Bits";
import { AddEmail, EmailChip, SectionsForm } from "@/components/admin/AdminForms";
import { customerStatus } from "@/lib/portal/format";

/** One KC row on /admin: who opens its portal and which sections it gets. */
export function ClientCard({ c }: { c: AdminClient }) {
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
