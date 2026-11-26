import "server-only";
import { unstable_cache } from "next/cache";
import { isNotionConfigured, notionCall, notionQuery, type NotionPage } from "./notion";

/**
 * Reports the team hands a client as one finished HTML page, shown as is
 * («التسليمات» → «تقارير التشغيل»). They live in the Notion database
 * "Portal - Reports" under the director-only "Client Portal" page: one row
 * per report with the client in Customer, the page in File, and "Show in
 * portal" ticked. The page never sits in this public repository.
 */

const REPORTS_DS = "424c45aa-cc37-81e9-ab0f-000ba6467b43";

export type ReportKind = "Operations";
export type ClientReport = {
  id: string;
  name: string;
  kind: string;
  date: string | null;
  customerIds: string[];
  edited: string;
};

const bare = (id: string) => id.replace(/-/g, "").toLowerCase();

/** Every row shown in the portal, newest first; kept five minutes. */
const allReports = unstable_cache(
  async (): Promise<ClientReport[]> => {
    if (!isNotionConfigured()) return [];
    const rows = await notionQuery(REPORTS_DS, {
      filter: { property: "Show in portal", checkbox: { equals: true } },
      sorts: [{ property: "Date", direction: "descending" }],
    });
    return rows
      .filter((row) => (row.properties.File?.files ?? []).length > 0)
      .map((row) => ({
        id: row.id,
        name: (row.properties.Name?.title ?? []).map((t) => t.plain_text).join("").trim() || "تقرير",
        kind: row.properties.Type?.select?.name ?? "",
        date: row.properties.Date?.date?.start ?? null,
        customerIds: (row.properties.Customer?.relation ?? []).map((r) => r.id),
        edited: (row as NotionPage & { last_edited_time?: string }).last_edited_time ?? row.created_time,
      }));
  },
  ["client-reports-v1"],
  { revalidate: 300, tags: ["client-reports"] },
);

/** A client's reports of one kind, newest first. */
export async function listClientReports(customerIds: string[], kind: ReportKind): Promise<ClientReport[]> {
  if (!customerIds.length) return [];
  const wanted = new Set(customerIds.map(bare));
  try {
    const rows = await allReports();
    return rows.filter((r) => r.kind === kind && r.customerIds.some((id) => wanted.has(bare(id))));
  } catch (err) {
    console.error("[client-reports]", err);
    return [];
  }
}

export async function getClientReport(id: string): Promise<ClientReport | null> {
  const rows = await allReports();
  return rows.find((r) => bare(r.id) === bare(id)) ?? null;
}

/**
 * The report's page as stored. Notion's file links expire after an hour,
 * so the row is read again for a fresh one; the page itself is kept until
 * the row changes.
 */
export function loadReportHtml(report: ClientReport): Promise<string> {
  return unstable_cache(
    async () => {
      const page = await notionCall<NotionPage>(`pages/${report.id}`);
      const files = page.properties.File?.files ?? [];
      const file = files.find((f) => /\.html?$/i.test(f.name ?? "")) ?? files[0];
      const url = file?.file?.url ?? file?.external?.url;
      if (!url) throw new Error(`report ${report.id} has no file`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`report ${report.id}: file HTTP ${res.status}`);
      return res.text();
    },
    ["client-report-html-v1", report.id, report.edited],
    { revalidate: 86400, tags: ["client-reports"] },
  )();
}
