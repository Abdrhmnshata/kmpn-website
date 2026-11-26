import { DeliveriesPage } from "@/components/portal/DeliveriesPage";

export const metadata = { title: "أداء المحتوى الإعلاني · بوابة العملاء" };

export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string }> }) {
  return <DeliveriesPage view="content" searchParams={searchParams} />;
}
