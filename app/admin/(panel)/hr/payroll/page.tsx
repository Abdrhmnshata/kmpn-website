import Link from "next/link";
import { hrSnapshot, isCurrent } from "@/lib/hr/data";
import { Empty } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { MarkMonth, PayrollRowForm, PrepareMonth } from "@/components/admin/HrForms";
import { Money } from "@/components/admin/HrBits";
import { workingDays } from "@/lib/hr/notion";
import { egp, monthLabel, shiftMonth } from "@/lib/hr/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "المرتبات · الموارد البشرية" };

/** Days of `start..end` that fall in `month` ("YYYY-MM"), Friday and Saturday off. */
function daysIn(month: string, start: string, end: string) {
  const first = `${month}-01`;
  const last = `${shiftMonth(month, 1)}-01`;
  const a = start > first ? start : first;
  const lastDay = new Date(new Date(`${last}T00:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10);
  const b = end < lastDay ? end : lastDay;
  return b >= a ? workingDays(a, b) : 0;
}

export default async function HrPayrollPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const [{ month: asked }, hr] = await Promise.all([searchParams, hrSnapshot()]);
  const month = asked && /^\d{4}-\d{2}$/.test(asked) ? asked : hr.month;
  const rows = hr.payroll
    .filter((r) => r.month === month)
    .map((r) => ({ r, e: hr.employee(r.employeeId) }))
    .sort((a, b) => b.r.base - a.r.base);

  const unpaid = (employeeId: string | null) =>
    hr.leaves
      .filter((l) => l.status === "Approved" && l.type === "Unpaid" && l.employeeId === employeeId && l.start)
      .reduce((s, l) => s + daysIn(month, l.start!, l.end ?? l.start!), 0);

  const covered = new Set(rows.map(({ r }) => r.employeeId?.replace(/-/g, "")));
  const missing = hr.team.filter((e) => isCurrent(e) && e.salary > 0 && !covered.has(e.id.replace(/-/g, "")));

  const sum = (pick: (r: (typeof rows)[number]["r"]) => number) => rows.reduce((s, { r }) => s + pick(r), 0);
  const totals = {
    base: sum((r) => r.base),
    extra: sum((r) => r.bonus + r.overtime),
    cut: sum((r) => (r.base / 30) * r.penaltyDays + r.deductions),
    net: sum((r) => r.net),
  };
  const done = rows.filter(({ r }) => r.transfer === "Done").length;

  return (
    <>
      <SourceErrors errors={hr.errors} />
      <div className="h-month">
        <Link href={`/admin/hr/payroll?month=${shiftMonth(month, -1)}`} className="p-link" aria-label="الشهر اللي فات">
          → {monthLabel(shiftMonth(month, -1))}
        </Link>
        <h2>{monthLabel(month)}</h2>
        <Link href={`/admin/hr/payroll?month=${shiftMonth(month, 1)}`} className="p-link" aria-label="الشهر الجاي">
          {monthLabel(shiftMonth(month, 1))} ←
        </Link>
      </div>

      {rows.length ? (
        <>
          <div className="a-stats h-stats">
            <div className="card a-stat">
              <span className="a-stat-label">الأساسي</span>
              <strong className="num"><Money n={totals.base} /></strong>
            </div>
            <div className="card a-stat">
              <span className="a-stat-label">بونص وأوفرتايم</span>
              <strong className="num"><Money n={totals.extra} sign="+" /></strong>
            </div>
            <div className="card a-stat">
              <span className="a-stat-label">جزاءات وخصومات</span>
              <strong className="num"><Money n={totals.cut} sign="−" /></strong>
            </div>
            <div className="card a-stat a-stat-alert">
              <span className="a-stat-label">الصافي المطلوب تحويله</span>
              <strong className="num"><Money n={totals.net} /></strong>
              <span className="p-meta">
                {done} من {rows.length} اتحوّلوا
              </span>
            </div>
          </div>

          <div className="h-pr-list">
            {rows.map(({ r, e }) => (
              <PayrollRowForm
                key={r.id}
                row={{
                  id: r.id,
                  name: e?.name ?? "—",
                  position: e?.position ?? "",
                  bank: e?.bank ?? "",
                  base: r.base,
                  bonus: r.bonus,
                  overtime: r.overtime,
                  penaltyDays: r.penaltyDays,
                  deductions: r.deductions,
                  transfer: r.transfer,
                  final: r.final,
                  notes: r.notes,
                  unpaidDays: unpaid(r.employeeId),
                }}
              />
            ))}
          </div>

          <div className="h-pr-foot">
            <MarkMonth month={month} />
            {missing.length ? (
              <div className="a-inline">
                <span className="p-meta">مش موجودين في الشهر ده: {missing.map((e) => e.name).join("، ")}</span>
                <PrepareMonth month={month} people={missing.length} />
              </div>
            ) : null}
          </div>
          <p className="p-meta h-foot">
            الصافي = الأساسي + البونص + الأوفرتايم − (الأساسي ÷ 30 × أيام الجزاء) − الخصومات. أيام الجزاء حسب KMPN
            Working Policy (تأخير +15 د = ربع يوم، +30 د = نص يوم، +ساعة = يوم، +ساعتين = يومين).
          </p>
        </>
      ) : (
        <section className="card p-card h-empty-month">
          <h2 className="p-sub">مرتبات {monthLabel(month)} لسه متجهّزتش</h2>
          <p className="p-meta">
            الزرار هيعمل سطر لكل واحد شغّال في الفريق ({missing.length}) بمرتبه الأساسي (
            <span className="num">{egp(missing.reduce((s, e) => s + e.salary, 0))}</span>)، وبعدها تكتب البونص
            والجزاءات وتعلّم على اللي اتحوّل.
          </p>
          {missing.length ? <PrepareMonth month={month} people={missing.length} /> : <Empty>مفيش حد في الفريق بمرتب.</Empty>}
        </section>
      )}
    </>
  );
}
