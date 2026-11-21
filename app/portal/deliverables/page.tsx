import { currentClient, portalData } from "@/lib/portal/session";
import { getEditThreads } from "@/lib/portal/notion";
import { NotLinked } from "@/components/portal/Bits";
import { ComingSoon, DeliverablesView } from "@/components/portal/V1Views";
import { isSoon } from "@/lib/portal/layer";

export const metadata = { title: "التسليمات · بوابة العملاء" };

export default async function DeliverablesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  if (isSoon("deliverables")) return <ComingSoon title="التسليمات" />;
  const [client, data, { type }] = await Promise.all([currentClient(), portalData(), searchParams]);
  const threads = await getEditThreads(data.deliverables.map((d) => d.id));
  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <DeliverablesView
        data={data}
        threads={threads}
        type={type}
        hrefFor={(t) => (t ? `/portal/deliverables?type=${encodeURIComponent(t)}` : "/portal/deliverables")}
        canRequest={client.verified}
      />
    </>
  );
}
