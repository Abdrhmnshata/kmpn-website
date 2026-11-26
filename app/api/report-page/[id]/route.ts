import { getClientReport, loadReportHtml } from "@/lib/portal/client-reports";
import { mayViewCustomers } from "@/lib/portal/viewer";
import { REPORT_COLLAPSE } from "@/lib/portal/report-collapse";

/**
 * One report page from "Portal - Reports" (lib/portal/client-reports.ts),
 * as the team made it, for that client and the director only.
 *
 * The page is someone's HTML with its own scripts, so it never runs as
 * kmpn.agency: the portal shows it in a sandboxed iframe, and this answer
 * carries the same sandbox, so even opened on its own it has no access to
 * the site's cookies or storage. Its links open in a new tab, it tells the
 * frame its height so the portal page scrolls instead of the frame, and its
 * long containers fold behind a + (lib/portal/report-collapse.ts).
 */

const ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const notFound = () => new Response("Not found", { status: 404 });

const BASE = '<base target="_blank">';
// The frame is as tall as the page, so the page itself never scrolls (a
// scrollbar there was the page a few pixels taller than the body it
// measured); its own sideways scrollers (timeline, tables) get thin bars.
const SIZE =
  "<style>html,body{overflow:hidden!important}" +
  "*{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.22) transparent}" +
  "::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}" +
  "::-webkit-scrollbar-thumb{background:rgba(0,0,0,.22);border-radius:8px;border:2px solid transparent;background-clip:padding-box}</style>" +
  "<script>(()=>{const d=document.documentElement,b=document.body," +
  "s=()=>parent.postMessage({kmpnReportHeight:Math.ceil(Math.max(d.scrollHeight,b.scrollHeight,b.offsetHeight,d.getBoundingClientRect().height))},'*');" +
  "addEventListener('load',s);const o=new ResizeObserver(s);o.observe(d);o.observe(b);s()})()</script>";

function frameable(html: string) {
  const head = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + BASE) : BASE + html;
  const tail = REPORT_COLLAPSE + SIZE;
  return /<\/body>/i.test(head) ? head.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${tail}</body>`) : head + tail;
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
      "cache-control": "private, no-cache",
      "x-robots-tag": "noindex",
    },
  });
}
