import Link from "next/link";
import { hrSnapshot } from "@/lib/hr/data";
import { Empty, Status } from "@/components/portal/Bits";
import { SourceErrors, Stat } from "@/components/admin/AdminBits";
import { LeaveAnswer } from "@/components/admin/HrForms";
import { Money } from "@/components/admin/HrBits";
import { CONTRACT, LEAVE_TYPE, dayRange, daysLabel, departmentLabel, egp, monthLabel, shortDate } from "@/lib/hr/labels";
import { CONTRACTS } from "@/lib/hr/notion";

export const dynamic = "force-dynamic";

export default async function HrHome() {
  const hr = await hrSnapshot();
  const { current, pending, offToday, birthdays, payroll, month, employee, errors } = hr;

  const monthRows = payroll.filter((r) => r.month === month);
  const totalNet = monthRows.reduce((s, r) => s + r.net, 0);
  const transferred = monthRows.filter((r) => r.transfer === "Done").length;
  const baseTotal = current.reduce((s, e) => s + e.salary, 0);

  const byType = CONTRACTS.map((t) => [t, current.filter((e) => e.contract === t).length] as const);
  const untyped = current.filter((e) => !(CONTRACTS as readonly string[]).includes(e.contract)).length;
  const typeSummary =
    [
      ...byType.filter(([, n]) => n).map(([t, n]) => `${n} ${CONTRACT[t]}`),
      untyped ? `${untyped} مش متحدد` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "—";

  const departments = new Map<string, number>();
  for (const e of current) departments.set(e.department, (departments.get(e.department) ?? 0) + 1);
  const deptList = [...departments.entries()].sort((a, b) => b[1] - a[1]);
  const maxDept = Math.max(1, ...deptList.map(([, n]) => n));

  const soon = hr.leaves
    .filter((l) => l.status === "Approved" && l.start && l.start > hr.today)
    .sort((a, b) => (a.start! < b.start! ? -1 : 1))
    .slice(0, 5);

  return (
    <>
      <SourceErrors errors={errors} />
      {untyped ? (
        <div className="p-banner h-banner">
          <strong>{untyped === current.length ? "نوع التعاقد لسه مش متحدد لحد." : `${untyped} من الفريق نوع تعاقدهم مش متحدد.`}</strong>{" "}
          حدد كل واحد دوام كامل ولا جزئي ولا متعاقد من{" "}
          <Link href="/admin/hr/team?type=none" className="p-link">
            صفحة الفريق
          </Link>
          .
        </div>
      ) : null}
      <div className="a-stats h-stats">
        <Stat
          label="الفريق"
          value={current.length}
          sub={typeSummary}
          href="/admin/hr/team"
        />
        <Stat
          label="في إجازة النهارده"
          value={offToday.length}
          sub={offToday.map((l) => employee(l.employeeId)?.name).filter(Boolean).join("، ") || "الكل موجود"}
          href="/admin/hr/leaves"
        />
        <Stat
          label="طلبات إجازة مستنية"
          value={pending.length}
          sub={pending.length ? "محتاجة ردّك" : "مفيش حاجة مستنية"}
          href="/admin/hr/leaves"
          alert={pending.length > 0}
        />
        <Stat
          label={`مرتبات ${monthLabel(month)}`}
          value={<Money n={monthRows.length ? totalNet : baseTotal} />}
          sub={
            monthRows.length
              ? `${transferred} من ${monthRows.length} اتحوّلوا`
              : "الأساسي بس · لسه متجهّزتش"
          }
          href="/admin/hr/payroll"
          alert={!monthRows.length}
        />
      </div>

      <div className="p-grid">
        <section className="card p-card">
          <div className="p-card-head">
            <h2>طلبات مستنية ردّك</h2>
            <Link href="/admin/hr/leaves" className="p-link" style={{ fontSize: 14 }}>
              الإجازات ←
            </Link>
          </div>
          {pending.length ? (
            <ul className="p-mini h-mini">
              {pending.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <span>
                    {employee(l.employeeId)?.name ?? "—"}
                    <span className="p-meta">
                      {" "}
                      · {LEAVE_TYPE[l.type]} · {dayRange(l.start, l.end)} · <span className="num">{daysLabel(l.days)}</span>
                    </span>
                  </span>
                  <LeaveAnswer id={l.id} compact />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>مفيش طلبات مستنية.</Empty>
          )}
        </section>

        <section className="card p-card">
          <div className="p-card-head">
            <h2>أعياد الميلاد الجاية</h2>
            <span className="p-meta">الـ 30 يوم الجايين</span>
          </div>
          {birthdays.length ? (
            <ul className="p-mini">
              {birthdays.map((b) => (
                <li key={b.employee.id}>
                  <span>
                    🎂 {b.employee.name}
                    {b.age ? <span className="p-meta"> · هيتم {b.age}</span> : null}
                  </span>
                  <span className="p-meta">
                    {b.inDays === 0 ? <Status label="النهارده" tone="bad" /> : b.inDays === 1 ? "بكرة" : shortDate(b.date)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>مفيش أعياد ميلاد قريبة. (ضيف تاريخ الميلاد من صفحة الفريق)</Empty>
          )}
        </section>

        <section className="card p-card">
          <div className="p-card-head">
            <h2>إجازات جاية</h2>
          </div>
          {soon.length ? (
            <ul className="p-mini">
              {soon.map((l) => (
                <li key={l.id}>
                  <span>
                    {employee(l.employeeId)?.name ?? "—"}
                    <span className="p-meta"> · {LEAVE_TYPE[l.type]}</span>
                  </span>
                  <span className="p-meta">{dayRange(l.start, l.end)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>مفيش إجازات متسجّلة جاية.</Empty>
          )}
        </section>

        <section className="card p-card">
          <div className="p-card-head">
            <h2>الفريق حسب القسم</h2>
            <span className="p-meta">
              الأساسي: <span className="num">{egp(baseTotal)}</span> / شهر
            </span>
          </div>
          <ul className="h-bars">
            {deptList.map(([dept, n]) => (
              <li key={dept || "none"}>
                <span>{dept ? departmentLabel(dept) : "بدون قسم"}</span>
                <span className="h-bar" aria-hidden="true">
                  <span style={{ width: `${(n / maxDept) * 100}%` }} />
                </span>
                <span className="num">{n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
