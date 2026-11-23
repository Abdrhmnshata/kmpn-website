"use client";

import { useActionState, useState } from "react";
import type { AdminState } from "@/app/admin/actions";
import {
  addLeave,
  answerLeave,
  markMonth,
  prepareMonth,
  saveEmployee,
  savePayrollRow,
} from "@/app/admin/hr-actions";
import { Notice, Submit } from "@/components/portal/FormBits";
import { CONTRACT, DEPARTMENT, EMPLOYEE_STATUS, LEAVE_TYPE, TRANSFER, daysLabel, egp } from "@/lib/hr/labels";

/** The director's HR forms on /admin/hr; each writes to Notion. */

function Result({ state }: { state: AdminState }) {
  return <Notice error={state.error} message={state.ok ? state.message : undefined} />;
}

/* --------------------------------------------------------------- team ---- */

export type EmployeeFields = {
  id?: string;
  name?: string;
  position?: string;
  department?: string;
  status?: string;
  start?: string | null;
  birthday?: string | null;
  phone?: string;
  email?: string;
  salary?: number;
  bank?: string;
  /** This year's annual leave as worked out (law or set by hand). */
  allowance?: number | null;
  allowanceWhy?: string;
  /** The number set by hand in Notion; empty = follow the law. */
  allowanceSet?: number | null;
  contract?: string;
  notes?: string;
};

