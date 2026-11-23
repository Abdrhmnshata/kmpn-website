import type { Tone } from "@/lib/portal/format";

/** Notion option names (English) → what the director reads on /admin/hr. */

type Label = [string, Tone];

export const DEPARTMENT: Record<string, string> = {
  Management: "الإدارة",
  "Account Management": "إدارة الحسابات",
  Performance: "التسويق بالأداء",
  Content: "المحتوى",
  Design: "التصميم",
  Video: "الفيديو",
  Shopify: "شوبيفاي",
  Accounting: "الحسابات",
};

export const EMPLOYEE_STATUS: Record<string, Label> = {
  Active: ["شغّال", "ok"],
  Probation: ["فترة اختبار", "warn"],
  "On hold": ["متوقف", "off"],
  Left: ["ساب الشركة", "off"],
};

/** Employment type: full-time, part-time or on a contract. */
export const CONTRACT: Record<string, string> = {
  "Full-time": "دوام كامل",
  "Part-time": "دوام جزئي",
  Contract: "متعاقد",
};

/** Filter keys for ?type= on the team page. */
export const CONTRACT_KEY: Record<string, string> = { "Full-time": "full", "Part-time": "part", Contract: "contract" };

export const contractLabel = (raw: string) => CONTRACT[raw] ?? "مش متحدد";

export const LEAVE_TYPE: Record<string, string> = {
  Annual: "سنوية",
  Sick: "مرضي",
  Unpaid: "بدون مرتب",
  Emergency: "عارضة",
  Remote: "شغل من البيت",
};

export const LEAVE_STATUS: Record<string, Label> = {
  Pending: ["مستنية ردّك", "warn"],
  Approved: ["موافَق عليها", "ok"],
  Rejected: ["مرفوضة", "bad"],
};

export const TRANSFER: Record<string, Label> = {
  "Not started": ["لسه", "off"],
  "Submitted to bank": ["في البنك", "info"],
  Done: ["اتحوّل", "ok"],
};

export const departmentLabel = (raw: string) => DEPARTMENT[raw] ?? (raw || "—");

const MONEY = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const egp = (amount: number) => `${MONEY.format(Math.round(amount))} ج.م`;

const MONTH = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { month: "long", year: "numeric", timeZone: "UTC" });
/** "2026-11" → "نوفمبر 2026". */
export const monthLabel = (month: string) =>
  /^\d{4}-\d{2}$/.test(month) ? MONTH.format(new Date(`${month}-01T00:00:00Z`)) : month;

const SHORT = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short", timeZone: "UTC" });
export const shortDate = (iso: string | null) => (iso ? SHORT.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`)) : "—");

export function dayRange(start: string | null, end: string | null) {
  if (!start) return "—";
  return end && end !== start ? `${shortDate(start)} ← ${shortDate(end)}` : shortDate(start);
}

/** "2026-11" ± n months. */
export function shiftMonth(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Years and months since a start date, e.g. "سنة و3 شهور". */
export function tenure(start: string | null, now: string) {
  if (!start) return "";
  const [sy, sm] = start.split("-").map(Number);
  const [ny, nm] = now.split("-").map(Number);
  const months = (ny - sy) * 12 + (nm - sm);
  if (months < 1) return "أقل من شهر";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const years = y === 0 ? "" : y === 1 ? "سنة" : y === 2 ? "سنتين" : `${y} سنين`;
  const rest = m === 0 ? "" : m === 1 ? "شهر" : m === 2 ? "شهرين" : `${m} شهور`;
  return [years, rest].filter(Boolean).join(" و");
}

/** "يوم" / "يومين" / "3 أيام" / "12 يوم", as said in Egyptian Arabic. */
export function daysLabel(n: number) {
  if (n === 1) return "يوم";
  if (n === 2) return "يومين";
  if (Number.isInteger(n) && n >= 3 && n <= 10) return `${n} أيام`;
  return `${n} يوم`;
}
