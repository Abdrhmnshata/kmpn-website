/**
 * Annual leave under Egypt's Labour Law no. 14 of 2025, article 124:
 *   - under 6 months of service: none yet;
 *   - 6 to 12 months: in proportion to the time served, out of the first year's 15 days;
 *   - from the second year: 21 days;
 *   - 30 days after 10 full years with the employer, or past the age of 50;
 *   - 45 days for people with disabilities: set by hand in Notion ("Annual leave").
 * Public holidays and the weekly days off don't count against it, and casual
 * leave (عارضة, up to 7 days a year) comes out of it (article 128).
 */

/** Whole months from `from` to `to` (both "YYYY-MM-DD"). */
export function monthsBetween(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0);
}

/** What the law gives as of `on`; null without a start date. */
export function lawAnnualLeave(start: string | null, birthday: string | null, on: string) {
  if (!start) return null;
  if (start > on) return { days: 0, why: "لسه ما بدأش" };
  const months = monthsBetween(start, on);
  if (months < 6) return { days: 0, why: "لسه ما كملش 6 شهور" };
  if (months < 12) {
    const days = Math.round((15 * months) / 12);
    return { days, why: `${months} ${months > 10 ? "شهر" : "شهور"} من أول سنة: ${days} من 15 يوم` };
  }
  if (months >= 120) return { days: 30, why: "عدّى 10 سنين معانا" };
  const born = birthday && Number(birthday.slice(0, 4)) > 1900 ? birthday : null;
  if (born && monthsBetween(born, on) >= 50 * 12) return { days: 30, why: "سنه عدّى 50" };
  return { days: 21, why: "من تاني سنة" };
}

/** `gets` is false for people KMPN gives no annual leave: anyone not full-time. */
export type Entitlement = { days: number | null; why: string; gets: boolean };

/**
 * The year's annual leave for one person: the law's figure, unless a bigger
 * number was set by hand (the law is a floor, so a smaller one is ignored).
 * Only full-time staff get it; with no employment type set, a start date
 * counts as full-time (the director dates full-time staff only).
 */
export function entitlement(
  set: number | null,
  start: string | null,
  birthday: string | null,
  on: string,
  contract = "Full-time",
): Entitlement {
  const law = lawAnnualLeave(start, birthday, on);
  if (set !== null && (!law || set > law.days)) {
    return { days: set, why: law ? `متحدد يدوي (القانون بيدي ${law.days})` : "متحدد يدوي", gets: true };
  }
  if (contract ? contract !== "Full-time" : !start) return { days: null, why: "مش دوام كامل: مفيش إجازة سنوية", gets: false };
  if (law) return { days: law.days, why: `قانون العمل م 124: ${law.why}`, gets: true };
  return { days: null, why: "ناقص تاريخ التعيين", gets: true };
}
