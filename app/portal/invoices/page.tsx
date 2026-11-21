import { currentClient, portalData } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { InvoicesView } from "@/components/portal/Views";
import { ComingSoon } from "@/components/portal/V1Views";
import { isSoon } from "@/lib/portal/layer";

export const metadata = { title: "الفواتير · بوابة العملاء" };

export default async function InvoicesPage() {
  if (isSoon("invoices")) return <ComingSoon title="الفواتير" />;
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <InvoicesView data={data} />
    </>
  );
}
