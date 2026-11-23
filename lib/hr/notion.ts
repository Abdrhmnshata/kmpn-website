import "server-only";
import { notionCall, notionQuery, type NotionPage, type NotionProp } from "@/lib/portal/notion";

/**
 * KMPN's HR data, read and written in Notion ("KMPN HR" under the
 * director-only Client Portal page, so the KMPN Portal integration reaches it):
 *
 *   team     "HR - Team": one row per person, with base salary and leave allowance;
 *   leaves   "HR - Leaves": one row per request (Pending / Approved / Rejected);
 *   payroll  "HR - Payroll": one row per person per month ("YYYY-MM").
 *
 * Writes need the integration's "Insert content" and "Update content".
 */

const DS = {
  team: process.env.NOTION_HR_TEAM_DS ?? "421c45aa-cc37-8119-964a-000ba08cb031",
  leaves: process.env.NOTION_HR_LEAVES_DS ?? "421c45aa-cc37-8128-aff0-000bf0c2dc0f",
  payroll: process.env.NOTION_HR_PAYROLL_DS ?? "421c45aa-cc37-8196-910a-000b1dbc5f33",
};

/* -------------------------------------------------------------- types ---- */

export const DEPARTMENTS = [
  "Management",
  "Account Management",
  "Performance",
  "Content",
  "Design",
  "Video",
  "Shopify",
  "Accounting",
] as const;
export const EMPLOYEE_STATUSES = ["Active", "Probation", "On hold", "Left"] as const;
export const CONTRACTS = ["Full-time", "Part-time", "Freelance", "Intern"] as const;
export const LEAVE_TYPES = ["Annual", "Sick", "Unpaid", "Emergency", "Remote"] as const;
export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export const TRANSFERS = ["Not started", "Submitted to bank", "Done"] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];
export type Transfer = (typeof TRANSFERS)[number];

export type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  start: string | null;
  birthday: string | null;
  phone: string;
  email: string;
  salary: number;
  bank: string;
  /** Annual leave days a year; 21 when left empty. */
  allowance: number;
  contract: string;
  notes: string;
  url: string;
};

export type Leave = {
  id: string;
  employeeId: string | null;
  type: LeaveType;
  start: string | null;
  end: string | null;
  days: number;
  status: LeaveStatus;
  reason: string;
  reply: string;
  created: string;
};

export type PayrollRow = {
  id: string;
  employeeId: string | null;
  month: string;
  base: number;
  bonus: number;
  overtime: number;
  penaltyDays: number;
  deductions: number;
  net: number;
  final: boolean;
  transfer: Transfer;
  notes: string;
};

/* ------------------------------------------------------------ helpers ---- */

function prop(page: NotionPage, name: string): NotionProp | undefined {
  if (name === "title") return Object.values(page.properties).find((p) => p.type === "title");
  const key = Object.keys(page.properties).find((k) => k.trim() === name);
  return key ? page.properties[key] : undefined;
}

const text = (p?: NotionProp) =>
  (p?.title ?? p?.rich_text ?? [])
    .map((t) => t.plain_text)
    .join("")
    .trim();
const choice = (p?: NotionProp) => p?.select?.name ?? p?.status?.name ?? "";
const num = (p?: NotionProp) => (typeof p?.number === "number" ? p.number : 0);
const day = (p?: NotionProp) => p?.date?.start?.slice(0, 10) ?? null;
const pick = <T extends string>(list: readonly T[], raw: string, fallback: T): T =>
  (list as readonly string[]).includes(raw) ? (raw as T) : fallback;

