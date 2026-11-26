import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientView } from "@/components/portal/ClientView";
import { getPortalDataForCustomer } from "@/lib/portal/notion";

export const dynamic = "force-dynamic";
export const metadata = { title: "عرض كالعميل · لوحة المدير" };

/** The director sees one client's portal exactly as the client does, read-only. */
export default async function ViewAsClient({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; view?: string; sheet?: string; type?: string; range?: string }>;
}) {
  const [{ id }, { tab, view, sheet, type, range }] = await Promise.all([params, searchParams]);
  const data = await getPortalDataForCustomer(id);
  if (!data.linked) notFound();
  const company = data.customers[0]?.company ?? "";

  return (
    <>
      <div className="container">
        <p className="p-preview">
          إنت شايف البوابة زي ما <strong>{company}</strong> بيشوفها بالظبط (للقراءة بس).{" "}
          <Link href={`/admin/clients/${id}`} prefetch={false} className="p-link">
            رجوع لصفحة العميل
          </Link>
        </p>
      </div>
      <ClientView data={data} base={`/admin/view/${id}`} tab={tab} view={view} sheet={sheet} type={type} range={range} />
    </>
  );
}
