"use client";

import { useEffect, useRef, useState } from "react";
import type { LibraryItem, LibraryStage } from "@/lib/portal/notion";
import { formatMonth } from "@/lib/portal/format";

/**
 * «مكتبة المحتوى»: the content KMPN makes for the client, grouped by month.
 * Finished pieces with a cover show as covers; pieces still on their way
 * (a script, a shoot, an edit) show as cards with the stage they are at.
 * Covers only in the grid (a Drive player per piece would be far too heavy);
 * a piece opens in a dialog with Drive's player or its script, and the way
 * it is made with KMPN, step by step.
 */

const FORMAT_LABEL: Record<LibraryItem["format"], string> = {
  video: "فيديو",
  static: "تصميم",
  carousel: "كاروسيل",
};

const STAGE_LABEL: Record<LibraryStage, string> = {
  idea: "مرحلة الفكرة",
  script: "كتابة السكريبت",
  shoot: "جاهز للتصوير",
  edit: "في المونتاج",
  design: "في التصميم",
  review: "جاهز للمراجعة",
  done: "تم التسليم",
  paused: "متوقف مؤقتًا",
};

/** How KMPN makes it, and which step each stage sits on. */
const JOURNEY: Record<LibraryItem["format"], { steps: string[]; at: Partial<Record<LibraryStage, number>> }> = {
  video: {
    steps: ["الفكرة", "السكريبت", "التصوير", "المونتاج", "النسخة النهائية"],
    at: { idea: 0, script: 1, shoot: 2, edit: 3, review: 3, done: 5 },
  },
  static: {
    steps: ["الفكرة", "الكوبي", "التصميم", "النسخة النهائية"],
    at: { idea: 0, script: 1, design: 2, review: 2, done: 4 },
  },
  carousel: {
    steps: ["الفكرة", "الكوبي", "التصميم", "النسخة النهائية"],
    at: { idea: 0, script: 1, design: 2, review: 2, done: 4 },
  },
};

type Filter = "all" | "done" | "progress" | LibraryItem["format"];

const coverOf = (item: LibraryItem, width = 600) =>
  item.cover ?? (item.driveId ? `https://drive.google.com/thumbnail?id=${item.driveId}&sz=w${width}` : null);

const monthLabel = (key: string | null) => (key ? formatMonth(`${key}-01T12:00:00`) : "بدون شهر");

/** Steps done before the current one; -1 when paused (no step is current). */
const stepOf = (item: LibraryItem) => JOURNEY[item.format].at[item.stage] ?? -1;

function Progress({ item }: { item: LibraryItem }) {
  const { steps } = JOURNEY[item.format];
  const at = stepOf(item);
  return (
    <span className="lib-progress" aria-hidden="true">
      {steps.map((s, i) => (
        <i key={s} className={i < at ? "is-done" : i === at ? "is-now" : undefined} />
      ))}
    </span>
  );
}

