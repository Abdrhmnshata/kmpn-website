import Link from "next/link";
import { reportForCustomers } from "@/lib/reports/clients";
import { hasCreativeReport, loadCreativeSummary, type Totals } from "@/lib/reports/creative";
import { change, fmtInt, fmtMoney, fmtPct, fmtRoas, metrics, roasTone } from "@/lib/reports/creative-metrics";
import { Empty } from "@/components/portal/Bits";
import { CreativeGrid } from "./CreativeGrid";
import "@/app/report/report.css";

/**
 * «تقارير أداء المحتوى الإعلاني»: the client's ad creatives ranked on their
 * Meta results over a date range, against the same length just before it.
 * Data: lib/reports/creative.ts (the team's creative-report artifact).
 */

const day = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long", timeZone: "UTC" });
const fmtDay = (d: string) => day.format(new Date(`${d}T12:00:00Z`));
const fmtSpan = (a: string, b: string) => (a === b ? fmtDay(a) : `${fmtDay(a)} – ${fmtDay(b)}`);

function Delta({ now, before, better }: { now: number | null; before: number | null; better: 1 | -1 | 0 }) {
  const c = change(now, before);
  if (c === null || !Number.isFinite(c)) return null;
  const tone = better === 0 || Math.abs(c) < 0.005 ? "" : c * better > 0 ? "up" : "down";
  return (
    <span className={`cr-delta ${tone}`}>
      <bdi>
        {c > 0 ? "+" : ""}
        {fmtPct(c)}
      </bdi>
    </span>
  );
}

function Tiles({ total, prev, currency, target, floor }: {
  total: Totals;
  prev: Totals | null;
  currency: string;
  target: number | null;
  floor: number | null;
}) {
  const now = metrics(total);
  const was = prev ? metrics(prev) : null;
  const money = currency === "EGP" ? "ج.م" : currency;
  const tiles: { label: string; value: string; unit?: string; delta: React.ReactNode; tone?: string; note?: string }[] = [
    { label: "الإنفاق", value: fmtMoney(now.spend), unit: money, delta: <Delta now={now.spend} before={was?.spend ?? null} better={0} /> },
    { label: "قيمة المبيعات", value: fmtMoney(now.value), unit: money, delta: <Delta now={now.value} before={was?.value ?? null} better={1} /> },
    {
      label: "العائد على الإنفاق",
      value: fmtRoas(now.roas),
      delta: <Delta now={now.roas} before={was?.roas ?? null} better={1} />,
      tone: roasTone(now.roas, target, floor),
      note: target ? `الهدف ${fmtRoas(target)}` : undefined,
    },
    { label: "الطلبات", value: fmtInt(now.purchases), delta: <Delta now={now.purchases} before={was?.purchases ?? null} better={1} /> },
    { label: "تكلفة الطلب", value: fmtMoney(now.cpa), unit: money, delta: <Delta now={now.cpa} before={was?.cpa ?? null} better={-1} /> },
  ];
  return (
    <div className="cr-tiles">
      {tiles.map((t) => (
        <div key={t.label} className={`cr-tile ${t.tone ? `is-${t.tone}` : ""}`}>
          <span className="cr-tile-label">{t.label}</span>
          <strong className="num">
            {t.value}
            {t.unit && t.value !== "—" ? <small>{t.unit}</small> : null}
          </strong>
          <span className="cr-tile-foot">
            {t.delta}
            {t.note ? <span>{t.note}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

export async function CreativeReport({
  customerIds,
  range,
  hrefFor,
}: {
  customerIds: string[];
  range: string | undefined;
  hrefFor: (range: string) => string;
}) {
  const client = reportForCustomers(customerIds);
  if (!client || !hasCreativeReport(client.slug)) {
    return (
      <Empty>
        لم نفعّل تقرير أداء المحتوى لحسابك بعد. عند تفعيله ستجد هنا أداء كل فيديو وتصميم في إعلاناتك.
      </Empty>
    );
  }

  let s;
  try {
    s = await loadCreativeSummary(client.slug, range);
  } catch (err) {
    console.error(`[creative-report:${client.slug}]`, err);
    return <Empty>تعذّر تحميل التقرير. حدّث الصفحة بعد دقيقة.</Empty>;
  }

  return (
    <div className="cr">
      <div className="cr-head">
        <div>
          <p className="cr-eyebrow">أداء المحتوى الإعلاني على ميتا</p>
          <h2>
            {client.name} · {s.range.label}
          </h2>
        </div>
        <p className="cr-asof">
          <bdi>{fmtSpan(s.range.from, s.range.to)}</bdi>
          {s.prevRange ? (
            <>
              <span className="rp-dot" aria-hidden="true" />
              مقارنة بـ <bdi>{fmtSpan(s.prevRange.from, s.prevRange.to)}</bdi>
            </>
          ) : null}
        </p>
      </div>

      <nav className="rp-tabs" aria-label="مدة التقرير">
        {s.presets.map((p) => (
          <Link
            key={p.id}
            href={hrefFor(p.id)}
            className={p.id === s.range.id ? "rp-tab is-on" : "rp-tab"}
            aria-current={p.id === s.range.id ? "page" : undefined}
            scroll={false}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <Tiles total={s.total} prev={s.prevTotal} currency={s.currency} target={s.target} floor={s.floor} />

      {s.creatives.length ? (
        <CreativeGrid
          key={s.range.id}
          creatives={s.creatives}
          currency={s.currency}
          target={s.target}
          floor={s.floor}
          media={`/api/creative/${client.slug}/`}
          compared={s.prevRange !== null}
        />
      ) : (
        <Empty>لا يوجد إنفاق على الإعلانات في هذه المدة.</Empty>
      )}

      <p className="cr-foot">
        الأرقام كما تقيسها ميتا لحملات المبيعات، وتتحدّث يوميًا. البيانات حتى <bdi>{fmtDay(s.dataTo)}</bdi>.
      </p>
    </div>
  );
}
