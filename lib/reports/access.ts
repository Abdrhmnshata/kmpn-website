import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { reportPassword } from "./clients";

/**
 * Password access to /report/<slug>.
 *
 * After the right password the browser keeps a cookie holding an HMAC of the
 * slug keyed by the password itself: it can't be forged without the password,
 * and changing the password (REPORT_PASSWORD_<SLUG>) signs everyone out.
 */
export const reportCookie = (slug: string) => `kr_${slug}`;

function tokenFor(slug: string, password: string) {
  return createHmac("sha256", password).update(`kmpn-report:${slug}`).digest("base64url");
}

function same(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function hasReportAccess(slug: string): Promise<boolean> {
  const password = reportPassword(slug);
  if (!password) return false;
  const value = (await cookies()).get(reportCookie(slug))?.value;
  return Boolean(value && same(value, tokenFor(slug, password)));
}

/** The cookie value for a correct password, or null. */
export function unlockToken(slug: string, attempt: string): string | null {
  const password = reportPassword(slug);
  if (!password || !same(attempt, password)) return null;
  return tokenFor(slug, password);
}
