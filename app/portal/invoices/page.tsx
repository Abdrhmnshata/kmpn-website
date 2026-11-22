import { currentClient, portalData, sectionOpen } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { InvoicesView } from "@/components/portal/Views";
import { ComingSoon } from "@/components/portal/V1Views";

export const metadata = { title: "الفواتير · بوابة العملاء" };

export default async function InvoicesPage() {
  if (!(await sectionOpen("invoices"))) return <ComingSoon title="الفواتير" />;
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <InvoicesView data={data} />
    </>
  );
}
