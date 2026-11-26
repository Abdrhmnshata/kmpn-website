import Link from "next/link";
import { getEditThreads, type PortalData } from "@/lib/portal/notion";
import { PortalReport } from "@/components/report/PortalReport";
import { CreativeReport } from "@/components/report/CreativeReport";
import { listClientReports } from "@/lib/portal/client-reports";
import { ReportFrame } from "./ReportFrame";
import { PageHead } from "./Bits";
import { ComingSoon, DeliverablesView } from "./V1Views";

/**
 * «التسليمات»: what KMPN hands over to the client, in tabs.
 *
 *   تقارير الإعلانات          section "reports", two reports:
 *     تقارير أداء الإعلانات         the live performance sheet (lib/reports)
 *     تقارير أداء المحتوى الإعلاني  how each creative performs (the creative-report artifact)
 *   تقارير التشغيل            section "reports": the team's operations reports, shown as is
 *                             (Notion "Portal - Reports"); only for clients that have one
 *   مكتبة المحتوى الإعلاني     section "deliverables": the content library
 *
 * Shared by /portal/deliverables/* and the director's "view as client".
 */

export type DeliveryView = "ads" | "content" | "ops" | "library";

const REPORTS: { key: DeliveryView; label: string }[] = [
  { key: "ads", label: "تقارير أداء الإعلانات" },
  { key: "content", label: "تقارير أداء المحتوى الإعلاني" },
];

const sectionOf = (view: DeliveryView) => (view === "library" ? "deliverables" : "reports");

/** The view asked for, else the first tab open for the client. */
export function deliveryView(raw: string | undefined, open: readonly string[]): DeliveryView {
  if (raw === "ads" || raw === "content" || raw === "ops" || raw === "library") return raw;
  return open.includes("reports") || !open.includes("deliverables") ? "ads" : "library";
}

function Tab({
  href,
  label,
  current,
  closed,
  className,
}: {
  href: string;
  label: string;
  current: boolean;
  closed: boolean;
  className: string;
}) {
  if (closed) {
    return (
      <span className={`${className} is-soon`} aria-disabled="true">
        {label}
        <small>قريبًا</small>
      </span>
    );
  }
  return (
    <Link href={href} className={className} aria-current={current ? "page" : undefined} scroll={false}>
      {label}
    </Link>
  );
}

export async function Deliveries({
  data,
  view,
  href,
  sheet,
  sheetHref,
  type,
  typeHref,
  range,
  rangeHref,
  report,
  reportHref,
  canRequest,
}: {
  data: PortalData;
  view: DeliveryView;
  href: (view: DeliveryView) => string;
  /** The report's sheet tab (a month, …) and the link to another one. */
  sheet?: string;
  sheetHref: (title: string) => string;
  /** The library's deliverable type filter and the link to another one. */
  type?: string;
  typeHref: (type: string | null) => string;
  /** The creative report's date range (7d, 14d, …) and the link to another one. */
  range?: string;
  rangeHref: (range: string) => string;
  /** The operations report shown (a "Portal - Reports" row id) and the link to another one. */
  report?: string;
  reportHref: (id: string) => string;
  canRequest: boolean;
}) {
  const reportsOpen = data.open.includes("reports");
  const libraryOpen = data.open.includes("deliverables");
  const closed = !data.open.includes(sectionOf(view));
  const [threads, opsReports] = await Promise.all([
    view === "library" && !closed ? getEditThreads(data.deliverables.map((d) => d.id)) : {},
    data.linked ? listClientReports(data.customers.map((c) => c.id), "Operations") : [],
  ]);
  const ops = opsReports.find((r) => r.id === report) ?? opsReports[0] ?? null;
  const adsView = view === "ads" || view === "content";

  return (
    <>
      <PageHead
        title="التسليمات"
        lead={`كل ما سلّمناه لك: تقارير أداء إعلاناتك ومحتواها، ${opsReports.length ? "وتقارير التشغيل، " : ""}ومكتبة المحتوى الإعلاني من الفكرة حتى النسخة النهائية.`}
      />
      <nav className="dl-tabs" aria-label="أقسام التسليمات">
        <Tab
          href={href("ads")}
          label="تقارير الإعلانات"
          current={adsView}
          closed={!reportsOpen}
          className="dl-tab"
        />
        {opsReports.length ? (
          <Tab
            href={href("ops")}
            label="تقارير التشغيل"
            current={view === "ops"}
            closed={!reportsOpen}
            className="dl-tab"
          />
        ) : null}
        <Tab
          href={href("library")}
          label="مكتبة المحتوى الإعلاني"
          current={view === "library"}
          closed={!libraryOpen}
          className="dl-tab"
        />
      </nav>

      {adsView && reportsOpen ? (
        <nav className="dl-seg" aria-label="تقارير الإعلانات">
          {REPORTS.map((r) => (
            <Tab
              key={r.key}
              href={href(r.key)}
              label={r.label}
              current={view === r.key}
              closed={false}
              className="dl-seg-item"
            />
          ))}
        </nav>
      ) : null}

      {view === "ops" && reportsOpen && opsReports.length > 1 ? (
        <nav className="dl-seg" aria-label="تقارير التشغيل">
          {opsReports.map((r) => (
            <Tab
              key={r.id}
              href={reportHref(r.id)}
              label={r.name}
              current={r.id === ops?.id}
              closed={false}
              className="dl-seg-item"
            />
          ))}
        </nav>
      ) : null}

      {closed ? (
        <ComingSoon />
      ) : view === "ads" ? (
        data.linked ? (
          <PortalReport customerIds={data.customers.map((c) => c.id)} tab={sheet} hrefFor={sheetHref} />
        ) : null
      ) : view === "ops" ? (
        ops ? (
          <ReportFrame src={`/api/report-page/${ops.id}`} title={ops.name} />
        ) : (
          <ComingSoon>لا توجد تقارير تشغيل لحسابك حتى الآن.</ComingSoon>
        )
      ) : view === "content" ? (
        data.linked ? (
          <CreativeReport customerIds={data.customers.map((c) => c.id)} range={range} hrefFor={rangeHref} />
        ) : null
      ) : (
        <DeliverablesView data={data} threads={threads} type={type} hrefFor={typeHref} canRequest={canRequest} />
      )}
    </>
  );
}
