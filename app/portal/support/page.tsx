import { portalData } from "@/lib/portal/session";
import { PageHead } from "@/components/portal/Bits";
import { TicketForm } from "@/components/portal/TicketForm";
import { TicketsList } from "@/components/portal/Views";

export const metadata = { title: "الدعم الفني · بوابة العملاء" };

export default async function SupportPage() {
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
