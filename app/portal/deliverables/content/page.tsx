import { DeliveriesPage } from "@/components/portal/DeliveriesPage";

export const metadata = { title: "أداء المحتوى الإعلاني · بوابة العملاء" };

export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string; range?: string; report?: string }> }) {
  return <DeliveriesPage view="content" searchParams={searchParams} />;
}
