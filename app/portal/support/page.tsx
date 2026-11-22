import { portalData, sectionOpen } from "@/lib/portal/session";
import { PageHead } from "@/components/portal/Bits";
import { TicketForm } from "@/components/portal/TicketForm";
import { TicketsList } from "@/components/portal/Views";

import { ComingSoon } from "@/components/portal/V1Views";

export const metadata = { title: "الدعم الفني · بوابة العملاء" };

export default async function SupportPage() {
  if (!(await sectionOpen("support"))) return <ComingSoon title="الدعم الفني" />;
  const data = await portalData();
  return (
    <>
      <PageHead title="الدعم الفني" lead="افتح تذكرة وسيتابعها فريق كامبين ويرد عليك هنا." />
      <div className="p-split">
        <TicketForm />
        <TicketsList tickets={data.tickets} />
      </div>
    </>
  );
}