const dashed = (id: string) => {
  const hex = id.replace(/-/g, "");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/** Net pay: base + bonus + overtime − a day's pay (base ÷ 30) per penalty day − deductions. */
export const netPay = (r: Pick<PayrollRow, "base" | "bonus" | "overtime" | "penaltyDays" | "deductions">) =>
  Math.round(r.base + r.bonus + r.overtime - (r.base / 30) * r.penaltyDays - r.deductions);

/* --------------------------------------------------------------- read ---- */

function toEmployee(row: NotionPage & { url?: string }): Employee {
  return {
    id: row.id,
    name: text(prop(row, "title")) || "بدون اسم",
    position: text(prop(row, "Position")),
    department: choice(prop(row, "Department")),
    status: choice(prop(row, "Status")) || "Active",
    start: day(prop(row, "Start date")),
    birthday: day(prop(row, "Birthday")),
    phone: (prop(row, "Phone") as { phone_number?: string | null } | undefined)?.phone_number ?? "",
    email: prop(row, "Email")?.email ?? "",
    salary: num(prop(row, "Base salary")),
    bank: text(prop(row, "Bank")),
    allowance: typeof prop(row, "Annual leave")?.number === "number" ? num(prop(row, "Annual leave")) : 21,
    contract: choice(prop(row, "Contract")),
    notes: text(prop(row, "Notes")),
    url: row.url ?? `https://www.notion.so/${row.id.replace(/-/g, "")}`,
  };
}

export async function listTeam(): Promise<Employee[]> {
  const rows = await notionQuery(DS.team, {
    sorts: [{ property: "Base salary", direction: "descending" }],
  });
  return rows.map(toEmployee);
}

export async function listLeaves(): Promise<Leave[]> {
  const rows = await notionQuery(DS.leaves, {
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });
  return rows.map((row) => {
    const dates = prop(row, "Dates")?.date;
    const start = dates?.start?.slice(0, 10) ?? null;
    const end = dates?.end?.slice(0, 10) ?? start;
    return {
      id: row.id,
      employeeId: prop(row, "Employee")?.relation?.[0]?.id ?? null,
      type: pick(LEAVE_TYPES, choice(prop(row, "Type")), "Annual"),
      start,
      end,
      days: num(prop(row, "Days")) || (start ? workingDays(start, end ?? start) : 0),
      status: pick(LEAVE_STATUSES, choice(prop(row, "Status")), "Pending"),
      reason: text(prop(row, "Reason")),
      reply: text(prop(row, "Reply")),
      created: row.created_time,
    };
  });
}

export async function listPayroll(): Promise<PayrollRow[]> {
  const rows = await notionQuery(DS.payroll);
  return rows.map((row) => {
    const r = {
      base: num(prop(row, "Base")),
      bonus: num(prop(row, "Bonus")),
      overtime: num(prop(row, "Overtime")),
      penaltyDays: num(prop(row, "Penalty days")),
      deductions: num(prop(row, "Deductions")),
    };
    return {
      id: row.id,
      employeeId: prop(row, "Employee")?.relation?.[0]?.id ?? null,
      month: text(prop(row, "Month")),
      ...r,
      net: netPay(r),
      final: choice(prop(row, "Status")) === "Final",
      transfer: pick(TRANSFERS, choice(prop(row, "Transfer")), "Not started"),
      notes: text(prop(row, "Notes")),
    };
  });
}

/* -------------------------------------------------------------- dates ---- */

/** Today in Cairo, "YYYY-MM-DD". */
export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date());

/** This month in Cairo, "YYYY-MM". */
export const thisMonth = () => today().slice(0, 7);

/**
 * Working days from `start` to `end`, both included. KMPN works Sunday to
 * Thursday (Saturday is the management day), so Friday and Saturday don't count.
 */
