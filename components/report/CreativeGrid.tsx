"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CreativeFormat, CreativeRow } from "@/lib/reports/creative";
import { change, fmtInt, fmtMoney, fmtPct, fmtRoas, metrics, roasTone } from "@/lib/reports/creative-metrics";

/**
 * The creatives of the creative report as cards (cover, ROAS, spend,
 * orders), sortable and filterable; a card opens its video or design with
 * every number and its change against the previous period.
 */

const FORMAT: Record<CreativeFormat, string> = { video: "فيديو", image: "تصميم", catalog: "كتالوج" };
const FILTER_LABEL: Record<CreativeFormat, string> = { video: "فيديوهات", image: "تصميمات", catalog: "كتالوج" };
type Sort = "spend" | "roas" | "purchases";
const SORTS: { key: Sort; label: string }[] = [
  { key: "spend", label: "الأعلى إنفاقًا" },
  { key: "roas", label: "الأعلى عائدًا" },
  { key: "purchases", label: "الأكثر طلبات" },
];
const PAGE = 24;

const seconds = (s: number | null) =>
  s === null ? null : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export function CreativeGrid({
  creatives,
  currency,
  target,
  floor,
  media,
  compared,
}: {
  creatives: CreativeRow[];
  currency: string;
  target: number | null;
  floor: number | null;
  /** Base of /api/creative/<slug>/ for covers and videos. */
  media: string;
  compared: boolean;
}) {
  const [filter, setFilter] = useState<CreativeFormat | "all">("all");
  const [sort, setSort] = useState<Sort>("spend");
  const [shown, setShown] = useState(PAGE);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [broken, setBroken] = useState<Record<string, true>>({});
  const money = currency === "EGP" ? "ج.م" : currency;

  const formats = (["video", "image", "catalog"] as const).filter((f) => creatives.some((c) => c.format === f));
  const totalSpend = creatives.reduce((n, c) => n + c.cur.spend, 0);

  const list = useMemo(() => {
    const rows = creatives.filter((c) => filter === "all" || c.format === filter);
    if (sort === "spend") return rows;
    // A creative with a sliver of the spend can show any ROAS: rank those last.
    const floorSpend = totalSpend * 0.01;
    const value = (c: CreativeRow) =>
      sort === "purchases" ? c.cur.purchases : c.cur.spend >= floorSpend ? (metrics(c.cur).roas ?? -1) : -2;
    return [...rows].sort((a, b) => value(b) - value(a) || b.cur.spend - a.cur.spend);
  }, [creatives, filter, sort, totalSpend]);

  const open = creatives.find((c) => c.key === openKey) ?? null;
  const cover = (c: CreativeRow) => (c.thumb && !broken[c.key] ? media + c.thumb : null);

  return (
    <section className="cr-board" aria-label="الكريتيفز">
      <div className="cr-controls">
        {formats.length > 1 ? (
          <div className="work-chips cr-filters" role="group" aria-label="نوع المحتوى">
            {(["all", ...formats] as const).map((f) => (
              <button
                key={f}
                type="button"
                className="work-chip"
                aria-pressed={filter === f}
                onClick={() => {
                  setFilter(f);
                  setShown(PAGE);
                }}
              >
                {f === "all" ? "الكل" : FILTER_LABEL[f]}{" "}
                <span className="work-chip-count num">
                  {f === "all" ? creatives.length : creatives.filter((c) => c.format === f).length}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="dl-seg cr-sort" role="group" aria-label="الترتيب">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              className="dl-seg-item"
              aria-current={sort === s.key ? "page" : undefined}
              onClick={() => setSort(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="cr-grid">
        {list.slice(0, shown).map((c, i) => {
          const m = metrics(c.cur);
          const src = cover(c);
          return (
            <li key={c.key}>
              <button type="button" className="cr-card" onClick={() => setOpenKey(c.key)}>
                <span className="cr-cover">
                  {src ? (
                    // Served by /api/creative (signed-in only); no next/image.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" loading="lazy" onError={() => setBroken((b) => ({ ...b, [c.key]: true }))} />
                  ) : (
                    <span className="cr-cover-none">{FORMAT[c.format]}</span>
                  )}
                  <span className="cr-rank num">{i + 1}</span>
                  {c.format === "video" && c.video ? <span className="lib-play" aria-hidden="true" /> : null}
                  <span className="cr-badge">
                    {FORMAT[c.format]}
                    {c.lengthS ? (
                      <>
                        {" · "}
                        <bdi className="num">{seconds(c.lengthS)}</bdi>
                      </>
                    ) : null}
                  </span>
                  {c.active ? <span className="cr-live">نشط</span> : null}
                </span>
                <span className="cr-name">{c.name}</span>
                <span className="cr-stats">
                  <span className={`cr-roas is-${roasTone(m.roas, target, floor) || "none"}`}>
                    <small>العائد</small>
                    <b className="num">{fmtRoas(m.roas)}</b>
                  </span>
                  <span>
                    <small>الإنفاق</small>
                    <b className="num">{fmtMoney(m.spend, true)}</b>
                  </span>
                  <span>
                    <small>الطلبات</small>
                    <b className="num">{fmtInt(m.purchases)}</b>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {list.length > shown ? (
        <button type="button" className="work-chip cr-more" onClick={() => setShown((n) => n + PAGE)}>
          عرض المزيد <span className="work-chip-count num">{list.length - shown}</span>
        </button>
      ) : null}

      <CreativeDialog
        c={open}
        onClose={() => setOpenKey(null)}
        cover={open ? cover(open) : null}
        video={open?.video ? media + open.video : null}
        money={money}
        target={target}
        floor={floor}
        compared={compared}
      />
    </section>
  );
}

function CreativeDialog({
  c,
  onClose,
  cover,
  video,
  money,
  target,
  floor,
  compared,
}: {
  c: CreativeRow | null;
  onClose: () => void;
  cover: string | null;
  video: string | null;
  money: string;
  target: number | null;
  floor: number | null;
  compared: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (c && !dialog.open) dialog.showModal();
    if (!c && dialog.open) dialog.close();
  }, [c]);

  const m = c ? metrics(c.cur) : null;
  const p = c?.prev ? metrics(c.prev) : null;
  const rows: { label: string; now: string; delta: number | null; better: 1 | -1 | 0 }[] =
    m === null
      ? []
      : [
          { label: "العائد على الإنفاق", now: fmtRoas(m.roas), delta: change(m.roas, p?.roas ?? null), better: 1 },
          { label: "الإنفاق", now: `${fmtMoney(m.spend)} ${money}`, delta: change(m.spend, p?.spend ?? null), better: 0 },
          { label: "قيمة المبيعات", now: `${fmtMoney(m.value)} ${money}`, delta: change(m.value, p?.value ?? null), better: 1 },
          { label: "الطلبات", now: fmtInt(m.purchases), delta: change(m.purchases, p?.purchases ?? null), better: 1 },
          { label: "تكلفة الطلب", now: m.cpa === null ? "—" : `${fmtMoney(m.cpa)} ${money}`, delta: change(m.cpa, p?.cpa ?? null), better: -1 },
          { label: "مرات الظهور", now: fmtInt(m.impressions), delta: change(m.impressions, p?.impressions ?? null), better: 0 },
          { label: "نسبة النقر (CTR)", now: fmtPct(m.ctr), delta: change(m.ctr, p?.ctr ?? null), better: 1 },
          ...(m.hook !== null
            ? [
                { label: "معدل جذب الانتباه (أول 3 ثوانٍ)", now: fmtPct(m.hook), delta: change(m.hook, p?.hook ?? null), better: 1 as const },
                { label: "معدل الاستمرار في المشاهدة", now: fmtPct(m.hold), delta: change(m.hold, p?.hold ?? null), better: 1 as const },
              ]
            : []),
        ];

  return (
    <dialog
      ref={ref}
      className="lib-dialog"
      aria-label={c?.name ?? "كريتيف"}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {c && m ? (
        <div className="lib-dialog-box">
          <button type="button" className="lib-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
          <div className={`lib-stage lib-stage-${video ? "video" : "static"}`}>
            {video ? (
              <video key={video} src={video} poster={cover ?? undefined} controls playsInline preload="metadata" />
            ) : cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={c.name} />
            ) : (
              <span className="cr-cover-none">{FORMAT[c.format]}</span>
            )}
          </div>
          <div className="lib-info">
            <div className="lib-tags">
              <span className="lib-tag">{FORMAT[c.format]}</span>
              {c.lengthS ? <span className="lib-tag num">{seconds(c.lengthS)}</span> : null}
              {c.active ? <span className="lib-tag lib-tag-live">نشط في الإعلانات الآن</span> : null}
              <span className={`lib-tag cr-tag-${roasTone(m.roas, target, floor) || "none"}`}>
                العائد {fmtRoas(m.roas)}
                {target ? ` · الهدف ${fmtRoas(target)}` : ""}
              </span>
            </div>
            <h2>{c.name}</h2>
            <dl className="cr-list">
              {rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>
                    <b className="num">
                      <bdi>{r.now}</bdi>
                    </b>
                    {compared && r.delta !== null && Number.isFinite(r.delta) ? (
                      <span
                        className={`cr-delta ${
                          r.better === 0 || Math.abs(r.delta) < 0.005 ? "" : r.delta * r.better > 0 ? "up" : "down"
                        }`}
                      >
                        <bdi>
                          {r.delta > 0 ? "+" : ""}
                          {fmtPct(r.delta)}
                        </bdi>
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            {compared ? <p className="p-meta">النسب مقارنة بالمدة نفسها قبلها مباشرة.</p> : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
