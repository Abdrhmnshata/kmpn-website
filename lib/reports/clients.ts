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
  /** The client's rows in Notion "KC - Master Customers": their portal shows this report. */
  customerIds: string[];
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
    customerIds: ["381c45aa-cc37-8045-803e-e170a3109eaf"], // Ottroga
  },
};

export function reportClient(slug: string): ReportClient | null {
  return Object.hasOwn(REPORT_CLIENTS, slug) ? REPORT_CLIENTS[slug] : null;
}

const bare = (id: string) => id.replace(/-/g, "").toLowerCase();

/** The report for a signed-in client's Notion customers, if one of them has one. */
export function reportForCustomers(ids: string[]): ReportClient | null {
  const wanted = new Set(ids.map(bare));
  return Object.values(REPORT_CLIENTS).find((c) => c.customerIds.some((id) => wanted.has(bare(id)))) ?? null;
}

export function reportPassword(slug: string): string | null {
  const value = process.env[`REPORT_PASSWORD_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`];
  return value && value.length >= 8 ? value : null;
}
