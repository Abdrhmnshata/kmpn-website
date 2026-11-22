import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead, Status } from "@/components/portal/Bits";
import { Filters, SourceErrors } from "@/components/admin/AdminBits";
import { TicketReply } from "@/components/admin/AdminForms";
import { TICKET_STATUS, formatDate } from "@/lib/portal/format";
import type { TicketStatus } from "@/lib/portal/notion";

export const dynamic = "force-dynamic";
export const metadata = { title: "الدعم الفني · لوحة المدير" };

const ORDER: TicketStatus[] = ["new", "progress", "answered", "closed"];

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ status = "open" }, { tickets, errors, clientById }] = await Promise.all([
    searchParams,
    adminSnapshot({ signups: false }),
  ]);
  const isOpen = (s: TicketStatus) => s === "new" || s === "progress";
  const active = status === "all" || ORDER.includes(status as TicketStatus) ? status : "open";
  const list = tickets.filter((t) =>
    active === "all" ? true : active === "open" ? isOpen(t.status) : t.status === active,
  );

  return (
    <>
      <PageHead
        title="الدعم الفني"
        lead="تذاكر العملاء من البوابة. ردّك والحالة بيتحفظوا في نوشن، والعميل بيشوفهم في صفحة الدعم الفني عنده."
      />
      <SourceErrors errors={errors} />
      <Filters
        base="/admin/support"
        param="status"
        defaultKey="open"
        active={active}
        items={[
          { key: "open", label: "المفتوحة", count: tickets.filter((t) => isOpen(t.status)).length },
          ...ORDER.map((s) => ({ key: s, label: TICKET_STATUS[s][0], count: tickets.filter((t) => t.status === s).length })),
          { key: "all", label: "الكل", count: tickets.length },
        ]}
      />

      {list.length ? (
        <div className="p-list">
          {list.map((t) => {
            const companies = t.customerIds.map((id) => clientById(id)?.company).filter(Boolean);
            return (
              <article key={t.id} className="card p-card a-ticket">
                <div className="a-client-head">
                  <h2>{t.subject}</h2>
                  <Status label={TICKET_STATUS[t.status][0]} tone={TICKET_STATUS[t.status][1]} />
                </div>
                <span className="p-meta">
                  {[t.name, companies.join("، ") || "مش مربوط بعميل", formatDate(t.created)].filter(Boolean).join(" · ")}
                  {t.email ? (
                    <>
                      {" · "}
                      <span dir="ltr">{t.email}</span>
                    </>
                  ) : null}
                </span>
                <p className="a-msg">{t.message}</p>
                <TicketReply id={t.id} status={t.status} reply={t.reply} />
              </article>
            );
          })}
        </div>
      ) : (
        <Empty>مفيش تذاكر هنا.</Empty>
      )}
    </>
  );
}
