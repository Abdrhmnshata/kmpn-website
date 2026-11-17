import { reportForCustomers } from "@/lib/reports/clients";
import { googleConfigured } from "@/lib/reports/google";
import { loadReport } from "@/lib/reports/sheet";
import { Empty } from "@/components/portal/Bits";
import { ReportView } from "./ReportView";
import "@/app/report/report.css";

/**
 * The performance report inside the client portal: the same view as
 * /report/<slug>, for the signed-in client's Notion customers, with no
 * password (the portal login already proves who they are).
 */
export async function PortalReport({
  customerIds,
  tab,
  hrefFor,
}: {
  customerIds: string[];
  tab: string | undefined;
  hrefFor: (title: string) => string;
}) {
  const client = reportForCustomers(customerIds);
  if (!client) {
    return (
      <Empty>
        لم نفعّل تقرير الأداء لحسابك بعد. عند تفعيله ستجد هنا أرقام حملاتك يومًا بيوم.
      </Empty>
    );
  }
  if (!(await googleConfigured())) return <Empty>التقرير غير متاح الآن. حاول مرة أخرى بعد قليل.</Empty>;

  try {
    const report = await loadReport(client, tab);
    return (
      <div className="rp-page">
        <ReportView clientName={client.name} {...report} hrefFor={(t) => hrefFor(t.title)} />
      </div>
    );
  } catch (err) {
    console.error(`[portal-report:${client.slug}]`, err);
    return <Empty>تعذّر تحميل التقرير. حدّث الصفحة بعد دقيقة.</Empty>;
  }
}
