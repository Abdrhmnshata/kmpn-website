"use client";

import { useRef } from "react";

type Item =
  | { kind: "img"; slot: string; alt: string }
  | { kind: "video"; id: string; title: string };

const ITEMS: Item[] = [
  { kind: "img", slot: "tw3-logo", alt: "الشعار والنظام الكتابي" },
  { kind: "img", slot: "tw3-palette", alt: "نظام الألوان" },
  { kind: "video", id: "1123884239", title: "حملات الهوية" },
  { kind: "img", slot: "tw3-pack", alt: "Packaging" },
  { kind: "img", slot: "tw3-signage", alt: "Signage الفروع" },
  { kind: "video", id: "1123828905", title: "المتجر والتطبيق" },
  { kind: "img", slot: "tw3-campaign", alt: "حملات موسمية" },
];

const cellStyle: React.CSSProperties = {
  flex: "0 0 clamp(240px, 30vw, 340px)",
  scrollSnapAlign: "start",
  aspectRatio: "1 / 1",
  borderRadius: 16,
  overflow: "hidden",
};

export function BrandCarousel() {
  const rail = useRef<HTMLDivElement>(null);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    el.scrollBy({
      left: dir * (first.getBoundingClientRect().width + 12),
      behavior: "smooth",
    });
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "grid", gap: 8, maxWidth: "58ch" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
            الهوية
          </span>
          <h2
            style={{
              fontSize: "clamp(26px, 3.2vw, 40px)",
              lineHeight: 1.35,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            حافظنا على الألوان، الروح، الاسم.
          </h2>
          <p style={{ color: "var(--fg2)", lineHeight: 1.85, textWrap: "pretty" }}>
            جددنا الشعار وتصميمه، وطبّقنا الهوية في كل عنصر تواصل مع العملاء.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="السابق"
            className="round-btn"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="التالي"
            className="round-btn"
          >
            ←
          </button>
        </div>
      </div>

      <div ref={rail} className="brand-rail">
        {ITEMS.map((item) =>
          item.kind === "img" ? (
            <div key={item.slot} style={cellStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/slots/${item.slot}.webp`}
                alt={item.alt}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div
              key={item.id}
              style={{ ...cellStyle, position: "relative", background: "#191919" }}
            >
              <iframe
                src={`https://player.vimeo.com/video/${item.id}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0`}
                title={item.title}
                allow="autoplay"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          ),
        )}
      </div>
    </>
  );
}