export function LibraryGrid({ items }: { items: LibraryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [broken, setBroken] = useState<Record<string, true>>({});

  const done = items.filter((i) => i.stage === "done");
  const formats = (["video", "static", "carousel"] as const).filter((f) => items.some((i) => i.format === f));
  const choices: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: items.length },
    ...(done.length && done.length < items.length
      ? [
          { key: "done" as const, label: "تم التسليم", count: done.length },
          { key: "progress" as const, label: "قيد التنفيذ", count: items.length - done.length },
        ]
      : []),
    ...(formats.length > 1
      ? formats.map((f) => ({
          key: f,
          label: f === "static" ? "تصميمات" : f === "video" ? "فيديوهات" : FORMAT_LABEL[f],
          count: items.filter((i) => i.format === f).length,
        }))
      : []),
  ];
  const list = items.filter((i) =>
    filter === "all"
      ? true
      : filter === "done"
        ? i.stage === "done"
        : filter === "progress"
          ? i.stage !== "done"
          : i.format === filter,
  );
  const months = new Map<string, LibraryItem[]>();
  for (const item of list) {
    const key = item.month ?? "";
    months.set(key, [...(months.get(key) ?? []), item]);
  }
  const open = items.find((i) => i.id === openId) ?? null;

  return (
    <div className="lib">
      {choices.length > 1 ? (
        <div className="work-chips lib-filters" role="group" aria-label="تصفية المحتوى">
          {choices.map((c) => (
            <button
              key={c.key}
              type="button"
              className="work-chip"
              aria-pressed={filter === c.key}
              onClick={() => setFilter(c.key)}
            >
              {c.label} <span className="work-chip-count num">{c.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {[...months.entries()].map(([month, pieces]) => (
        <section key={month || "none"} className="lib-month">
          <h3 className="lib-month-head">
            {monthLabel(month || null)} <span className="p-meta num">{pieces.length}</span>
          </h3>
          <ul className="lib-grid">
            {pieces.map((item) => {
              const src = broken[item.id] ? null : coverOf(item);
              return (
                <li key={item.id}>
                  <button type="button" className="lib-card" onClick={() => setOpenId(item.id)}>
                    {src ? (
                      <>
                        <span className={`lib-cover lib-cover-${item.format}`}>
                          {/* Notion and Drive covers are external and short-lived; no next/image. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className={item.aspect === "16:9" ? undefined : "lib-img-fill"}
                            onError={() => setBroken((b) => ({ ...b, [item.id]: true }))}
                          />
                          {item.format === "video" && item.stage === "done" ? (
                            <span className="lib-play" aria-hidden="true" />
                          ) : null}
                          {item.live ? <span className="lib-live">نشط الآن</span> : null}
                          {item.duration ? <span className="lib-dur num">{item.duration}</span> : null}
                        </span>
                        <span className="lib-name">{item.name}</span>
                      </>
                    ) : (
                      <span className={`lib-cover lib-cover-text lib-at-${item.stage}`}>
                        <span className="lib-stage-chip">{STAGE_LABEL[item.stage]}</span>
                        <span className="lib-text-title">{item.name}</span>
                        <Progress item={item} />
                      </span>
                    )}
                    <span className="lib-meta">
                      {[src ? STAGE_LABEL[item.stage] : FORMAT_LABEL[item.format], item.angle]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <PieceDialog item={open} onClose={() => setOpenId(null)} />
    </div>
  );
}

function PieceDialog({ item, onClose }: { item: LibraryItem | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
    setCopied(false);
  }, [item]);

  const copy = async () => {
    if (!item?.caption) return;
    try {
      await navigator.clipboard.writeText(item.caption);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const image = item ? coverOf(item, 1600) : null;
  const player =
    item?.driveId && item.format === "video" ? `https://drive.google.com/file/d/${item.driveId}/preview` : null;
  const journey = item ? JOURNEY[item.format] : null;
  const at = item ? stepOf(item) : -1;
  // Drive's own link, unless the piece already lists it among its links.
  const links = item
    ? [
        ...item.links,
        ...(item.url && !item.links.some((l) => l.url === item.url) ? [{ label: "افتح في درايف", url: item.url }] : []),
      ]
    : [];

  return (
    <dialog
      ref={ref}
      className="lib-dialog"
      aria-label={item?.name ?? "قطعة محتوى"}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dimmed backdrop (the dialog itself, outside its box) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {item && journey ? (
        <div className="lib-dialog-box">
          <button type="button" className="lib-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
          <div className={`lib-stage lib-stage-${player || image ? item.format : "text"}`}>
            {player ? (
              <iframe src={player} title={item.name} allow="autoplay; fullscreen" allowFullScreen />
            ) : image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={item.name} />
            ) : (
              <div className={`lib-script lib-at-${item.stage}`}>
                <span className="lib-stage-chip">{STAGE_LABEL[item.stage]}</span>
                <strong>{item.name}</strong>
                <Progress item={item} />
              </div>
            )}
          </div>

          <div className="lib-info">
            <div className="lib-tags">
              <span className="lib-tag">{FORMAT_LABEL[item.format]}</span>
              <span className={`lib-tag lib-tag-${item.stage}`}>{STAGE_LABEL[item.stage]}</span>
              {item.aspect ? <span className="lib-tag num">{item.aspect}</span> : null}
              {item.duration ? <span className="lib-tag num">{item.duration}</span> : null}
              {item.live ? <span className="lib-tag lib-tag-live">نشط في الإعلانات الآن</span> : null}
            </div>
            <h2>{item.name}</h2>
            <p className="p-meta">
              {[monthLabel(item.month), item.platforms.join("، ")].filter(Boolean).join(" · ")}
            </p>

            {item.angle ? (
              <div className="lib-field">
                <strong>الفكرة</strong>
                <p>{item.angle}</p>
              </div>
            ) : null}

            <div className="lib-field">
              <strong>رحلة القطعة مع كامبين</strong>
              <ol className="lib-journey">
                {journey.steps.map((step, i) => (
                  <li key={step} className={i < at ? "is-done" : i === at ? "is-now" : "is-todo"}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {item.caption ? (
              <div className="lib-field">
                <strong>الكابشن</strong>
                <p className="lib-caption">{item.caption}</p>
                <button type="button" className="p-link lib-copy" onClick={copy}>
                  {copied ? "تم النسخ ✓" : "انسخ الكابشن"}
                </button>
              </div>
            ) : null}

            {links.length || item.driveId ? (
              <div className="lib-actions">
                {links.map((l, i) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={i === 0 ? "btn-primary lib-btn" : "btn-outline lib-btn"}
                  >
                    {l.label}
                  </a>
                ))}
                {item.driveId && item.stage === "done" ? (
                  <a
                    href={`https://drive.google.com/uc?export=download&id=${item.driveId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline lib-btn"
                  >
                    تحميل
                  </a>
                ) : null}
              </div>
            ) : null}
            {player ? <p className="p-meta lib-hint">إذا لم يعمل الفيديو هنا، افتحه من درايف.</p> : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
