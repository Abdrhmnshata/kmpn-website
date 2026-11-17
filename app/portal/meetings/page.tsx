import { currentClient, portalData } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { MeetingsView } from "@/components/portal/Views";

import { isSoon } from "@/lib/portal/layer";
import { ComingSoon } from "@/components/portal/V1Views";

export const metadata = { title: "الاجتماعات · بوابة العملاء" };

export default async function MeetingsPage() {
  if (isSoon("meetings")) return <ComingSoon title="الاجتماعات" />;
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <MeetingsView data={data} />
    </>
  );
}
