import { hrSnapshot } from "@/lib/hr/data";
import { Empty, Status } from "@/components/portal/Bits";
import { Filters, SourceErrors } from "@/components/admin/AdminBits";
import { LeaveAnswer, LeaveForm } from "@/components/admin/HrForms";
import { LEAVE_STATUSES, type LeaveStatus } from "@/lib/hr/notion";
import { LEAVE_STATUS, LEAVE_TYPE, dayRange, daysLabel } from "@/lib/hr/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإجازات · الموارد البشرية" };

export default async function HrLeavesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ status = "all" }, hr] = await Promise.all([searchParams, hrSnapshot({ payroll: false })]);
  const active = (LEAVE_STATUSES as readonly string[]).includes(status) ? status : "all";
  const list = hr.leaves.filter((l) => active === "all" || l.status === active);
  const team = hr.current.map((e) => ({ id: e.id, name: e.name, balance: hr.balanceOf(e), note: e.allowanceWhy }));
  const withLeave = hr.current.filter((e) => e.getsLeave);

  return (
    <>
      <SourceErrors errors={hr.errors} />
      <div className="p-split h-split">
        <section className="card p-card">
          <div className="p-card-head">
            <h2>سجّل إجازة</h2>
          </div>
          <LeaveForm team={team} today={hr.today} />
        </section>

        <section className="card p-card">
          <div className="p-card-head">
            <h2>رصيد الإجازات السنوية</h2>
            <span className="p-meta">{hr.today.slice(0, 4)}</span>
          </div>
          <ul className="p-mini h-balance">
            {withLeave.map((e) => {
              const left = hr.balanceOf(e);
              const pct = left !== null && e.allowance ? Math.max(0, Math.min(100, (left / e.allowance) * 100)) : 0;
              return (
                <li key={e.id} title={e.allowanceWhy}>
                  <span>{e.name}</span>
                  <span className="h-bar" aria-hidden="true">
                    <span className={pct < 20 ? "h-bar-low" : pct < 50 ? "h-bar-mid" : ""} style={{ width: `${pct}%` }} />
                  </span>
                  {left === null ? (
                    <span className="p-meta">ناقص تاريخ التعيين</span>
                  ) : (
                    <span className="num p-meta">
                      {left} / {e.allowance}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <h2 className="p-sub h-title">الطلبات</h2>
      <Filters
        base="/admin/hr/leaves"
        param="status"
        active={active}
        items={[
          { key: "all", label: "الكل", count: hr.leaves.length },
          ...LEAVE_STATUSES.map((s) => ({
            key: s,
            label: LEAVE_STATUS[s][0],
            count: hr.leaves.filter((l) => l.status === s).length,
          })),
        ]}
      />
      {list.length ? (
        <div className="p-list">
          {list.map((l) => {
            const [label, tone] = LEAVE_STATUS[l.status as LeaveStatus];
            return (
              <article key={l.id} className="card p-row h-leave">
                <div className="p-row-main">
                  <h2>
                    {hr.employee(l.employeeId)?.name ?? "—"} <span className="p-meta">· {LEAVE_TYPE[l.type]}</span>
                  </h2>
                  <p>
                    {dayRange(l.start, l.end)} · <span className="num">{daysLabel(l.days)}</span>
                    {l.reason ? ` · ${l.reason}` : ""}
                  </p>
                  {l.reply ? <p className="p-meta">ردّك: {l.reply}</p> : null}
                </div>
                <div className="p-row-side">
                  {l.status === "Pending" ? <LeaveAnswer id={l.id} /> : <Status label={label} tone={tone} />}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty>مفيش طلبات هنا.</Empty>
      )}
    </>
  );
}
