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
  searchParams: Promise<{ tab?: string; sheet?: string; type?: string }>;
}) {
  const [{ id }, { tab, sheet, type }] = await Promise.all([params, searchParams]);
  const data = await getPortalDataForCustomer(id);
  if (!data.linked) notFound();
  const company = data.customers[0]?.company ?? "";

  return (
    <>
      <div className="container">
        <p className="p-preview">
          إنت شايف البوابة زي ما <strong>{company}</strong> بيشوفها بالظبط (للقراءة بس).{" "}
          <Link href="/admin/clients" prefetch={false} className="p-link">
            رجوع للعملاء
          </Link>
        </p>
      </div>
      <ClientView data={data} base={`/admin/view/${id}`} tab={tab} sheet={sheet} type={type} />
    </>
  );
}
