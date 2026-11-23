"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  CONTRACTS,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  LEAVE_STATUSES,
  LEAVE_TYPES,
  TRANSFERS,
  createEmployee,
  createLeave,
  createPayrollRows,
  decideLeave,
  listPayroll,
  listTeam,
  setTransfer,
  updateEmployee,
  updatePayrollRow,
  workingDays,
  type EmployeeInput,
  type LeaveStatus,
  type LeaveType,
  type Transfer,
} from "@/lib/hr/notion";
import { isCurrent } from "@/lib/hr/data";
import { daysLabel } from "@/lib/hr/labels";
import type { AdminState } from "./actions";

/**
 * The director's HR changes, written to Notion ("KMPN HR"). Every action
 * checks the director again: a server action is a public POST endpoint.
 */

function failure(err: unknown): AdminState {
  const status = (err as { status?: number } | null)?.status;
  if (status === 403) {
    return {
      error:
        "نوشن رفض التعديل: فعّل «Insert content» و«Update content» لـ KMPN Portal من notion.so/profile/integrations.",
    };
  }
  if (status === 404) return { error: "الصف ده مش موجود أو القاعدة مش متوصلة بـ KMPN Portal." };
  console.error("[hr]", err instanceof Error ? err.message : err);
  return { error: "حصل خطأ ومتحفظش. جرّب تاني." };
}

function refresh() {
  revalidateTag("admin-hr");
  revalidatePath("/admin/hr", "layout");
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const amount = (form: FormData, name: string) => {
  const n = Number(field(form, name).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const isoDay = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null);
const oneOf = <T extends string>(list: readonly T[], value: string, fallback: T | "" = ""): T | "" =>
  (list as readonly string[]).includes(value) ? (value as T) : fallback;

function employeeFrom(form: FormData): EmployeeInput | string {
  const name = field(form, "name");
  if (!name) return "اكتب الاسم.";
  const email = field(form, "email").toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "الإيميل مش مظبوط.";
  return {
    name,
    position: field(form, "position"),
    department: oneOf(DEPARTMENTS, field(form, "department")),
    status: oneOf(EMPLOYEE_STATUSES, field(form, "status"), "Active"),
    start: isoDay(field(form, "start")),
    birthday: isoDay(field(form, "birthday")),
    phone: field(form, "phone"),
    email,
    salary: Math.max(0, amount(form, "salary")),
    bank: field(form, "bank"),
    allowance: field(form, "allowance") ? Math.max(0, amount(form, "allowance")) : null,
    contract: oneOf(CONTRACTS, field(form, "contract")),
    notes: field(form, "notes"),
  };
}

export async function saveEmployee(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin({ strict: true });
  const input = employeeFrom(form);
  if (typeof input === "string") return { error: input };
  const id = field(form, "id");
  try {
    if (id) await updateEmployee(id, input);
    else await createEmployee(input);
    refresh();
    return { ok: true, message: id ? "اتحفظ." : `${input.name} اتضاف للفريق.` };
  } catch (err) {
    return failure(err);
  }
}

export async function addLeave(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin({ strict: true });
  const start = isoDay(field(form, "start"));
  const end = isoDay(field(form, "end")) ?? start;
  const type = oneOf(LEAVE_TYPES, field(form, "type"), "Annual") as LeaveType;
  if (!start || !end) return { error: "اختار تاريخ البداية." };
  if (end < start) return { error: "تاريخ النهاية قبل البداية." };
  const days = workingDays(start, end);
  if (!days) return { error: "الأيام دي كلها جمعة وسبت." };
  try {
    const team = await listTeam();
    const employee = team.find((e) => e.id.replace(/-/g, "") === field(form, "employee").replace(/-/g, ""));
    if (!employee) return { error: "اختار الموظف." };
    const status: LeaveStatus = field(form, "approve") === "1" ? "Approved" : "Pending";
    await createLeave({ employee, type, start, end, days, reason: field(form, "reason"), status });
    refresh();
    return {
      ok: true,
      message: `اتسجّلت ${daysLabel(days)} لـ ${employee.name}${status === "Approved" ? " وموافَق عليها" : ""}.`,
    };
  } catch (err) {
    return failure(err);
  }
}

export async function answerLeave(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin({ strict: true });
  const id = field(form, "leave");
  const status = oneOf(LEAVE_STATUSES, field(form, "status")) as LeaveStatus | "";
  if (!id || !status) return { error: "اختار موافقة أو رفض." };
  try {
    await decideLeave(id, status, field(form, "reply").slice(0, 2000));
    refresh();
    return { ok: true, message: status === "Approved" ? "اتوافق عليها." : status === "Rejected" ? "اترفضت." : "اتحفظ." };
  } catch (err) {
    return failure(err);
  }
}

export async function prepareMonth(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin({ strict: true });
  const month = field(form, "month");
  if (!/^\d{4}-\d{2}$/.test(month)) return { error: "الشهر مش مظبوط." };
  try {
    const [team, payroll] = await Promise.all([listTeam(), listPayroll()]);
    const done = new Set(payroll.filter((r) => r.month === month).map((r) => r.employeeId?.replace(/-/g, "")));
    const people = team.filter((e) => isCurrent(e) && e.salary > 0 && !done.has(e.id.replace(/-/g, "")));
    if (!people.length) return { ok: true, message: "كل الفريق متجهّز في الشهر ده بالفعل." };
    await createPayrollRows(month, people);
    refresh();
    return { ok: true, message: `اتجهّز ${people.length} سطر مرتب.` };
  } catch (err) {
    refresh();
    return failure(err);
  }
}

export async function savePayrollRow(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin({ strict: true });
  const id = field(form, "row");
  if (!id) return { error: "السطر ده مش موجود." };
  try {
    await updatePayrollRow(id, {
      bonus: Math.max(0, amount(form, "bonus")),
      overtime: Math.max(0, amount(form, "overtime")),
      penaltyDays: Math.max(0, amount(form, "penaltyDays")),
      deductions: Math.max(0, amount(form, "deductions")),
      transfer: (oneOf(TRANSFERS, field(form, "transfer"), "Not started") || "Not started") as Transfer,
      final: field(form, "final") === "1",
      notes: field(form, "notes"),
    });
    refresh();
    return { ok: true, message: "اتحفظ." };
  } catch (err) {
    return failure(err);
  }
}

/** Marks every row of a month as transferred (or submitted to the bank). */
export async function markMonth(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin({ strict: true });
  const month = field(form, "month");
  const transfer = (oneOf(TRANSFERS, field(form, "transfer")) || "Done") as Transfer;
  try {
    const rows = (await listPayroll()).filter((r) => r.month === month && r.transfer !== transfer);
    for (const r of rows) await setTransfer(r.id, transfer);
    refresh();
    return { ok: true, message: rows.length ? `اتعلّم على ${rows.length} سطر.` : "كله متعلّم عليه بالفعل." };
  } catch (err) {
    refresh();
    return failure(err);
  }
}