function Labelled({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? "h-field h-field-wide" : "h-field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Options({ map, empty }: { map: Record<string, string | [string, string]>; empty?: string }) {
  return (
    <>
      {empty !== undefined ? <option value="">{empty}</option> : null}
      {Object.entries(map).map(([value, label]) => (
        <option key={value} value={value}>
          {Array.isArray(label) ? label[0] : label}
        </option>
      ))}
    </>
  );
}

/** Add a person (no id) or edit one. */
export function EmployeeForm({ employee = {} }: { employee?: EmployeeFields }) {
  const [state, action] = useActionState<AdminState, FormData>(saveEmployee, {});
  const e = employee;
  return (
    <form action={action} className="h-form">
      {e.id ? <input type="hidden" name="id" value={e.id} /> : null}
      <div className="h-fields">
        <Labelled label="الاسم">
          <input name="name" className="field" defaultValue={e.name} required />
        </Labelled>
        <Labelled label="الوظيفة">
          <input name="position" className="field" defaultValue={e.position} dir="auto" />
        </Labelled>
        <Labelled label="القسم">
          <select name="department" className="field" defaultValue={e.department ?? ""}>
            <Options map={DEPARTMENT} empty="—" />
          </select>
        </Labelled>
        <Labelled label="الحالة">
          <select name="status" className="field" defaultValue={e.status ?? "Active"}>
            <Options map={EMPLOYEE_STATUS} />
          </select>
        </Labelled>
        <Labelled label="المرتب الأساسي (ج.م)">
          <input name="salary" className="field num" inputMode="numeric" defaultValue={e.salary || ""} dir="ltr" />
        </Labelled>
        <Labelled label="البنك">
          <input name="bank" className="field" defaultValue={e.bank} dir="auto" />
        </Labelled>
        <Labelled label="تاريخ التعيين">
          <input name="start" type="date" className="field" defaultValue={e.start ?? ""} />
        </Labelled>
        <Labelled label="عيد الميلاد">
          <input name="birthday" type="date" className="field" defaultValue={e.birthday ?? ""} />
        </Labelled>
        <Labelled label="رصيد الإجازات السنوي">
          <input
            name="allowance"
            className="field num"
            inputMode="numeric"
            defaultValue={e.allowanceSet ?? ""}
            placeholder={e.allowanceSet == null && e.allowance != null ? `حسب القانون: ${e.allowance}` : "حسب القانون"}
            title="سيبه فاضي يتحسب من تاريخ التعيين (قانون العمل م 124). اكتب رقم أكبر بس لو متفق على أكتر، أو 45 لذوي الإعاقة."
            dir="auto"
          />
        </Labelled>
        <Labelled label="نوع التعاقد">
          <select name="contract" className="field" defaultValue={e.id ? (e.contract ?? "") : "Full-time"}>
            <Options map={CONTRACT} empty="—" />
          </select>
        </Labelled>
        <Labelled label="الموبايل">
          <input name="phone" type="tel" className="field" defaultValue={e.phone} dir="ltr" />
        </Labelled>
        <Labelled label="الإيميل">
          <input name="email" type="email" className="field" defaultValue={e.email} dir="ltr" />
        </Labelled>
        <Labelled label="ملاحظات" wide>
          <input name="notes" className="field" defaultValue={e.notes} dir="auto" />
        </Labelled>
      </div>
      <div className="a-inline">
        <Submit pending="جارٍ الحفظ…">{e.id ? "احفظ" : "ضيف للفريق"}</Submit>
      </div>
      <Result state={state} />
    </form>
  );
}

/* ------------------------------------------------------------- leaves ---- */

const WEEKEND = new Set([5, 6]);
function countDays(start: string, end: string) {
  if (!start) return 0;
  const a = new Date(`${start}T00:00:00Z`);
  const b = new Date(`${(end || start)}T00:00:00Z`);
  if (b < a) return 0;
  let n = 0;
  for (const d = new Date(a); d <= b && n < 400; d.setUTCDate(d.getUTCDate() + 1)) if (!WEEKEND.has(d.getUTCDay())) n++;
  return n;
}

/** Record a leave for someone; ticked «وافق علطول» saves it as approved. */
export function LeaveForm({
  team,
  today,
}: {
  team: { id: string; name: string; balance: number | null; note: string }[];
  today: string;
}) {
  const [state, action] = useActionState<AdminState, FormData>(addLeave, {});
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [who, setWho] = useState("");
  const days = countDays(start, end);
  const person = team.find((t) => t.id === who);
  return (
    <form action={action} className="h-form" key={state.ok ? state.message : "form"}>
      <div className="h-fields">
        <Labelled label="الموظف">
          <select name="employee" className="field" required value={who} onChange={(e) => setWho(e.target.value)}>
            <option value="" disabled>
              اختار…
            </option>
            {team.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Labelled>
        <Labelled label="النوع">
          <select name="type" className="field" defaultValue="Annual">
            <Options map={LEAVE_TYPE} />
          </select>
        </Labelled>
        <Labelled label="من">
          <input
            name="start"
            type="date"
            className="field"
            required
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (end < e.target.value) setEnd(e.target.value);
            }}
          />
        </Labelled>
        <Labelled label="لحد">
          <input name="end" type="date" className="field" min={start} value={end} onChange={(e) => setEnd(e.target.value)} />
        </Labelled>
        <Labelled label="السبب" wide>
          <input name="reason" className="field" dir="auto" placeholder="اختياري" />
        </Labelled>
      </div>
      <p className="p-meta">
        <span className="num">{daysLabel(days)}</span> شغل (من غير الجمعة والسبت)
        {person ? (
          <>
            {" "}
            · رصيد {person.name}:{" "}
            {person.balance === null ? (
              person.note
            ) : (
              <>
                <span className="num">{person.balance}</span> يوم
              </>
            )}
          </>
        ) : null}
      </p>
      <div className="a-inline">
        <label className="a-check">
          <input type="checkbox" name="approve" value="1" defaultChecked />
          <span>وافق علطول</span>
        </label>
        <Submit pending="جارٍ الحفظ…">سجّل الإجازة</Submit>
      </div>
      <Result state={state} />
    </form>
  );
}

/** Approve or reject a pending request, with an optional note. */
export function LeaveAnswer({ id, compact }: { id: string; compact?: boolean }) {
  const [state, action] = useActionState<AdminState, FormData>(answerLeave, {});
  if (state.ok) return <Result state={state} />;
  return (
    <form action={action} className="h-answer">
      <input type="hidden" name="leave" value={id} />
      {compact ? null : <input name="reply" className="field a-email" placeholder="ملاحظة (اختياري)" dir="auto" />}
      <button type="submit" name="status" value="Approved" className="btn-primary p-submit h-btn">
        وافق
      </button>
      <button type="submit" name="status" value="Rejected" className="btn-outline p-submit h-btn">
        ارفض
      </button>
      <Result state={state} />
    </form>
  );
}

