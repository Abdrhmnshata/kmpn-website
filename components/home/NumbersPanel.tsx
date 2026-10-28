"use client";

import { useState } from "react";

const HEADLINE = [
  { v: "+50", l: "شريك نجاح في الوطن العربي", c: "#EFEDE8" },
  { v: "$3.5M", l: "مبيعات عملائنا من 2019 للربع الثاني من 2025", c: "#FF5B4F" },
];

const MORE = [
  { v: "+25", l: "علامة تجارية مصممة بالكامل", c: "#FF5B4F" },
  { v: "+15", l: "شركة قُدنا تحولها الرقمي كاملًا", c: "#FAF7F2" },
  { v: "+35", l: "متجر إلكتروني في مصر والخليج", c: "#FAF7F2" },
  { v: "+14", l: "شركة ضاعفنا مبيعاتها", c: "#FAF7F2" },
];

type Stat = { v: string; l: string; c: string };

export function NumbersPanel({
  eyebrow = "كامبين في أرقام",
  headline = HEADLINE,
  more = MORE,
}: {
  eyebrow?: string;
  headline?: Stat[];
  more?: Stat[];
}) {
  const [open, setOpen] = useState(false);
  const label = open ? "إخفاء الأرقام" : "باقي الأرقام";

  return (
    <section
      className="dark-panel"
      style={{
        padding: "clamp(24px, 4vw, 44px)",
        display: "grid",
        gap: "clamp(18px, 2.4vw, 28px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            background: "#EE4037",
            color: "#fff",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={label}
          title={label}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1.5px solid rgba(250,247,242,.6)",
            background: "transparent",
            color: "#FAF7F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "transform .3s cubic-bezier(.22,1,.36,1)",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: "20px clamp(20px, 4vw, 64px)",
        }}
      >
        {headline.map((s) => (
          <div key={s.v} style={{ display: "grid", gap: 4 }}>
            <span
              className="num"
              dir="ltr"
              style={{
                fontSize: "clamp(44px, 6.4vw, 80px)",
                fontWeight: 800,
                lineHeight: 1.05,
                color: s.c,
                justifySelf: "start",
              }}
            >
              {s.v}
            </span>
            <span style={{ fontSize: "clamp(14px, 1.6vw, 17px)", color: "#C4BEB1" }}>
              {s.l}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          marginTop: open ? 0 : "calc(-1 * clamp(18px, 2.4vw, 28px))",
          transition:
            "grid-template-rows .6s cubic-bezier(.22,1,.36,1), opacity .45s, margin-top .6s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div className="acc-clip">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
              gap: 1,
              background: "rgba(250,247,242,.1)",
              border: "1px solid rgba(250,247,242,.12)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {more.map((s) => (
              <div
                key={s.v + s.l}
                style={{
                  background: "rgba(11,11,11,.5)",
                  padding: "18px 20px",
                  display: "grid",
                  gap: 4,
                  alignContent: "start",
                }}
              >
                <span
                  className="num"
                  dir="ltr"
                  style={{
                    fontSize: "clamp(26px, 3vw, 36px)",
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: s.c,
                    justifySelf: "start",
                  }}
                >
                  {s.v}
                </span>
                <span style={{ fontSize: 13.5, color: "#C4BEB1", lineHeight: 1.6 }}>
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
