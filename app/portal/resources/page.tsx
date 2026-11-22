import { currentClient, portalData, sectionOpen } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { ResourcesView } from "@/components/portal/Views";

import { ComingSoon } from "@/components/portal/V1Views";

export const metadata = { title: "المطلوب منك · بوابة العملاء" };

export default async function ResourcesPage() {
  if (!(await sectionOpen("resources"))) return <ComingSoon title="المطلوب منك" />;
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <ResourcesView data={data} />
    </>
  );
}
