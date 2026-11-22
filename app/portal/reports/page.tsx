import { currentClient, portalData, sectionOpen } from "@/lib/portal/session";
import { NotLinked, PageHead } from "@/components/portal/Bits";
import { PortalReport } from "@/components/report/PortalReport";

import { ComingSoon } from "@/components/portal/V1Views";

export const metadata = { title: "التقارير · بوابة العملاء" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await sectionOpen("reports"))) return <ComingSoon title="التقارير" />;
  const [client, data, { tab }] = await Promise.all([currentClient(), portalData(), searchParams]);
  if (!data.linked) {
    return (
      <>
        <NotLinked verified={client.verified} />
        <PageHead title="التقارير" lead="أداء حملاتك يومًا بيوم، كما يتابعه فريق كامبين." />
      </>
    );
  }
  return (
    <PortalReport
      customerIds={data.customers.map((c) => c.id)}
      tab={tab}
      hrefFor={(title) => `/portal/reports?tab=${encodeURIComponent(title)}`}
    />
  );
}
