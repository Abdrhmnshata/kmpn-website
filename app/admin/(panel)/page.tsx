import Link from "next/link";
import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead, Status } from "@/components/portal/Bits";
import { SignupsSetup, SourceErrors, Stat } from "@/components/admin/AdminBits";
import { TICKET_STATUS, formatDate } from "@/lib/portal/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { clients, signups, tickets, errors, clientsOf, clientById } = await adminSnapshot();
  const waiting = signups?.filter((s) => s.verified && !clientsOf(s.email).length) ?? [];
  const unconfirmed = signups?.filter((s) => !s.verified) ?? [];
  const open = tickets.filter((t) => t.status === "new" || t.status === "progress");
  const onPortal = clients.filter((c) => c.emails.length);

  return (
    <>
      <PageHead title="لوحة المدير" lead="مين سجّل في بوابة العملاء، مين مربوط بأنهي عميل وبيشوف إيه، والتذاكر المفتوحة." />
      <SourceErrors errors={errors} />
      {signups === null && !errors.length ? <SignupsSetup /> : null}

      <div className="a-stats">
        <Stat
          label="حسابات مسجّلة"
          value={signups ? signups.length : "—"}
          sub={signups ? `${unconfirmed.length} لسه مأكدوش الإيميل` : undefined}
          href="/admin/signups"
        />
        <Stat
          label="مستنيين ربط"
          value={signups ? waiting.length : "—"}
          sub="أكدوا الإيميل ومش مربوطين بعميل"
          href="/admin/signups?filter=waiting"
          alert={waiting.length > 0}
        />
        <Stat
          label="تذاكر مفتوحة"
          value={open.length}
          sub={`${tickets.filter((t) => t.status === "new").length} جديدة`}
          href="/admin/support"
          alert={open.some((t) => t.status === "new")}
        />
        <Stat label="عملاء على البوابة" value={onPortal.length} sub={`من ${clients.length} في KC`} href="/admin/clients" />
      </div>

      <div className="p-grid">
        <section className="card p-card">
          <div className="p-card-head">
            <h2>مستنيين ربط</h2>
            <Link href="/admin/signups?filter=waiting" prefetch={false} className="p-link" style={{ fontSize: 14 }}>
              اربطهم ←
            </Link>
          </div>
          {waiting.length ? (
            <ul className="p-mini">
              {waiting.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <span>
                    {s.name || s.email}
                    {s.company ? <span className="p-meta"> · {s.company}</span> : null}
                  </span>
                  <span className="p-meta">{formatDate(s.created)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{signups ? "كل اللي أكدوا مربوطين بعملائهم." : "محتاج مفتاح Supabase علشان تظهر."}</Empty>
          )}
        </section>

        <section className="card p-card">
          <div className="p-card-head">
            <h2>تذاكر محتاجة رد</h2>
            <Link href="/admin/support" prefetch={false} className="p-link" style={{ fontSize: 14 }}>
              عرض الكل ←
            </Link>
          </div>
          {open.length ? (
            <ul className="p-mini">
              {open.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <span>
                    {t.subject}
                    <span className="p-meta">
                      {" "}
                      · {t.customerIds.map((id) => clientById(id)?.company).filter(Boolean).join("، ") || t.email}
                    </span>
                  </span>
                  <Status label={TICKET_STATUS[t.status][0]} tone={TICKET_STATUS[t.status][1]} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>مفيش تذاكر مفتوحة.</Empty>
          )}
        </section>
      </div>
    </>
  );
}
