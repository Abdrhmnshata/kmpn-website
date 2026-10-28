"use client";

import { useState } from "react";
import { STEPS } from "@/lib/content";

function Check({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ProcessSteps() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <>
      {/* ---- desktop: tabs + panel ---- */}
      <div className="only-wide" style={{ display: "grid", gap: 24 }}>
        <div
          role="tablist"
          aria-label="خطوات العمل"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 8,
          }}
        >
          {STEPS.map((s, i) => (
            <button
              key={s.t}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 14,
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "right",
                background: i === active ? "var(--fg)" : "var(--sunk)",
                color: i === active ? "var(--bg)" : "var(--fg2)",
                transition: "background .25s, color .25s",
              }}
            >
              <span className="num" dir="ltr" style={{ fontWeight: 800, fontSize: 15 }}>
                {"0" + (i + 1)}
              </span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{s.t}</span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          style={{
            background: "var(--sunk)",
            borderRadius: 20,
            padding: "clamp(20px, 3vw, 28px)",
            display: "grid",
            gap: 12,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 16 }}>{step.d}</p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 8,
              color: "var(--fg2)",
            }}
          >
            {step.pts.map((p) => (
              <li key={p} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    flex: "none",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---- mobile: accordion ---- */}
      <div className="only-narrow" style={{ display: "grid", gap: 8 }}>
        {STEPS.map((s, i) => {
          const isOpen = i === active;
          return (
            <div
              key={s.t}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: isOpen ? "var(--fg)" : "var(--sunk)",
                color: isOpen ? "var(--bg)" : "var(--fg2)",
                transition: "background .3s, color .3s",
              }}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 16px",
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  fontFamily: "inherit",
                  textAlign: "right",
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="num" dir="ltr" style={{ fontWeight: 800 }}>
                    {"0" + (i + 1)}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{s.t}</span>
                </span>
                <span
                  style={{
                    transition: "transform .45s cubic-bezier(.22,1,.36,1)",
                    transform: isOpen ? "rotate(180deg)" : "none",
                    display: "flex",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
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
                <div className="acc-clip">
                  <div style={{ padding: "0 16px 16px", display: "grid", gap: 10 }}>
                    <p style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.8 }}>
                      {s.d}
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "grid",
                        gap: 6,
                        fontSize: 14,
                        opacity: 0.9,
                      }}
                    >
                      {s.pts.map((p) => (
                        <li
                          key={p}
                          style={{ display: "flex", gap: 8, alignItems: "center" }}
                        >
                          <span
                            style={{
                              flex: "none",
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "#EE4037",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={10} />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
