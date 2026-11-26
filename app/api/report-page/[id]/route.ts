import { getClientReport, loadReportHtml } from "@/lib/portal/client-reports";
import { mayViewCustomers } from "@/lib/portal/viewer";

/**
 * One report page from "Portal - Reports" (lib/portal/client-reports.ts),
 * as the team made it, for that client and the director only.
 *
 * The page is someone's HTML with its own scripts, so it never runs as
 * kmpn.agency: the portal shows it in a sandboxed iframe, and this answer
 * carries the same sandbox, so even opened on its own it has no access to
 * the site's cookies or storage. Its links open in a new tab, and it tells
 * the frame its height so the portal page scrolls instead of the frame.
 */

const ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const notFound = () => new Response("Not found", { status: 404 });

const BASE = '<base target="_blank">';
const SIZE =
  "<script>(()=>{const b=document.body,s=()=>parent.postMessage({kmpnReportHeight:Math.ceil(Math.max(b.scrollHeight,b.offsetHeight))},'*');" +
  "addEventListener('load',s);new ResizeObserver(s).observe(b);s()})()</script>";

function frameable(html: string) {
  const head = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + BASE) : BASE + html;
  return /<\/body>/i.test(head) ? head.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${SIZE}</body>`) : head + SIZE;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.test(id)) return notFound();
  const report = await getClientReport(id).catch(() => null);
  if (!report || !(await mayViewCustomers(report.customerIds))) return notFound();

  let html: string;
  try {
    html = await loadReportHtml(report);
  } catch (err) {
    console.error(`[report-page:${report.id}]`, err);
    return new Response("Report unavailable", { status: 502 });
  }
  return new Response(frameable(html), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox",
      "cache-control": "private, max-age=300",
      "x-robots-tag": "noindex",
    },
  });
}
