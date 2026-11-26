import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientView } from "@/components/portal/ClientView";
import { getPortalDataForCustomer } from "@/lib/portal/notion";

/**
 * The team's local preview of what one KC customer sees in the portal.
 * Bypasses login, so it exists only under `next dev`: on Vercel (a
 * production build) it is a 404. On the live site the director uses
 * /admin/clients/<id> instead.
 */

export const metadata: Metadata = { title: "معاينة البوابة", robots: { index: false } };

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ customer: string }>;
  searchParams: Promise<{ tab?: string; view?: string; sheet?: string; type?: string; range?: string; report?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const [{ customer }, { tab, view, sheet, type, range, report }] = await Promise.all([params, searchParams]);
  const data = await getPortalDataForCustomer(customer);
  if (!data.linked) notFound();
  const company = data.customers[0]?.company ?? "";

  return (
    <ClientView
      data={data}
      base={`/preview/${customer}`}
      tab={tab}
      view={view}
      sheet={sheet}
      type={type}
      range={range}
      report={report}
      banner={
        <div className="container">
          <p className="p-preview">
            معاينة محلية: كده هيشوف <strong>{company}</strong> البوابة. مش موجودة على الموقع اللايف.{" "}
            <Link href="/preview" className="p-link">
              كل العملاء
            </Link>
          </p>
        </div>
      }
    />
  );
}
