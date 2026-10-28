"use client";

import { useState } from "react";
import { PHASES } from "@/lib/content";

export function MethodCard() {
  const [open, setOpen] = useState(0);
  const cover = PHASES[open < 0 ? 0 : open];

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
        gap: "clamp(20px, 3vw, 40px)",
        alignItems: "stretch",
        border: "1px solid var(--line)",
        borderRadius: 24,
        padding: "clamp(14px, 2.4vw, 24px)",
      }}
    >
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "var(--bg)",
          aspectRatio: "4 / 3",
          alignSelf: "center",
          padding: "clamp(8px, 1.5vw, 16px)",
        }}
      >
        <span
          role="img"
          aria-label={cover.t}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            background: "center/contain no-repeat",
            backgroundImage: `url("${cover.img}")`,
            mixBlendMode: "var(--img-blend)" as React.CSSProperties["mixBlendMode"],
            filter: "var(--img-filter)",
            transition: "background-image .4s ease",
          }}
        />
      </div>

      <div style={{ display: "grid", alignContent: "center" }}>
        {PHASES.map((ph, i) => {
          const isOpen = i === open;
          return (
            <div
              key={ph.n}
              style={{ borderBottom: "1px solid var(--line)", display: "grid" }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: "18px 0",
                  border: 0,
                  background: "transparent",
                  color: "var(--fg)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  textAlign: "right",
                }}
              >
                <span
                  className="num"
                  dir="ltr"
                  style={{
                    fontSize: "clamp(28px, 3vw, 36px)",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "var(--accent)",
                    flex: "none",
                  }}
                >
                  {ph.n}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: "clamp(18px, 2vw, 22px)",
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  {ph.t}
                </span>
                <span
                  className="acc-chev"
                  style={{
                    width: 32,
                    height: 32,
                    transform: isOpen ? "rotate(180deg)" : "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>

              <div
                className="acc-rows"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="acc-clip" style={{ display: "grid", gap: 12 }}>
                  <p style={{ color: "var(--fg2)", lineHeight: 1.85 }}>{ph.d}</p>
                  <ul
                    style={{
                      margin: "0 0 18px",
                      padding: 0,
                      listStyle: "none",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {ph.pts.map((p) => (
                      <li
                        key={p}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          fontSize: 14.5,
                        }}
                      >
                        <span
                          style={{
                            flex: "none",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "var(--fg)",
                            color: "var(--bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
