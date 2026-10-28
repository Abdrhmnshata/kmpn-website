"use client";

import { useState } from "react";
import { GROWTH } from "@/lib/content";

const OPEN_BG =
  "linear-gradient(var(--ok-bg), var(--ok-bg)) padding-box, linear-gradient(120deg,#32AC63,#8FD9AE,#1DB4D8,#32AC63) border-box";
const CLOSED_BG =
  "linear-gradient(var(--bg), var(--bg)) padding-box, linear-gradient(var(--line), var(--line)) border-box";

export function GrowthAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {GROWTH.map((g, i) => {
        const isOpen = i === open;
        return (
          <div
            key={g.t}
            style={{
              border: `${isOpen ? "1.5px" : "1px"} solid transparent`,
              borderRadius: 16,
              overflow: "hidden",
              background: isOpen ? OPEN_BG : CLOSED_BG,
              boxShadow: isOpen ? "0 12px 32px -14px rgba(50,172,99,.45)" : "none",
              transition: "box-shadow .45s, background .45s",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "16px 18px",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                color: "var(--fg)",
                textAlign: "right",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {g.t}
              <span
                className="acc-chev"
                style={{
                  width: 30,
                  height: 30,
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

            <div className="acc-rows" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="acc-clip">
                <div
                  style={{
                    padding: "0 18px 18px",
                    display: "grid",
                    gap: 10,
                    color: "var(--fg2)",
                    fontSize: 14.5,
                  }}
                >
                  <p>{g.d}</p>
                  <ol style={{ margin: 0, padding: 0, display: "grid", gap: 6 }}>
                    {g.pts.map((p) => (
                      <li
                        key={p}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          listStyle: "none",
                        }}
                      >
                        <span style={{ flex: "none", color: "#32AC63", fontWeight: 800 }}>
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
