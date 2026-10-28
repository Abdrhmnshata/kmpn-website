"use client";

import { useState } from "react";
import {
  AXIS,
  MILESTONES,
  N,
  ORDERS,
  PEAK,
  PHASES,
  START,
  TAB_COLUMNS,
  monthLabel,
  phaseOf,
  xR,
} from "@/lib/tawheed";

export function Timeline() {
  const [phase, setPhase] = useState(3);
  const [hov, setHov] = useState<number | null>(null);

  const P = PHASES[phase];
  const h = hov ?? (phase === 3 ? PEAK : P.to);
  const hv = h >= START ? ORDERS[h - START] : null;

  const move = (next: number) => setPhase(Math.max(0, Math.min(3, next)));

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
        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
            التايملاين · 40 شهر
          </span>
          <h2
            style={{
              fontSize: "clamp(26px, 3.2vw, 40px)",
              lineHeight: 1.35,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            نبني، نطلق، ننمي — شهر بشهر.
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="mono"
            style={{ fontSize: 12, color: "var(--muted)" }}
            dir="ltr"
          >
            {"0" + (phase + 1)} / 04
          </span>
          <button
            type="button"
            onClick={() => move(phase - 1)}
            aria-label="المرحلة السابقة"
            className="round-btn"
            style={{ opacity: phase === 0 ? 0.35 : 1 }}
          >
            →
          </button>
          <button
            type="button"
            onClick={() => move(phase + 1)}
            aria-label="المرحلة التالية"
            className="round-btn"
            style={{ opacity: phase === 3 ? 0.35 : 1 }}
          >
            ←
          </button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <div
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                move(phase + 1);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                move(phase - 1);
              }
            }}
            style={{ minWidth: 820, padding: "20px 20px 12px" }}
          >
            {/* ---- phase tabs ---- */}
            <div
              role="tablist"
              aria-label="المراحل"
              style={{
                display: "grid",
                gridTemplateColumns: TAB_COLUMNS,
                gap: 4,
              }}
            >
              {PHASES.map((p, i) => (
                <button
                  key={p.n}
                  type="button"
                  role="tab"
                  aria-selected={i === phase}
                  onClick={() => {
                    setPhase(i);
                    setHov(null);
                  }}
                  style={{
                    textAlign: "right",
                    border: 0,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "grid",
                    gap: 2,
                    minWidth: 0,
                    background:
                      i === phase
                        ? "var(--fg)"
                        : i < phase
                          ? "var(--sunk)"
                          : "transparent",
                    color: i === phase ? "var(--bg)" : "var(--fg2)",
                    transition: "background .2s, color .2s",
                  }}
                >
                  <span
                    className="num"
                    style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}
                  >
                    {p.n}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1.35,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            {/* ---- milestones ---- */}
            <div style={{ position: "relative", height: 58, marginTop: 10 }}>
              {MILESTONES.map(([i, label, row]) => {
                const on = i >= P.from && i <= P.to;
                return (
                  <div
                    key={label}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: `${((i + 0.5) / N) * 100}%`,
                      transform: "translateX(50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        lineHeight: 1.3,
                        color: on ? "var(--fg)" : "var(--muted)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        width: 1,
                        height: row ? 26 : 8,
                        background: "var(--line2)",
                      }}
                    />
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background:
                          i === PEAK
                            ? "var(--accent)"
                            : on
                              ? "var(--fg)"
                              : "var(--line2)",
                        border: "2px solid var(--bg)",
                        boxShadow: `0 0 0 1px ${
                          i === PEAK
                            ? "var(--accent)"
                            : on
                              ? "var(--fg)"
                              : "var(--line2)"
                        }`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* ---- orders chart ---- */}
            <div style={{ position: "relative" }} onMouseLeave={() => setHov(null)}>
              <svg
                viewBox="0 0 400 150"
                preserveAspectRatio="none"
                style={{ width: "100%", height: 150, display: "block" }}
              >
                <rect
                  x={xR(P.to)}
                  y={0}
                  width={(P.to - P.from + 1) * 10}
                  height={150}
                  fill="var(--tint)"
                />
                <rect
                  x={xR(h)}
                  y={0}
                  width={10}
                  height={150}
                  fill="var(--fg)"
                  opacity={hov == null ? 0 : 0.06}
                />
                <line
                  x1="0"
                  x2="400"
                  y1="149.5"
                  y2="149.5"
                  stroke="var(--line2)"
                  vectorEffect="non-scaling-stroke"
                />

                {Array.from({ length: START }, (_, i) => (
                  <rect
                    key={`pre-${i}`}
                    x={xR(i) + 2}
                    y={146}
                    width={6}
                    height={3}
                    fill="var(--line2)"
                  />
                ))}

                {ORDERS.map((v, k) => {
                  const i = k + START;
                  const hh = (v / 2000) * 140;
                  const inP = i >= P.from && i <= P.to;
                  return (
                    <rect
                      key={`bar-${i}`}
                      x={xR(i) + 2}
                      y={150 - hh}
                      width={6}
                      height={hh}
                      fill={
                        i === PEAK
                          ? "var(--accent)"
                          : i === h
                            ? "var(--fg)"
                            : inP
                              ? "var(--fg2)"
                              : "var(--bar)"
                      }
                      opacity={inP || i === PEAK ? 1 : 0.55}
                    />
                  );
                })}

                {Array.from({ length: N }, (_, i) => (
                  <rect
                    key={`hit-${i}`}
                    x={xR(i)}
                    y={0}
                    width={10}
                    height={150}
                    fill="transparent"
                    onMouseEnter={() => {
                      setHov(i);
                      setPhase(phaseOf(i));
                    }}
                    onClick={() => {
                      setHov(i);
                      setPhase(phaseOf(i));
                    }}
                  />
                ))}
              </svg>

              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "grid",
                  gap: 2,
                  pointerEvents: "none",
                  maxWidth: "36%",
                }}
              >
                <span
                  style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}
                >
                  قبل المتجر الإلكتروني
                </span>
                <span style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.5 }}>
                  هوية · فروع · سوشيال
                </span>
              </div>

              <div
                dir="ltr"
                style={{
                  position: "absolute",
                  top: 10,
                  left: 12,
                  display: "grid",
                  gap: 0,
                  justifyItems: "end",
                  pointerEvents: "none",
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "8px 12px",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--muted)" }}
                >
                  {monthLabel(h)} · {PHASES[phaseOf(h)].name}
                </span>
                <span
                  className="num"
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    color: "var(--fg)",
                  }}
                >
                  {hv == null ? "—" : `${hv.toLocaleString("en-US")} orders`}
                </span>
              </div>
            </div>

            {/* ---- axis ---- */}
            <div
              dir="ltr"
              style={{ position: "relative", height: 24, marginTop: 6 }}
            >
              {AXIS.map(([i, label], k) => (
                <span
                  key={label}
                  className="mono"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: `${((i + (k === 4 ? 1 : 0)) / N) * 100}%`,
                    transform:
                      k === 0
                        ? "none"
                        : k === 4
                          ? "translateX(100%)"
                          : "translateX(50%)",
                    fontSize: 10.5,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- phase detail panel ---- */}
        <div
          style={{
            borderTop: "1px solid var(--line)",
            background: "var(--sunk)",
            padding: "clamp(20px, 3vw, 32px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "24px clamp(24px, 4vw, 48px)",
          }}
        >
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "6px 14px",
              }}
            >
              <span
                className="num"
                dir="ltr"
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "var(--accent)",
                }}
              >
                {P.n}
              </span>
              <h3
                style={{
                  fontSize: "clamp(20px, 2.2vw, 26px)",
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                {P.title}
              </h3>
              <span
                className="mono"
                dir="ltr"
                style={{ fontSize: 11.5, color: "var(--muted)" }}
              >
                {P.dates}
              </span>
            </div>
            <p style={{ color: "var(--fg2)", lineHeight: 1.9, textWrap: "pretty" }}>
              {P.desc}
            </p>
            {P.tags.length ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                {P.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 12px",
                      border: "1px solid var(--line2)",
                      borderRadius: 999,
                      fontSize: 12.5,
                      color: "var(--fg2)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {phase === 0 ? (
            <figure style={{ margin: 0, display: "grid", gap: 8, width: "100%" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "5 / 4",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#FFFFFF",
                }}
              >
                <iframe
                  src="https://cdn.knightlab.com/libs/juxtapose/latest/embed/index.html?uid=53913c2c-9f80-11f0-ba1b-0e6f42328d7d"
                  title="قبل وبعد الـ Rebranding"
                  scrolling="no"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                    overflow: "hidden",
                  }}
                />
              </div>
              <figcaption
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 12.5,
                  color: "var(--muted)",
                }}
              >
                <span>اللوجو قبل / بعد · اسحب للمقارنة</span>
                <span className="mono" dir="ltr" style={{ fontSize: 11 }}>
                  BEFORE / AFTER
                </span>
              </figcaption>
            </figure>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1,
                background: "var(--line)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                overflow: "hidden",
                alignSelf: "start",
              }}
            >
              {P.stats.map(([v, l, acc]) => (
                <div
                  key={l}
                  style={{
                    background: "var(--bg)",
                    padding: "14px 16px",
                    display: "grid",
                    gap: 2,
                  }}
                >
                  <span
                    className="num"
                    dir="ltr"
                    style={{
                      fontSize: "clamp(20px, 2.2vw, 26px)",
                      fontWeight: 800,
                      lineHeight: 1.3,
                      color: acc ? "var(--accent)" : "var(--fg)",
                    }}
                  >
                    {v}
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
        <span
          className="only-narrow-inline"
          style={{ color: "var(--accent)", fontWeight: 600 }}
        >
          اسحب التايملاين ← ·{" "}
        </span>
        اختار مرحلة أو استخدم الأسهم · مرّر على أي شهر لقراءة الأوردرز (Shopify).
      </p>
    </>
  );
}
