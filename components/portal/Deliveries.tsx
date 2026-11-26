import Link from "next/link";
import { getEditThreads, type PortalData } from "@/lib/portal/notion";
import { PortalReport } from "@/components/report/PortalReport";
import { PageHead } from "./Bits";
import { ComingSoon, DeliverablesView } from "./V1Views";

/**
 * «التسليمات»: what KMPN hands over to the client, in tabs.
 *
 *   تقارير الإعلانات          section "reports", two reports:
 *     تقارير أداء الإعلانات         the live performance sheet (lib/reports)
 *     تقارير أداء المحتوى الإعلاني  how each creative performs (no source yet)
 *   مكتبة المحتوى الإعلاني     section "deliverables": the content library
 *
 * Shared by /portal/deliverables/* and the director's "view as client".
 */

export type DeliveryView = "ads" | "content" | "library";

const REPORTS: { key: DeliveryView; label: string }[] = [
  { key: "ads", label: "تقارير أداء الإعلانات" },
  { key: "content", label: "تقارير أداء المحتوى الإعلاني" },
];

const sectionOf = (view: DeliveryView) => (view === "library" ? "deliverables" : "reports");

/** The view asked for, else the first tab open for the client. */
export function deliveryView(raw: string | undefined, open: readonly string[]): DeliveryView {
  if (raw === "ads" || raw === "content" || raw === "library") return raw;
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
  canRequest: boolean;
}) {
  const reportsOpen = data.open.includes("reports");
  const libraryOpen = data.open.includes("deliverables");
  const closed = !data.open.includes(sectionOf(view));
  const threads =
    view === "library" && !closed ? await getEditThreads(data.deliverables.map((d) => d.id)) : {};

  return (
    <>
      <PageHead
        title="التسليمات"
        lead="كل ما سلّمناه لك: تقارير أداء إعلاناتك ومحتواها، ومكتبة المحتوى الإعلاني من الفكرة حتى النسخة النهائية."
      />
      <nav className="dl-tabs" aria-label="أقسام التسليمات">
        <Tab
          href={href("ads")}
          label="تقارير الإعلانات"
          current={view !== "library"}
          closed={!reportsOpen}
          className="dl-tab"
        />
        <Tab
          href={href("library")}
          label="مكتبة المحتوى الإعلاني"
          current={view === "library"}
          closed={!libraryOpen}
          className="dl-tab"
        />
      </nav>

      {view !== "library" && reportsOpen ? (
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

      {closed ? (
        <ComingSoon />
      ) : view === "ads" ? (
        data.linked ? (
          <PortalReport customerIds={data.customers.map((c) => c.id)} tab={sheet} hrefFor={sheetHref} />
        ) : null
      ) : view === "content" ? (
        <ComingSoon>
          هنا ستجد أداء كل محتوى إعلاني سلّمناه لك داخل الحملات: أي فيديو أو تصميم حقق أفضل النتائج. هذا التقرير
          قادم قريبًا.
        </ComingSoon>
      ) : (
        <DeliverablesView data={data} threads={threads} type={type} hrefFor={typeHref} canRequest={canRequest} />
      )}
    </>
  );
}
