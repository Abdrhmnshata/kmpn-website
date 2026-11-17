import Link from "next/link";
import type { Block, Cell, ParsedTab, ReportRow, TabRef } from "@/lib/reports/sheet";

/* =========================================================
   A client's performance report, drawn from one sheet tab.
   Everything shown comes from the sheet as the team keeps it:
   values as formatted there and each cell's colour.
   Shared by /report/<slug> and, later, the client portal.
   ========================================================= */

const AR: Record<string, string> = {
  spent: "الإنفاق",
  revenue: "الإيرادات",
  orders: "الطلبات",
  roas: "العائد على الإنفاق",
  cpp: "تكلفة الطلب",
  cpo: "تكلفة الطلب",
  aov: "متوسط قيمة الطلب",
  "gross sales": "إجمالي مبيعات المتجر",
  leads: "العملاء المحتملون",
  cpl: "تكلفة العميل المحتمل",
};

const arabicName = (metric: string) => AR[metric.replace(/\s*-\s*\(.*\)$/, "").trim().toLowerCase()] ?? null;

/** The headline metrics, first match in each group. */
const HEADLINES = [
  ["Spent"],
  ["Revenue - (7ds)", "Revenue"],
  ["Orders - (7ds)", "Orders"],
  ["ROAS"],
  ["CPP - (7ds)", "CPP", "CPO"],
  ["AOV"],
];

function toneClass(c: Cell | null) {
  if (!c) return undefined;
  if (c.tone) return `rp-t-${c.tone}`;
  if (c.color) return "rp-t-raw";
  return undefined;
}

const rawStyle = (c: Cell | null) =>
  c?.color ? ({ "--cell": c.color } as React.CSSProperties) : undefined;

function Num({ cell, className }: { cell: Cell | null; className?: string }) {
  return (
    <td className={[className, toneClass(cell)].filter(Boolean).join(" ") || undefined} style={rawStyle(cell)}>
      <bdi>{cell?.text ?? ""}</bdi>
    </td>
  );
}

function Bar({ value }: { value: number | null }) {
  if (value === null) return null;
  const width = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span className="rp-bar" aria-hidden="true">
      <i style={{ width: `${width}%` }} />
    </span>
  );
}

function Pct({ cell }: { cell: Cell | null }) {
  return (
    <td className="rp-pct">
      {cell?.text ? (
        <span className="rp-pct-in">
          <Bar value={cell.num} />
          <span className={["rp-pill", toneClass(cell)].filter(Boolean).join(" ")} style={rawStyle(cell)}>
            <bdi>{cell.text}</bdi>
          </span>
        </span>
      ) : null}
    </td>
  );
}

/* ---------- headline tiles ------------------------------ */