export function workingDays(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00Z`);
  const b = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  let count = 0;
  for (const d = new Date(a); d <= b && count < 400; d.setUTCDate(d.getUTCDate() + 1)) {
    const weekday = d.getUTCDay();
    if (weekday !== 5 && weekday !== 6) count++;
  }
  return count;
}

/* -------------------------------------------------------------- write ---- */

const rich = (value: string) => ({
  rich_text: value ? [{ type: "text", text: { content: value.slice(0, 2000) } }] : [],
});
const title = (value: string) => ({ title: [{ type: "text", text: { content: value.slice(0, 200) } }] });
const select = (value: string) => ({ select: value ? { name: value } : null });
const date = (value: string | null) => ({ date: value ? { start: value } : null });

export type EmployeeInput = {
  name: string;
  position: string;
  department: string;
  status: string;
  start: string | null;
  birthday: string | null;
  phone: string;
  email: string;
  salary: number;
  bank: string;
  allowance: number;
  contract: string;
  notes: string;
};

function employeeProps(e: EmployeeInput) {
  return {
    Name: title(e.name),
    Position: rich(e.position),
    Department: select(e.department),
    Status: select(e.status),
    "Start date": date(e.start),
    Birthday: date(e.birthday),
    Phone: { phone_number: e.phone || null },
    Email: { email: e.email || null },
    "Base salary": { number: e.salary },
    Bank: rich(e.bank),
    "Annual leave": { number: e.allowance },
    Contract: select(e.contract),
    Notes: rich(e.notes),
  };
}

export async function createEmployee(e: EmployeeInput) {
  await notionCall("pages", {
    parent: { type: "data_source_id", data_source_id: DS.team },
    properties: employeeProps(e),
  });
}

export async function updateEmployee(id: string, e: EmployeeInput) {
  await notionCall(`pages/${dashed(id)}`, { properties: employeeProps(e) }, "PATCH");
}

export async function createLeave(input: {
  employee: Employee;
  type: LeaveType;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}) {
  const label: Record<LeaveType, string> = {
    Annual: "Annual leave",
    Sick: "Sick leave",
    Unpaid: "Unpaid leave",
    Emergency: "Emergency leave",
    Remote: "Remote day",
  };
  await notionCall("pages", {
    parent: { type: "data_source_id", data_source_id: DS.leaves },
    properties: {
      Request: title(`${input.employee.name} · ${label[input.type]}`),
      Employee: { relation: [{ id: input.employee.id }] },
      Type: select(input.type),
      Dates: { date: { start: input.start, end: input.end !== input.start ? input.end : null } },
      Days: { number: input.days },
      Status: select(input.status),
      Reason: rich(input.reason),
    },
  });
}

export async function decideLeave(id: string, status: LeaveStatus, reply: string) {
  await notionCall(
    `pages/${dashed(id)}`,
    { properties: { Status: select(status), Reply: rich(reply) } },
    "PATCH",
  );
}

/** One Draft payroll row per person, at their current base salary. */
export async function createPayrollRows(month: string, people: Employee[]) {
  for (const person of people) {
    await notionCall("pages", {
      parent: { type: "data_source_id", data_source_id: DS.payroll },
      properties: {
        Entry: title(`${person.name} · ${month}`),
        Employee: { relation: [{ id: person.id }] },
        Month: rich(month),
        Base: { number: person.salary },
        Bonus: { number: 0 },
        Overtime: { number: 0 },
        "Penalty days": { number: 0 },
        Deductions: { number: 0 },
        Status: select("Draft"),
        Transfer: select("Not started"),
      },
    });
  }
}

export async function updatePayrollRow(
  id: string,
  r: { bonus: number; overtime: number; penaltyDays: number; deductions: number; transfer: Transfer; final: boolean; notes: string },
) {
  await notionCall(
    `pages/${dashed(id)}`,
    {
      properties: {
        Bonus: { number: r.bonus },
        Overtime: { number: r.overtime },
        "Penalty days": { number: r.penaltyDays },
        Deductions: { number: r.deductions },
        Transfer: select(r.transfer),
        Status: select(r.final ? "Final" : "Draft"),
        Notes: rich(r.notes),
      },
    },
    "PATCH",
  );
}

export async function setTransfer(id: string, transfer: Transfer) {
  await notionCall(`pages/${dashed(id)}`, { properties: { Transfer: select(transfer) } }, "PATCH");
}
