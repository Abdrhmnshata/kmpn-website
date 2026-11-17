import { currentClient, portalData } from "@/lib/portal/session";
import { NotLinked } from "@/components/portal/Bits";
import { MeetingsView } from "@/components/portal/Views";

export const metadata = { title: "الاجتماعات · بوابة العملاء" };

export default async function MeetingsPage() {
  const [client, data] = await Promise.all([currentClient(), portalData()]);
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <MeetingsView data={data} />
    </>
  );
}
