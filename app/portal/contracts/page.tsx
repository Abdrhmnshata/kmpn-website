import { currentClient, portalData } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { ContractsView } from "@/components/portal/V1Views";

export const metadata = { title: "العقود · بوابة العملاء" };

export default async function ContractsPage() {
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <ContractsView data={data} />
    </>
  );
}
