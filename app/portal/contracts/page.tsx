import { currentClient, portalData, sectionOpen } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { ComingSoon, ContractsView } from "@/components/portal/V1Views";

export const metadata = { title: "العقود · بوابة العملاء" };

export default async function ContractsPage() {
  if (!(await sectionOpen("contracts"))) return <ComingSoon title="العقود" />;
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <ContractsView data={data} />
    </>
  );
}
