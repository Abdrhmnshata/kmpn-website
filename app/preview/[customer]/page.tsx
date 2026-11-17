import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PortalNav, type NavItem } from "@/components/portal/PortalNav";
import {
  DashboardView,
  InvoicesView,
  MeetingsView,
  ProjectsView,
  ResourcesView,
  TicketsList,
  type Tab,
} from "@/components/portal/Views";
import { PageHead } from "@/components/portal/Bits";
import { getPortalDataForCustomer } from "@/lib/portal/notion";
import { PortalReport } from "@/components/report/PortalReport";

/**
 * The team's local preview of what one KC customer sees in the portal.
 * Bypasses login, so it exists only under `next dev`: on Vercel (a
 * production build) it is a 404.
 */

export const metadata: Metadata = { title: "معاينة البوابة", robots: { index: false } };

const TABS: { key: "dashboard" | "reports" | Tab; label: string }[] = [
  { key: "dashboard", label: "اللوحة" },
  { key: "projects", label: "المشاريع" },
  { key: "reports", label: "التقارير" },
  { key: "resources", label: "المطلوب منك" },
  { key: "meetings", label: "الاجتماعات" },
  { key: "invoices", label: "الفواتير" },
  { key: "support", label: "الدعم الفني" },
];

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ customer: string }>;
  searchParams: Promise<{ tab?: string; sheet?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const [{ customer }, { tab: rawTab, sheet }] = await Promise.all([params, searchParams]);
  const tab = TABS.some((t) => t.key === rawTab) ? (rawTab as (typeof TABS)[number]["key"]) : "dashboard";
  const data = await getPortalDataForCustomer(customer);
  if (!data.linked) notFound();

  const base = `/preview/${customer}`;
  const href = (t: Tab) => `${base}?tab=${t}`;
  const items: NavItem[] = TABS.map((t) => ({
    key: t.key,
    label: t.label,
    href: t.key === "dashboard" ? base : `${base}?tab=${t.key}`,
  }));
  const company = data.customers[0]?.company ?? "";

  return (
    <div className="page">
      <Header ctaHref="/contact" />
      <div className="container">
        <p className="p-preview">
          معاينة محلية: كده هيشوف <strong>{company}</strong> البوابة. مش موجودة على الموقع اللايف.{" "}
          <Link href="/preview" className="p-link">
            كل العملاء
          </Link>
        </p>
      </div>
      <main className="container portal">
        <PortalNav items={items} active={tab} signOutButton={false} />
        <div className="portal-main">
          {tab === "dashboard" ? (
            <DashboardView name={company} data={data} verified href={href} />
          ) : tab === "reports" ? (
            <PortalReport
              customerIds={data.customers.map((c) => c.id)}
              tab={sheet}
              hrefFor={(title) => `${base}?tab=reports&sheet=${encodeURIComponent(title)}`}
            />
          ) : tab === "projects" ? (
            <ProjectsView data={data} />
          ) : tab === "resources" ? (
            <ResourcesView data={data} />
          ) : tab === "meetings" ? (
            <MeetingsView data={data} />
          ) : tab === "invoices" ? (
            <InvoicesView data={data} />
          ) : (
            <>
              <PageHead title="الدعم الفني" />
              <TicketsList tickets={data.tickets} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
