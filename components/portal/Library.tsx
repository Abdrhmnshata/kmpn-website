"use client";

import { useEffect, useRef, useState } from "react";
import type { LibraryItem } from "@/lib/portal/notion";
import { formatMonth } from "@/lib/portal/format";

/**
 * «مكتبة المحتوى»: the paid creatives KMPN delivered, as a gallery of
 * covers grouped by the month they went out. Covers only in the grid (one
 * Drive player per page would be far too heavy); a piece opens in a dialog
 * with Drive's player, its details and the way it was made.
 */

const FORMAT_LABEL: Record<LibraryItem["format"], string> = {
  video: "فيديو",
  static: "تصميم",
  carousel: "كاروسيل",
};

/** How KMPN made it: every delivered piece went through all of these. */
const JOURNEY: Record<LibraryItem["format"], string[]> = {
  video: ["الفكرة", "السكريبت", "التصوير", "المونتاج", "النسخة النهائية"],
  static: ["الفكرة", "الكوبي", "التصميم", "النسخة النهائية"],
  carousel: ["الفكرة", "الكوبي", "التصميم", "النسخة النهائية"],
};

type Filter = "all" | LibraryItem["format"];

const coverOf = (item: LibraryItem, width = 600) =>
  item.cover ?? (item.driveId ? `https://drive.google.com/thumbnail?id=${item.driveId}&sz=w${width}` : null);

const monthLabel = (key: string | null) => (key ? formatMonth(`${key}-01T12:00:00`) : "بدون شهر");

export function LibraryGrid({ items }: { items: LibraryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [broken, setBroken] = useState<Record<string, true>>({});

  const formats = (["video", "static", "carousel"] as const).filter((f) => items.some((i) => i.format === f));
  const list = filter === "all" ? items : items.filter((i) => i.format === filter);
  const months = new Map<string, LibraryItem[]>();
  for (const item of list) {
    const key = item.month ?? "";
    months.set(key, [...(months.get(key) ?? []), item]);
  }
  const open = items.find((i) => i.id === openId) ?? null;

  return (
    <div className="lib">
      {formats.length > 1 ? (
        <div className="work-chips lib-filters" role="group" aria-label="نوع المحتوى">
          <button type="button" className="work-chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            الكل <span className="work-chip-count num">{items.length}</span>
          </button>
          {formats.map((f) => (
            <button key={f} type="button" className="work-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "static" ? "تصميمات" : f === "video" ? "فيديوهات" : FORMAT_LABEL[f]}{" "}
              <span className="work-chip-count num">{items.filter((i) => i.format === f).length}</span>
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
                    <span className={`lib-cover lib-cover-${item.format}`}>
                      {src ? (
                        // Notion and Drive covers are external and short-lived; no next/image.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          className={item.aspect === "16:9" ? undefined : "lib-img-fill"}
                          onError={() => setBroken((b) => ({ ...b, [item.id]: true }))}
                        />
                      ) : (
                        <span className="lib-cover-none">{FORMAT_LABEL[item.format]}</span>
                      )}
                      {item.format === "video" ? <span className="lib-play" aria-hidden="true" /> : null}
                      {item.live ? <span className="lib-live">نشط الآن</span> : null}
                      {item.duration ? <span className="lib-dur num">{item.duration}</span> : null}
                    </span>
                    <span className="lib-name">{item.name}</span>
                    <span className="lib-meta">
                      {[FORMAT_LABEL[item.format], item.angle].filter(Boolean).join(" · ")}
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
      {item ? (
        <div className="lib-dialog-box">
          <button type="button" className="lib-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
          <div className={`lib-stage lib-stage-${item.format}`}>
            {player ? (
              <iframe src={player} title={item.name} allow="autoplay; fullscreen" allowFullScreen />
            ) : image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={item.name} />
            ) : (
              <span className="lib-cover-none">{FORMAT_LABEL[item.format]}</span>
            )}
          </div>

          <div className="lib-info">
            <div className="lib-tags">
              <span className="lib-tag">{FORMAT_LABEL[item.format]}</span>
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
                {JOURNEY[item.format].map((step) => (
                  <li key={step}>{step}</li>
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

            {item.url ? (
              <div className="lib-actions">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-primary lib-btn">
                  افتح في درايف
                </a>
                {item.driveId ? (
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
