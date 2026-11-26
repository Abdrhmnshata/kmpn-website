import { redirect } from "next/navigation";

/** The ad reports moved into «التسليمات»; old links still land there. */
export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  redirect(tab ? `/portal/deliverables?tab=${encodeURIComponent(tab)}` : "/portal/deliverables");
}