/* ------------------------------------------------------------ payroll ---- */

export function PrepareMonth({ month, people }: { month: string; people: number }) {
  const [state, action] = useActionState<AdminState, FormData>(prepareMonth, {});
  return (
    <form action={action} className="a-inline">
      <input type="hidden" name="month" value={month} />
      <Submit pending="جارٍ التجهيز…">جهّز مرتبات الشهر ({people})</Submit>
      <Result state={state} />
    </form>
  );
}

export function MarkMonth({ month }: { month: string }) {
  const [state, action] = useActionState<AdminState, FormData>(markMonth, {});
  return (
    <form action={action} className="a-inline">
      <input type="hidden" name="month" value={month} />
      <button type="submit" name="transfer" value="Submitted to bank" className="btn-outline p-submit h-btn">
        الكل في البنك
      </button>
      <button type="submit" name="transfer" value="Done" className="btn-primary p-submit h-btn">
        الكل اتحوّل
      </button>
      <Result state={state} />
    </form>
  );
}

export type PayrollFields = {
  id: string;
  name: string;
  position: string;
  bank: string;
  /** Employment type label (دوام كامل / دوام جزئي / متعاقد). */
  type: string;
  base: number;
  bonus: number;
  overtime: number;
  penaltyDays: number;
  deductions: number;
  transfer: string;
  final: boolean;
  notes: string;
  /** Approved unpaid leave days that month, shown as a hint. */
  unpaidDays: number;
};

const toNum = (v: string) => {
  const n = Number(v.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** One person's line for the month; the net updates as you type. */
export function PayrollRowForm({ row }: { row: PayrollFields }) {
  const [state, action] = useActionState<AdminState, FormData>(savePayrollRow, {});
  const [v, setV] = useState({
    bonus: String(row.bonus || ""),
    overtime: String(row.overtime || ""),
    penaltyDays: String(row.penaltyDays || ""),
    deductions: String(row.deductions || ""),
  });
  const net = Math.round(
    row.base + toNum(v.bonus) + toNum(v.overtime) - (row.base / 30) * toNum(v.penaltyDays) - toNum(v.deductions),
  );
  const input = (name: keyof typeof v, label: string) => (
    <label className="h-cell">
      <span className="h-cell-label">{label}</span>
      <input
        name={name}
        className="field num"
        inputMode="decimal"
        dir="ltr"
        placeholder="0"
        value={v[name]}
        onChange={(e) => setV({ ...v, [name]: e.target.value })}
      />
    </label>
  );
  return (
    <form action={action} className="h-pr">
      <input type="hidden" name="row" value={row.id} />
      <div className="h-pr-who">
        <strong>{row.name}</strong>
        <span className="p-meta">
          {[row.type, row.position, row.bank].filter(Boolean).join(" · ")}
          {row.unpaidDays ? (
            <span className="h-hint">
              {" "}
              · {row.unpaidDays} يوم بدون مرتب ≈ {egp((row.base / 30) * row.unpaidDays)}
            </span>
          ) : null}
        </span>
      </div>
      <span className="h-cell">
        <span className="h-cell-label">الأساسي</span>
        <span className="num h-base">{egp(row.base)}</span>
      </span>
      {input("bonus", "بونص")}
      {input("overtime", "أوفرتايم")}
      {input("penaltyDays", "أيام جزاء")}
      {input("deductions", "خصومات")}
      <span className="h-cell">
        <span className="h-cell-label">الصافي</span>
        <strong className="num h-net">{egp(net)}</strong>
      </span>
      <label className="h-cell">
        <span className="h-cell-label">التحويل</span>
        <select name="transfer" className="field" defaultValue={row.transfer}>
          <Options map={TRANSFER} />
        </select>
      </label>
      <div className="h-pr-save">
        <label className="h-final" title="نهائي">
          <input type="checkbox" name="final" value="1" defaultChecked={row.final} />
          <span>نهائي</span>
        </label>
        <input type="hidden" name="notes" value={row.notes} />
        <Submit pending="…" variant="outline">
          احفظ
        </Submit>
      </div>
      {state.error || state.ok ? (
        <div className="h-pr-note">
          <Result state={state} />
        </div>
      ) : null}
    </form>
  );
}
