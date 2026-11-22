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
import { getEditThreads, type PortalData } from "@/lib/portal/notion";
import { isSection } from "@/lib/portal/layer";
import { PortalReport } from "@/components/report/PortalReport";

/**
 * One client's portal exactly as they see it, read-only (no edit requests,
 * no ticket form, no sign-out): the director's "view as client" page and
 * the team's local preview. Tabs are links under `base` (?tab=…).
 */

const TABS = PORTAL_NAV.filter((t) => t.key !== "account");
type Key = "dashboard" | Tab;

export async function ClientView({
  data,
  base,
  tab: rawTab,
  sheet,
  type,
}: {
  data: PortalData;
  base: string;
  tab?: string;
  sheet?: string;
  type?: string;
}) {
  const tab = (TABS.some((t) => t.key === rawTab) ? rawTab : "dashboard") as Key;
  const href = (t: Tab) => `${base}?tab=${t}`;
  const items: NavItem[] = TABS.map((t) => ({
    key: t.key,
    label: t.label,
    href: t.key === "dashboard" ? base : `${base}?tab=${t.key}`,
  }));
  const company = data.customers.map((c) => c.company).join("، ");
  const label = TABS.find((t) => t.key === tab)?.label ?? "";
  const closed = isSection(tab) && !data.open.includes(tab);
  const threads =
    tab === "deliverables" && !closed ? await getEditThreads(data.deliverables.map((d) => d.id)) : {};

  return (
    <main className="container portal">
      <PortalNav items={items} active={tab} open={data.open} signOutButton={false} />
      <div className="portal-main">
        {closed ? (
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
  );
}
