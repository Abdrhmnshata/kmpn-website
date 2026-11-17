import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PortalNav } from "@/components/portal/PortalNav";
import { PORTAL_NAV, type NavItem } from "@/lib/portal/nav";
import {
  DashboardView,
  InvoicesView,
  MeetingsView,
  ProjectsView,
  ResourcesView,
  TicketsList,
  type Tab,
} from "@/components/portal/Views";
import { ComingSoon, ContractsView, DeliverablesView } from "@/components/portal/V1Views";
import { PageHead } from "@/components/portal/Bits";
import { getEditThreads, getPortalDataForCustomer } from "@/lib/portal/notion";
import { isSoon } from "@/lib/portal/layer";
import { PortalReport } from "@/components/report/PortalReport";

/**
 * The team's local preview of what one KC customer sees in the portal.
 * Bypasses login, so it exists only under `next dev`: on Vercel (a
 * production build) it is a 404. Read-only: no edit requests from here.
 */

export const metadata: Metadata = { title: "معاينة البوابة", robots: { index: false } };

// Same menu as the portal, minus the account page.
const TABS = PORTAL_NAV.filter((t) => t.key !== "account");
type Key = "dashboard" | "reports" | Tab;

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ customer: string }>;
  searchParams: Promise<{ tab?: string; sheet?: string; type?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const [{ customer }, { tab: rawTab, sheet, type }] = await Promise.all([params, searchParams]);
  const tab = (TABS.some((t) => t.key === rawTab) ? rawTab : "dashboard") as Key;
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
  const label = TABS.find((t) => t.key === tab)?.label ?? "";
  const threads = tab === "deliverables" ? await getEditThreads(data.deliverables.map((d) => d.id)) : {};

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
          {isSoon(tab) ? (
            <ComingSoon title={label} />
          ) : tab === "dashboard" ? (
            <DashboardView name={company} data={data} verified href={href} />
          ) : tab === "projects" ? (
            <ProjectsView data={data} />
          ) : tab === "deliverables" ? (
            <DeliverablesView
              data={data}
              threads={threads}
              type={type}
              hrefFor={(t) => (t ? `${base}?tab=deliverables&type=${encodeURIComponent(t)}` : `${base}?tab=deliverables`)}
              canRequest={false}
            />
          ) : tab === "contracts" ? (
            <ContractsView data={data} />
          ) : tab === "invoices" ? (
            <InvoicesView data={data} />
          ) : tab === "reports" ? (
            <PortalReport
              customerIds={data.customers.map((c) => c.id)}
              tab={sheet}
              hrefFor={(title) => `${base}?tab=reports&sheet=${encodeURIComponent(title)}`}
            />
          ) : tab === "resources" ? (
            <ResourcesView data={data} />
          ) : tab === "meetings" ? (
            <MeetingsView data={data} />
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
