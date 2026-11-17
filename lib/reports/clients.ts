/**
 * Clients with a live performance report at /report/<slug>.
 *
 * Each report reads tabs of a Google Sheet that the "Sheets Reader" service
 * account (kmpn-reports project) can view. Month tabs are found by pattern so
 * a new month appears as soon as the team adds its tab; hidden tabs count.
 *
 * The password is server-only: REPORT_PASSWORD_<SLUG> (e.g. REPORT_PASSWORD_OTTROJA).
 */
export type ReportClient = {
  slug: string;
  name: string;
  spreadsheetId: string;
  /** Matches a month tab and captures the month's short English name. */
  monthTab: RegExp;
  /** Other tabs shown after the months, in this order. */
  extraTabs: { title: string; label: string }[];
};

export const REPORT_CLIENTS: Record<string, ReportClient> = {
  ottroja: {
    slug: "ottroja",
    name: "أُترجة",
    spreadsheetId: "1r9mSVsUzz9k_3Yaysdeu3YohYFtf_mAX5r9vKXjwGZg",
    monthTab: /^([A-Za-z]{3,9})-OT$/,
    extraTabs: [
      { title: "OT Products Shares - 2026", label: "حصص المنتجات" },
      { title: "MOM - Ottroja", label: "شهر بشهر" },
    ],
  },
};

export function reportClient(slug: string): ReportClient | null {
  return Object.hasOwn(REPORT_CLIENTS, slug) ? REPORT_CLIENTS[slug] : null;
}

export function reportPassword(slug: string): string | null {
  const value = process.env[`REPORT_PASSWORD_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`];
  return value && value.length >= 8 ? value : null;
}
