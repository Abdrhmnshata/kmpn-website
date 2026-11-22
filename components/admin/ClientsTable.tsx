import Link from "next/link";
import type { AdminClient } from "@/lib/portal/notion";
import { Status } from "@/components/portal/Bits";
import { customerStatus, serviceLabel } from "@/lib/portal/format";
import { SECTIONS } from "@/lib/portal/layer";

/**
 * Every KC row on one screen, one compact line each (active first), in the
 * spirit of the KC table in Notion. A row opens the client's page (portal
 * emails and sections); «بوابته ←» opens the portal as the client sees it.
 */
export function ClientsTable({ clients }: { clients: AdminClient[] }) {
  return (
    <div className="a-table">
      <div className="a-tr a-th" aria-hidden="true">
        <span>العميل</span>
        <span className="a-tr-status">الحالة</span>
        <span className="a-tr-services">الخدمات</span>
        <span>الإيميلات اللي تدخل بوابته</span>
        <span>الأقسام</span>
        <span />
      </div>
      <ul className="a-rows">
        {clients.map((c) => (
          <Row key={c.id} c={c} />
        ))}
      </ul>
    </div>
  );
}

function Row({ c }: { c: AdminClient }) {
  const [label, tone] = customerStatus(c.status);
  return (
    <li className="a-tr">
      <Link href={`/admin/clients/${c.id}`} prefetch={false} className="a-tr-name">
        {c.company}
      </Link>
      <span className="a-tr-status">
        <Status label={label} tone={tone} />
      </span>
      <span className="a-tr-services">{c.services.map(serviceLabel).join(" · ") || "—"}</span>
      <span className="a-tr-emails">
        {c.emails.length ? (
          <>
            <span dir="ltr">{c.emails[0]}</span>
            {c.emails.length > 1 ? <span className="a-more num">+{c.emails.length - 1}</span> : null}
          </>
        ) : (
          <span className="a-none">مش على البوابة</span>
        )}
      </span>
      <span className="a-tr-sections">
        <span className="num">{c.open.length}</span> من <span className="num">{SECTIONS.length}</span>
        {c.sections === null ? <span className="a-none"> · افتراضي</span> : null}
      </span>
      <Link href={`/admin/view/${c.id}`} prefetch={false} className="a-tr-view" aria-label={`شوف بوابة ${c.company}`}>
        بوابته ←
      </Link>
    </li>
  );
}
