import { DeliveriesPage } from "@/components/portal/DeliveriesPage";

export const metadata = { title: "التسليمات · بوابة العملاء" };

/** The first open tab of «التسليمات»: the ad performance report, else the content library. */
export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string }> }) {
  return <DeliveriesPage searchParams={searchParams} />;
}
