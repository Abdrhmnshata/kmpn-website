import { currentClient, portalAccess, portalData } from "@/lib/portal/session";
import { pageOpen } from "@/lib/portal/nav";
import { NotLinked } from "./Bits";
import { Deliveries, deliveryView, type DeliveryView } from "./Deliveries";
import { ComingSoon } from "./V1Views";

const BASE = "/portal/deliverables";

/** /portal/deliverables (its first open tab), …/content and …/library. */
export async function DeliveriesPage({
  view: asked,
  searchParams,
}: {
  view?: DeliveryView;
  searchParams: Promise<{ tab?: string; type?: string; range?: string; report?: string }>;
}) {
  const { open } = await portalAccess();
  if (!pageOpen("deliverables", open)) return <ComingSoon title="التسليمات" />;
  const [client, data, { tab, type, range, report }] = await Promise.all([currentClient(), portalData(), searchParams]);
  const view = deliveryView(asked, open);
  // The page itself opens its first open tab (the ad report, else the library).
  const href = (v: DeliveryView) => (v === "ads" ? BASE : v === "ops" ? `${BASE}/operations` : `${BASE}/${v}`);

  return (
    <>
      {!data.linked ? <NotLinked verified={client.verified} /> : null}
      <Deliveries
        data={data}
        view={view}
        href={href}
        sheet={tab}
        sheetHref={(title) => `${href("ads")}?tab=${encodeURIComponent(title)}`}
        type={type}
        typeHref={(t) => (t ? `${href("library")}?type=${encodeURIComponent(t)}` : href("library"))}
        range={range}
        rangeHref={(r) => `${href("content")}?range=${r}`}
        report={report}
        reportHref={(id) => `${href("ops")}?report=${id}`}
        canRequest={client.verified}
      />
    </>
  );
}
