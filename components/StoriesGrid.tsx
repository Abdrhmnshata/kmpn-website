"use client";

import Link from "next/link";
import { useState } from "react";
import { FILTERS, storyCover, tagColors, type Story } from "@/lib/stories";

function PinIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

const metaPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 10px",
  borderRadius: 999,
  border: "1px solid var(--line2)",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--fg2)",
};

function Card({ s }: { s: Story }) {
  const cover = storyCover(s);

  const inner = (
    <>
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          background: "var(--sunk)",
          overflow: "hidden",
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={s.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <span
            aria-hidden="true"
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--line2)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9.5" r="1.6" />
              <path d="M21 16l-5-5-5.5 5.5L8 14l-5 5" />
            </svg>
          </span>
        )}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          {s.tags.map((t) => {
            const [bg, fg] = tagColors(t);
            return (
              <span
                key={t}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: bg,
                  color: fg,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  lineHeight: 1.4,
                }}
              >
                {t}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "18px 20px 20px", display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{s.client}</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              margin: "4px 0 2px",
            }}
          >
            <span style={metaPill}>
              <PinIcon />
              {s.country}
            </span>
            <span style={metaPill}>
              <CalIcon />
              {s.period}
            </span>
          </div>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1.5,
              textWrap: "balance",
            }}
          >
            {s.title}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 14,
            background:
              "linear-gradient(135deg, #3A1210 0%, #1A0B0A 50%, #0B0B0B 100%)",
            color: "#FAF7F2",
          }}
        >
          <div style={{ display: "grid", gap: 0 }}>
            <span style={{ fontSize: 11.5, color: "#C4BEB1" }}>قبل</span>
            <span
              className="num"
              dir="ltr"
              style={{
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1.3,
                justifySelf: "start",
              }}
            >
              {s.from}
            </span>
          </div>
          <svg
            width="40"
            height="14"
            viewBox="0 0 40 14"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M39 7H2M8 1L2 7l6 6" />
          </svg>
          <div style={{ display: "grid", gap: 0 }}>
            <span style={{ fontSize: 11.5, color: "#C4BEB1" }}>بعد</span>
            <span
              className="num"
              dir="ltr"
              style={{
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1.3,
                color: "#FF5B4F",
                justifySelf: "start",
              }}
            >
              {s.to}
            </span>
          </div>
          <span style={{ gridColumn: "1/-1", fontSize: 12, color: "#C4BEB1" }}>
            {s.metric}
          </span>
        </div>

        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            fontWeight: 700,
            color: s.soon ? "var(--muted)" : "var(--accent)",
          }}
        >
          {s.soon ? "قريباً" : "اقرأ القصة"}
          <span aria-hidden="true">←</span>
        </span>
      </div>
    </>
  );

  const style: React.CSSProperties = {
    display: "grid",
    border: "1px solid var(--line)",
    borderRadius: 20,
    overflow: "hidden",
    background: "var(--bg)",
    color: "var(--fg)",
    transition: "transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s",
    cursor: s.soon ? "default" : "pointer",
  };

  if (s.soon || !s.href) {
    return (
      <div className="story-card" aria-disabled="true" style={style}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={s.href} className="story-card" style={style}>
      {inner}
    </Link>
  );
}

export function StoriesGrid({ stories }: { stories: Story[] }) {
  const [filter, setFilter] = useState(FILTERS[0]);

  const list = stories.filter(
    (s) => filter === "الكل" || (s.cats.length ? s.cats : s.tags).includes(filter),
  );

  return (
    <>
      <div
        role="tablist"
        aria-label="تصنيف القصص"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          paddingBottom: 20,
          borderBottom: "1px solid var(--line)",
          marginBottom: 24,
        }}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              style={{
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--fg)" : "var(--line2)"}`,
                background: active ? "var(--fg)" : "transparent",
                color: active ? "var(--bg)" : "var(--fg2)",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background .2s, color .2s",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {list.length ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: 16,
            paddingBottom: "clamp(48px, 6vw, 80px)",
          }}
        >
          {list.map((s) => (
            <Card key={s.slug} s={s} />
          ))}
        </section>
      ) : (
        <p
          style={{
            margin: "0 0 64px",
            padding: 32,
            textAlign: "center",
            border: "1px dashed var(--line2)",
            borderRadius: 16,
            color: "var(--muted)",
          }}
        >
          لا توجد قصص في هذا التصنيف بعد.
        </p>
      )}
    </>
  );
}