function Headlines({ block }: { block: Block }) {
  const overall =
    block.sections.find((s) => /overall/i.test(s.title)) ??
    block.sections.find((s) => s.rows.some((r) => r.target?.text)) ??
    block.sections[0];
  if (!overall) return null;
  const picked: ReportRow[] = [];
  for (const names of HEADLINES) {
    const row = names.map((n) => overall.rows.find((r) => r.metric === n)).find(Boolean);
    if (row) picked.push(row);
  }
  const store = block.sections
    .find((s) => /shopify/i.test(s.title))
    ?.rows.find((r) => /gross sales/i.test(r.metric) && r.mtd?.text);
  if (store) picked.push(store);
  if (picked.length === 0) return null;

  return (
    <div className="rp-tiles">
      {picked.map((row) => (
        <div className="rp-tile" key={`${row.metric}-${row === store ? "store" : "ads"}`}>
          <div className="rp-tile-head">
            <span>{arabicName(row.metric) ?? row.metric}</span>
            <bdi className="rp-tile-en">{row === store ? "Shopify · " : ""}{row.metric}</bdi>
          </div>
          <bdi className="rp-tile-value">{row.mtd?.text || "—"}</bdi>
          {row.target?.text ? (
            <div className="rp-tile-meta">
              <span>
                التارجت <bdi>{row.target.text}</bdi>
              </span>
              {row.daily?.text ? (
                <span>
                  اليومي <bdi>{row.daily.text}</bdi>
                </span>
              ) : null}
            </div>
          ) : null}
          {row.pct?.text ? (
            <div className="rp-tile-pct">
              <Bar value={row.pct.num} />
              <span className={["rp-pill", toneClass(row.pct)].filter(Boolean).join(" ")} style={rawStyle(row.pct)}>
                <bdi>{row.pct.text}</bdi>
              </span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ---------- the sheet table ----------------------------- */

function BlockTable({ block }: { block: Block }) {
  const hasTarget = block.sections.some((s) => s.rows.some((r) => r.target));
  const width = 1 + block.extraLabels.length + (hasTarget ? 4 : 0) + block.days.length;
  return (
    <div className="rp-scroll" tabIndex={0} role="region" aria-label="جدول المؤشرات اليومية">
      <table className="rp-table">
        <thead>
          <tr>
            <th className="rp-stick" scope="col">
              المؤشر
            </th>
            {block.extraLabels.map((l, i) => (
              <th key={`x${i}`} scope="col">
                {l}
              </th>
            ))}
            {hasTarget ? (
              <>
                <th scope="col">التارجت</th>
                <th scope="col">التارجت اليومي</th>
                <th scope="col">المحقَّق</th>
                <th scope="col">نسبة التحقيق</th>
              </>
            ) : null}
            {block.days.map((d) => (
              <th key={d} scope="col" className="rp-day">
                <bdi>{d}</bdi>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.sections.map((section, si) => (
            <SectionRows key={si} title={section.title} rows={section.rows} width={width} hasTarget={hasTarget} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionRows({
  title,
  rows,
  width,
  hasTarget,
}: {
  title: string;
  rows: ReportRow[];
  width: number;
  hasTarget: boolean;
}) {
  return (
    <>
      {title ? (
        <tr className="rp-sec-row">
          <th className="rp-stick" scope="colgroup">
            <bdi>{title}</bdi>
          </th>
          <td colSpan={width - 1} />
        </tr>
      ) : null}
      {rows.map((row, i) => (
        <tr key={i}>
          <th className="rp-stick rp-metric" scope="row">
            {row.group ? <bdi className="rp-group">{row.group}</bdi> : null}
            <bdi className="rp-metric-name">{row.metric}</bdi>
            {row.note && row.note !== row.group ? <bdi className="rp-note">{row.note}</bdi> : null}
          </th>
          {row.extras.map((x, k) => (
            <td key={`x${k}`} className="rp-extra">
              <bdi>{x}</bdi>
            </td>
          ))}
          {hasTarget ? (
            <>
              <Num cell={row.target} className="rp-key" />
              <Num cell={row.daily} className="rp-key" />
              <Num cell={row.mtd} className="rp-key rp-mtd" />
              <Pct cell={row.pct} />
            </>
          ) : null}
          {row.days.map((c, d) => (
            <Num key={d} cell={c} />
          ))}
        </tr>
      ))}
    </>
  );
}

function SideNotes({ rows }: { rows: string[][] }) {
  const caption = rows[0]?.length === 1 ? rows[0][0] : null;
  const pairs = rows.filter((r) => r.length > 1);
  return (
    <div className="rp-side">
      {caption ? <h3>{caption}</h3> : null}
      <dl>
        {pairs.map((r, i) => (
          <div key={i}>
            <dt>
              <bdi>{r[0]}</bdi>
            </dt>
            <dd>
              <bdi>{r.slice(1).join(" · ")}</bdi>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PlainTable({ tab }: { tab: Extract<ParsedTab, { kind: "table" }> }) {
  return (
    <div className="rp-scroll" tabIndex={0} role="region" aria-label={tab.title}>
      <table className="rp-table rp-plain">
        <thead>
          <tr>
            {tab.header.map((c, i) => (
              <th key={i} scope="col" className={i === 0 ? "rp-stick" : undefined}>
                <bdi>{c.text}</bdi>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tab.rows.map((row, r) => (
            <tr key={r}>
              {row.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="rp-stick rp-metric">
                    <bdi className="rp-metric-name">{c.text}</bdi>
                  </th>
                ) : (
                  <Num key={i} cell={c} />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- page ---------------------------------------- */

export function ReportView({
  clientName,
  tabs,
  current,
  tab,
  hrefFor,
}: {
  clientName: string;
  tabs: TabRef[];
  current: TabRef;
  tab: ParsedTab;
  hrefFor: (tab: TabRef) => string;
}) {
  const first = tab.kind === "blocks" ? tab.blocks[0] : null;
  const isMonth = current.month !== null;
  const lastDay = first?.days.at(-1);

  return (
    <div className="rp">
      <div className="rp-head">
        <div>
          <p className="rp-eyebrow">تقرير الأداء المباشر</p>
          <h1>
            {clientName} · {current.label}
          </h1>
        </div>
        {isMonth && first && lastDay ? (
          <p className="rp-asof">
            البيانات حتى <bdi>{lastDay}</bdi>
            <span className="rp-dot" aria-hidden="true" />
            مرّ {first.days.length} من {first.totalDays} يومًا
          </p>
        ) : null}
      </div>

      <nav className="rp-tabs" aria-label="أشهر التقرير">
        {tabs.map((t) => (
          <Link
            key={t.title}
            href={hrefFor(t)}
            className={t.title === current.title ? "rp-tab is-on" : "rp-tab"}
            aria-current={t.title === current.title ? "page" : undefined}
            scroll={false}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab.kind === "blocks" ? (
        <>
          {isMonth && first ? <Headlines block={first} /> : null}
          {tab.blocks.map((block, i) => (
            <section className="rp-block" key={i}>
              {tab.blocks.length > 1 && block.days[0] ? (
                <h2 className="rp-block-title">
                  <bdi>
                    {block.days[0]} – {block.days.at(-1)}
                  </bdi>
                </h2>
              ) : null}
              <BlockTable block={block} />
            </section>
          ))}
          {tab.side.length ? <SideNotes rows={tab.side} /> : null}
        </>
      ) : (
        <section className="rp-block">
          <PlainTable tab={tab} />
        </section>
      )}

      <p className="rp-foot">
        الأرقام والألوان كما في شيت الأداء الذي يحدّثه فريق كامبين، وتتحدّث هنا خلال دقيقة من أي تعديل.
      </p>
    </div>
  );
}
