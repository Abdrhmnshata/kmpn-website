import { DeliveriesPage } from "@/components/portal/DeliveriesPage";

export const metadata = { title: "مكتبة المحتوى الإعلاني · بوابة العملاء" };

export default function Page({ searchParams }: { searchParams: Promise<{ tab?: string; type?: string }> }) {
  return <DeliveriesPage view="library" searchParams={searchParams} />;
}
