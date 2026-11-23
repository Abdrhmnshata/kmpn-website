import Link from "next/link";
import { hrSnapshot, isCurrent } from "@/lib/hr/data";
import { Empty, Status } from "@/components/portal/Bits";
import { SourceErrors } from "@/components/admin/AdminBits";
import { EmployeeForm } from "@/components/admin/HrForms";
import { EMPLOYEE_STATUS, departmentLabel, egp, tenure } from "@/lib/hr/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "الفريق · الموارد البشرية" };

/** Everyone on the team, one line each; a line opens its edit form. */
export default async function HrTeamPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const [{ all }, hr] = await Promise.all([searchParams, hrSnapshot({ payroll: false })]);
  const showAll = all === "1";
  const list = showAll ? hr.team : hr.team.filter(isCurrent);
  const hidden = hr.team.length - hr.current.length;
  const total = list.filter(isCurrent).reduce((s, e) => s + e.salary, 0);

  return (
    <>
      <SourceErrors errors={hr.errors} />

      <details className="card p-card h-add">
        <summary>+ ضيف موظف جديد</summary>
        <EmployeeForm />
      </details>

      {list.length ? (
        <div className="a-table h-table">
          <div className="h-tr a-th" aria-hidden="true">
            <span>الاسم</span>
            <span>الوظيفة</span>
            <span className="h-col-dept">القسم</span>
            <span className="h-col-status">الحالة</span>
            <span className="h-col-tenure">معانا من</span>
            <span>المرتب</span>
            <span>الإجازات</span>
          </div>
          <ul className="a-rows">
            {list.map((e) => {
              const [label, tone] = EMPLOYEE_STATUS[e.status] ?? [e.status, "off"];
              const balance = hr.balanceOf(e);
              return (
                <li key={e.id}>
                  <details className="h-row">
                    <summary className="h-tr">
                      <span className="h-name">{e.name}</span>
                      <span className="h-col-pos" dir="auto">{e.position || "—"}</span>
                      <span className="h-col-dept">{departmentLabel(e.department)}</span>
                      <span className="h-col-status">
                        <Status label={label} tone={tone} />
                      </span>
                      <span className="h-col-tenure p-meta">{tenure(e.start, hr.today) || "—"}</span>
                      <span className="num">{e.salary ? egp(e.salary) : "—"}</span>
                      <span className={balance < 3 ? "num h-low" : "num"} title={`${hr.usedBy(e)} من ${e.allowance} اتاخدوا`}>
                        {balance} / {e.allowance}
                      </span>
                    </summary>
                    <div className="h-edit">
                      <EmployeeForm employee={e} />
                      <a href={e.url} target="_blank" rel="noreferrer" className="p-link h-notion">
                        افتح في نوشن ↗
                      </a>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
          <div className="h-tr h-total" aria-label="الإجمالي">
            <span>الإجمالي</span>
            <span className="p-meta">
              <span className="num">{list.filter(isCurrent).length}</span> شخص
            </span>
            <span className="h-col-dept" />
            <span className="h-col-status" />
            <span className="h-col-tenure" />
            <span className="num">{egp(total)}</span>
            <span />
          </div>
        </div>
      ) : (
        <Empty>مفيش حد في الفريق لسه.</Empty>
      )}

      {hidden ? (
        <Link href={showAll ? "/admin/hr/team" : "/admin/hr/team?all=1"} className="p-link a-toggle">
          {showAll ? "اخفي اللي سابوا أو متوقفين" : `اعرض اللي سابوا أو متوقفين (${hidden})`}
        </Link>
      ) : null}
      <p className="p-meta h-foot">
        الإجازات = الرصيد المتبقي من السنوي لسنة {hr.today.slice(0, 4)}. دوس على أي سطر علشان تعدّله.
      </p>
    </>
  );
}
