import { PortalMenu } from "@/components/portal/PortalMenu";
import { PORTAL_NAV } from "@/lib/portal/nav";
import {
  DashboardView,
  InvoicesView,
  MeetingsView,
  ProjectsView,
  ResourcesView,
  TicketsList,
  type Tab,
} from "@/components/portal/Views";
import { ComingSoon, ContractsView } from "@/components/portal/V1Views";
import { Deliveries, deliveryView } from "@/components/portal/Deliveries";
import { PageHead } from "@/components/portal/Bits";
import type { PortalData } from "@/lib/portal/notion";
import { pageOpen } from "@/lib/portal/nav";

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
  tab: asked,
  view,
  sheet,
  type,
  range,
}: {
  data: PortalData;
  base: string;
  tab?: string;
  /** «التسليمات»'s tab: ads, content or library. */
  view?: string;
  sheet?: string;
  type?: string;
  range?: string;
}) {
  // The ad reports moved into «التسليمات»: old ?tab=reports links land there.
  const rawTab = asked === "reports" ? "deliverables" : asked;
  const tab = (TABS.some((t) => t.key === rawTab) ? rawTab : "dashboard") as Key;
  const href = (t: Tab) => `${base}?tab=${t}`;
  const company = data.customers.map((c) => c.company).join("، ");
  const label = TABS.find((t) => t.key === tab)?.label ?? "";
  const closed = !pageOpen(tab, data.open);
  const deliveries = `${base}?tab=deliverables`;

  return (
    <main className="container portal portal-wide">
      <nav className="pm-bar" aria-label="بوابة العميل">
        <PortalMenu open={data.open} tabBase={base} active={tab} hide={["account", "site"]} />
      </nav>
      <div className="portal-main">
        {closed ? (
          <ComingSoon title={label} />
        ) : tab === "dashboard" ? (
          <DashboardView name={company} data={data} verified href={href} />
        ) : tab === "projects" ? (
          <ProjectsView data={data} />
        ) : tab === "deliverables" ? (
          <Deliveries
            data={data}
            view={deliveryView(view ?? (asked === "reports" ? "ads" : undefined), data.open)}
            href={(v) => `${deliveries}&view=${v}`}
            sheet={sheet}
            sheetHref={(title) => `${deliveries}&view=ads&sheet=${encodeURIComponent(title)}`}
            type={type}
            typeHref={(t) => `${deliveries}&view=library${t ? `&type=${encodeURIComponent(t)}` : ""}`}
            range={range}
            rangeHref={(r) => `${deliveries}&view=content&range=${r}`}
            canRequest={false}
          />
        ) : tab === "contracts" ? (
          <ContractsView data={data} />
        ) : tab === "invoices" ? (
          <InvoicesView data={data} />
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
