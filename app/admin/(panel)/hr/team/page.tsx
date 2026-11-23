import Link from "next/link";
import { hrSnapshot, isCurrent } from "@/lib/hr/data";
import { Empty, Status } from "@/components/portal/Bits";
import { Filters, SourceErrors } from "@/components/admin/AdminBits";
import { EmployeeForm } from "@/components/admin/HrForms";
import { CONTRACT, CONTRACT_KEY, EMPLOYEE_STATUS, contractLabel, departmentLabel, egp, tenure } from "@/lib/hr/labels";
import { CONTRACTS } from "@/lib/hr/notion";

export const dynamic = "force-dynamic";
export const metadata = { title: "الفريق · الموارد البشرية" };

/** Everyone on the team, one line each; a line opens its edit form. */
export default async function HrTeamPage({ searchParams }: { searchParams: Promise<{ all?: string; type?: string }> }) {
  const [{ all, type = "all" }, hr] = await Promise.all([searchParams, hrSnapshot({ payroll: false })]);
  const showAll = all === "1";
  const people = showAll ? hr.team : hr.team.filter(isCurrent);
  const keyOf = (contract: string) => CONTRACT_KEY[contract] ?? "none";
  const active = [...Object.values(CONTRACT_KEY), "none"].includes(type) ? type : "all";
  const list = active === "all" ? people : people.filter((e) => keyOf(e.contract) === active);
  const untyped = people.filter((e) => keyOf(e.contract) === "none").length;
  const hidden = hr.team.length - hr.current.length;
  const total = list.filter(isCurrent).reduce((s, e) => s + e.salary, 0);

  return (
    <>
      <SourceErrors errors={hr.errors} />

      <details className="card p-card h-add">
        <summary>+ ضيف موظف جديد</summary>
        <EmployeeForm />
      </details>

      <Filters
        base="/admin/hr/team"
        param="type"
        active={active}
        items={[
          { key: "all", label: "الكل", count: people.length },
          ...CONTRACTS.map((t) => ({
            key: CONTRACT_KEY[t],
            label: CONTRACT[t],
            count: people.filter((e) => e.contract === t).length,
          })),
          ...(untyped ? [{ key: "none", label: "مش متحدد", count: untyped }] : []),
        ]}
      />

      {list.length ? (
        <div className="a-table h-table">
          <div className="h-tr a-th" aria-hidden="true">
            <span>الاسم</span>
            <span>الوظيفة</span>
            <span className="h-col-type">النوع</span>
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
                      <span className="h-col-type">
                        <span className={`h-type h-type-${keyOf(e.contract)}`}>{contractLabel(e.contract)}</span>
                      </span>
                      <span className="h-col-dept">{departmentLabel(e.department)}</span>
                      <span className="h-col-status">
                        <Status label={label} tone={tone} />
                      </span>
                      <span className="h-col-tenure p-meta">{tenure(e.start, hr.today) || "—"}</span>
                      <span className="num">{e.salary ? egp(e.salary) : "—"}</span>
                      {balance === null ? (
                        <span className="p-meta" title={e.allowanceWhy}>
                          —
                        </span>
                      ) : (
                        <span
                          className={balance < 3 ? "num h-low" : "num"}
                          title={`${hr.usedBy(e)} من ${e.allowance} اتاخدوا · ${e.allowanceWhy}`}
                        >
                          {balance} / {e.allowance}
                        </span>
                      )}
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
            <span className="h-col-type" />
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
        الإجازات = الرصيد المتبقي من السنوي لسنة {hr.today.slice(0, 4)} للدوام الكامل، محسوب من تاريخ التعيين حسب قانون
        العمل (م 124): مفيش قبل 6 شهور، وبعدها بنسبة المدة من 15 يوم، و21 يوم من تاني سنة، و30 بعد 10 سنين أو فوق الـ 50.
        العارضة بتتخصم منه. «—» يعني مش دوام كامل أو ناقص تاريخ التعيين. دوس على أي سطر علشان تعدّله.
      </p>
    </>
  );
}
