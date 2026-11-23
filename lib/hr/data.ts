import "server-only";
import { unstable_cache } from "next/cache";
import {
  listLeaves,
  listPayroll,
  listTeam,
  thisMonth,
  today,
  type Employee,
  type Leave,
  type PayrollRow,
} from "./notion";

/**
 * What the HR pages read, kept like the rest of /admin (lib/admin/data.ts):
 * 30 seconds, never older than five minutes, cleared at once by every change
 * made from the dashboard (revalidateTag "admin-hr").
 */
const SECONDS = 30;
const MAX_AGE_MS = 5 * 60 * 1000;

function kept<T>(key: string, load: () => Promise<T>): Promise<T> {
  const window = String(Math.floor(Date.now() / MAX_AGE_MS));
  return unstable_cache(load, [key, window], { revalidate: SECONDS, tags: ["admin", "admin-hr"] })();
}

const ACTIVE = new Set(["Active", "Probation"]);
const FROM_ANNUAL = new Set(["Annual", "Emergency"]);
export const isCurrent = (e: Employee) => ACTIVE.has(e.status);

export async function hrSnapshot({ payroll: withPayroll = true } = {}) {
  const errors: string[] = [];
  const guard = async <T,>(label: string, fallback: T, run: () => Promise<T>) => {
    try {
      return await run();
    } catch (err) {
      console.error(`[hr] ${label}:`, err instanceof Error ? err.message : err);
      errors.push(label);
      return fallback;
    }
  };
  const [team, leaves, payroll] = await Promise.all([
    guard("الفريق من نوشن", [] as Employee[], () => kept("hr-team-v3", listTeam)),
    guard("الإجازات من نوشن", [] as Leave[], () => kept("hr-leaves-v1", listLeaves)),
    withPayroll ? guard("المرتبات من نوشن", [] as PayrollRow[], () => kept("hr-payroll-v1", listPayroll)) : [],
  ]);

  const now = today();
  const year = now.slice(0, 4);
  const byId = new Map(team.map((e) => [e.id.replace(/-/g, ""), e]));
  const employee = (id: string | null) => (id ? (byId.get(id.replace(/-/g, "")) ?? null) : null);
  const current = team.filter(isCurrent);

  /** Approved annual and casual (عارضة, art. 128 takes it from the annual) leave this year, per person. */
  const used = new Map<string, number>();
  for (const l of leaves) {
    if (l.status !== "Approved" || !FROM_ANNUAL.has(l.type) || !l.employeeId || l.start?.slice(0, 4) !== year) continue;
    const key = l.employeeId.replace(/-/g, "");
    used.set(key, (used.get(key) ?? 0) + l.days);
  }
  const usedBy = (e: Employee) => used.get(e.id.replace(/-/g, "")) ?? 0;

  const offToday = leaves.filter(
    (l) => l.status === "Approved" && l.start && l.start <= now && (l.end ?? l.start) >= now,
  );

  return {
    team,
    current,
    leaves,
    payroll,
    errors,
    today: now,
    month: thisMonth(),
    employee,
    usedBy,
    /** Annual leave left this year; null while the start date is missing. */
    balanceOf: (e: Employee) => (e.allowance === null ? null : e.allowance - usedBy(e)),
    offToday,
    pending: leaves.filter((l) => l.status === "Pending"),
    birthdays: upcomingBirthdays(current, now, 30),
  };
}

/** Birthdays in the next `days` days (today included), soonest first. */
function upcomingBirthdays(people: Employee[], now: string, days: number) {
  const base = new Date(`${now}T00:00:00Z`);
  const out: { employee: Employee; date: string; inDays: number; age: number | null }[] = [];
  for (const e of people) {
    if (!e.birthday) continue;
    const [y, m, d] = e.birthday.split("-").map(Number);
    let next = new Date(Date.UTC(base.getUTCFullYear(), m - 1, d));
    if (next < base) next = new Date(Date.UTC(base.getUTCFullYear() + 1, m - 1, d));
    const inDays = Math.round((next.getTime() - base.getTime()) / 86400000);
    if (inDays > days) continue;
    out.push({
      employee: e,
      date: next.toISOString().slice(0, 10),
      inDays,
      age: y > 1900 ? next.getUTCFullYear() - y : null,
    });
  }
  return out.sort((a, b) => a.inDays - b.inDays);
}

export type HrSnapshot = Awaited<ReturnType<typeof hrSnapshot>>;
