import type { InvoiceStatus, TicketStatus } from "./notion";

/** "Active Projects" options in Notion → what the client reads. */
const SERVICES: Record<string, string> = {
  Shopify: "متجر شوبيفاي",
  "Social Content": "محتوى السوشيال ميديا",
  Performance: "التسويق بالأداء",
  Copywrite: "كتابة المحتوى",
  LightFunnel: "صفحات البيع",
  Studio: "الهوية البصرية",
};

export const serviceLabel = (name: string) => SERVICES[name] ?? name;

export type Tone = "ok" | "warn" | "bad" | "info" | "off";
type Label = [string, Tone];

/** Notion status names vary in case between databases; match lower-cased. */
const lookup = (map: Record<string, Label>, raw: string): Label =>
  map[raw.trim().toLowerCase()] ?? [raw || "—", "off"];

const PROJECT: Record<string, Label> = {
  planning: ["تخطيط", "info"],
  "not started": ["لم يبدأ", "off"],
  "in progress": ["جارٍ التنفيذ", "warn"],
  active: ["جارٍ", "warn"],
  "partially delivered": ["تسليم جزئي", "warn"],
  delivered: ["تم التسليم", "ok"],
  approved: ["معتمد", "ok"],
  done: ["تم", "ok"],
  paused: ["متوقف مؤقتًا", "off"],
};

const MEETING: Record<string, Label> = {
  planning: ["قادم", "info"],
  active: ["جارٍ", "warn"],
  "closed & noted": ["تم", "ok"],
  "closed & draft": ["تم", "ok"],
};

const RESOURCE: Record<string, Label> = {
  "awaiting from client": ["مطلوب منك", "bad"],
  "in reviewing": ["قيد المراجعة", "info"],
  "partially delivered": ["تم جزئيًا", "warn"],
  "client delivered": ["تم الاستلام", "ok"],
  // RugMorph's two libraries (required from / for the client).
  "fully delivered": ["تم الاستلام", "ok"],
  "awaiting from kmpn": ["يجهّزه فريقنا", "info"],
};

const DELIVERABLE: Record<string, Label> = {
  "awaiting from kmpn": ["قيد التجهيز", "info"],
  "in reviewing": ["قيد المراجعة", "warn"],
  "partially delivered": ["تسليم جزئي", "warn"],
  "fully delivered": ["تم التسليم", "ok"],
};

const CONTRACT: Record<string, Label> = {
  "not started": ["قيد الإعداد", "info"],
  "in progress": ["قيد الإعداد", "info"],
  reviewing: ["قيد المراجعة", "warn"],
  completed: ["نهائي", "ok"],
  archived: ["مؤرشف", "off"],
};

/** "Type" options of a client's Deliverables database. */
export const DELIVERABLE_TYPES: { key: string; label: string }[] = [
  { key: "Creative library", label: "المكتبة الإبداعية" },
  { key: "Documents", label: "المستندات" },
  { key: "Guidelines", label: "الأدلة الإرشادية" },
  { key: "Sheets", label: "الشيتات" },
];

export const deliverableType = (key: string) =>
  DELIVERABLE_TYPES.find((t) => t.key.toLowerCase() === key.trim().toLowerCase())?.label ?? key;

export const deliverableStatus = (raw: string) => lookup(DELIVERABLE, raw);
export const contractStatus = (raw: string) => lookup(CONTRACT, raw);
export const contractKind = (kind: "contract" | "proposal" | null) =>
  kind === "contract" ? "عقد" : kind === "proposal" ? "عرض سعر" : "";

export const projectStatus = (raw: string) => lookup(PROJECT, raw);
export const meetingStatus = (raw: string) => lookup(MEETING, raw);
export const resourceStatus = (raw: string) => lookup(RESOURCE, raw);

/** Resources still waiting on the client. */
export const isAwaiting = (raw: string) => raw.trim().toLowerCase() === "awaiting from client";
export const isDoneProject = (raw: string) =>
  ["delivered", "approved", "done"].includes(raw.trim().toLowerCase());

export const CUSTOMER_STATUS: Record<string, Label> = {
  active: ["تعاقد ساري", "ok"],
  "in pipeline": ["قيد التجهيز", "info"],
  paused: ["متوقف مؤقتًا", "off"],
  delivered: ["تم التسليم", "ok"],
};

export const customerStatus = (raw: string) => lookup(CUSTOMER_STATUS, raw);

export const INVOICE_STATUS: Record<InvoiceStatus, Label> = {
  unpaid: ["مستحقة", "warn"],
  paid: ["مدفوعة", "ok"],
  overdue: ["متأخرة", "bad"],
  void: ["ملغاة", "off"],
};

export const TICKET_STATUS: Record<TicketStatus, Label> = {
  new: ["جديدة", "info"],
  progress: ["قيد المتابعة", "warn"],
  answered: ["تم الرد", "ok"],
  closed: ["مغلقة", "off"],
};

// Latin digits, like the rest of the site.
const DATE = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDate = (iso: string | null) => (iso ? DATE.format(new Date(iso)) : "—");

const MONTH = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { month: "long", year: "numeric" });

/** "نوفمبر 2026", for grouping deliverables by month. */
export const formatMonth = (iso: string | null) => (iso ? MONTH.format(new Date(iso)) : "بدون تاريخ");

export function formatRange(start: string | null, end: string | null) {
  if (!start) return "";
  return end ? `${formatDate(start)} ← ${formatDate(end)}` : formatDate(start);
}

export function formatMoney(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
}
