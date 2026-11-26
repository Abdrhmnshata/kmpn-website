import Link from "next/link";

const day = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long", timeZone: "UTC" });
const fmtDay = (d: string) => day.format(new Date(`${d}T12:00:00Z`));
const month = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { month: "long", timeZone: "UTC" });
const fmtMonth = (d: string) => month.format(new Date(`${d}T12:00:00Z`));
import { reportForCustomers } from "@/lib/reports/clients";
import { hasCreativeReport, loadCreativeSummary } from "@/lib/reports/creative";
import { change, fmtInt, fmtMoney, fmtPct, fmtRoas, metrics, roasTone } from "@/lib/reports/creative-metrics";

/**
 * The home's ad summary: this month so far against the same days of last
 * month, and the creatives that sold best, from the creative report
 * (lib/reports/creative.ts).
 * Nothing at all for a client without one, or when it can't be read.
 */
export async function AdsSnapshot({ customerIds, reportHref }: { customerIds: string[]; reportHref: string }) {
  const client = reportForCustomers(customerIds);
  if (!client || !hasCreativeReport(client.slug)) return null;

  let s;
  try {
    s = await loadCreativeSummary(client.slug, "tm");
  } catch (err) {
    console.error(`[ads-snapshot:${client.slug}]`, err);
    return null;
  }

  const now = metrics(s.total);
  const was = s.prevTotal ? metrics(s.prevTotal) : null;
  const money = s.currency === "EGP" ? "ج.م" : s.currency;
  const tiles = [
    { label: "الإنفاق", value: fmtMoney(now.spend), unit: money, c: change(now.spend, was?.spend ?? null), better: 0 },
    { label: "قيمة المبيعات", value: fmtMoney(now.value), unit: money, c: change(now.value, was?.value ?? null), better: 1 },
    { label: "العائد على الإنفاق", value: fmtRoas(now.roas), c: change(now.roas, was?.roas ?? null), better: 1, tone: roasTone(now.roas, s.target, s.floor) },
    { label: "الطلبات", value: fmtInt(now.purchases), c: change(now.purchases, was?.purchases ?? null), better: 1 },
  ];

  // Best sellers: ROAS among creatives with a real share of the spend.
  const floorSpend = s.total.spend * 0.03;
  const best = s.creatives
    .filter((c) => c.cur.spend >= floorSpend && c.cur.purchases > 0)
    .sort((a, b) => (metrics(b.cur).roas ?? 0) - (metrics(a.cur).roas ?? 0))
    .slice(0, 3);
  const media = `/api/creative/${client.slug}/`;

  return (
    <section className="home-ads">
      <div className="home-ads-head">
        <div>
          <h2>ملخص الإعلانات</h2>
          <p className="p-meta">
            من أول الشهر حتى <bdi>{fmtDay(s.range.to)}</bdi>
            {s.prevRange ? <>، مقارنة بالفترة نفسها من {fmtMonth(s.prevRange.from)}</> : null}
          </p>
        </div>
        <Link href={reportHref} className="p-link">
          التقرير الكامل ←
        </Link>
      </div>
      <div className="home-ads-tiles">
        {tiles.map((t) => (
          <div key={t.label} className={`home-ads-tile${t.tone ? ` is-${t.tone}` : ""}`}>
            <span className="home-ads-label">{t.label}</span>
            <strong className="num">
              {t.value}
              {t.unit && t.value !== "—" ? <small>{t.unit}</small> : null}
            </strong>
            {t.c !== null && Number.isFinite(t.c) ? (
              <span
                className={`cr-delta ${
                  t.better === 0 || Math.abs(t.c) < 0.005 ? "" : t.c * t.better > 0 ? "up" : "down"
                }`}
              >
                <bdi>
                  {t.c > 0 ? "+" : ""}
                  {fmtPct(t.c)}
                </bdi>
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {best.length ? (
        <div className="home-best">
          <h3>الأعلى عائدًا هذا الشهر</h3>
          <ul>
            {best.map((c) => {
              const m = metrics(c.cur);
              return (
                <li key={c.key}>
                  <Link href={reportHref} className="home-best-item">
                    <span className="home-best-cover">
                      {c.thumb ? (
                        // Served by /api/creative (signed-in only); no next/image.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={media + c.thumb} alt="" loading="lazy" />
                      ) : null}
                    </span>
                    <span className="home-best-text">
                      <span className="home-best-name">{c.name}</span>
                      <span className="p-meta">
                        <span className="num">{fmtInt(m.purchases)}</span> طلب ·{" "}
                        <span className="num">{fmtMoney(m.spend, true)}</span> {money}
                      </span>
                    </span>
                    <b className={`home-best-roas is-${roasTone(m.roas, s.target, s.floor) || "none"} num`}>
                      {fmtRoas(m.roas)}
                    </b>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function AdsSnapshotSkeleton() {
  return <section className="home-ads home-ads-loading" aria-hidden="true" />;
}
