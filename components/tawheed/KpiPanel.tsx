"use client";

import { useState } from "react";

const EXTRA: { v: string; unit?: string; l: string; total?: boolean }[] = [
  { v: "33.8M", unit: "EGP", l: "إجمالي المبيعات أونلاين", total: true },
  { v: "×12", l: "عائد على الإنفاق · ROAS" },
  { v: "23,934", l: "طلب أونلاين" },
  { v: "6.28M", l: "زائر على الموقع" },
  { v: "50M", l: "ظهور أورجانيك على بحث جوجل" },
];

function BigNumber({
  value,
  unit,
  color,
}: {
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 6 }}>
      <span
        className="num"
        dir="ltr"
        style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 800,
          lineHeight: 1.1,
          color,
        }}
      >
        {value}
      </span>
      <span className="mono" style={{ fontSize: 11, color: "#C4BEB1" }}>
        {unit}
      </span>
    </span>
  );
}

export function KpiPanel() {
  const [open, setOpen] = useState(false);
  const label = open ? "إخفاء الأرقام" : "باقي الأرقام";

  return (
    <div
      style={{
        marginBottom: 16,
        border: "1px solid rgba(238,64,55,.28)",
        borderRadius: 20,
        padding: "clamp(20px, 3.4vw, 40px)",
        display: "grid",
        gap: "clamp(18px, 2.4vw, 28px)",
        background:
          "linear-gradient(135deg, #3A1210 0%, #1A0B0A 45%, #0B0B0B 100%)",
        color: "#FAF7F2",
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
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13.5,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          خلال سنتين
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={label}
          title={label}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid rgba(250,247,242,.6)",
            background: "transparent",
            color: "#FAF7F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "transform .22s cubic-bezier(.22,1,.36,1)",
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
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
          alignItems: "center",
          gap: "12px clamp(16px, 4vw, 64px)",
          maxWidth: 900,
          width: "100%",
          justifySelf: "center",
        }}
      >
        <div style={{ display: "grid", gap: 2 }}>
          <span
            style={{
              fontSize: "clamp(14px, 1.6vw, 18px)",
              color: "#EFEDE8",
              fontWeight: 500,
            }}
          >
            قبل المتجر
          </span>
          <BigNumber value="0" unit="EGP" color="#EFEDE8" />
          <span style={{ fontSize: 12, color: "#C4BEB1" }}>مبيعات أونلاين شهرية</span>
        </div>

        <svg
          height="16"
          viewBox="0 0 120 16"
          preserveAspectRatio="none"
          style={{ width: "clamp(48px, 10vw, 120px)" }}
          fill="none"
          stroke="#FAF7F2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M119 8H3M9 2L3 8l6 6" />
        </svg>

        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontSize: "clamp(14px, 1.6vw, 18px)",
              color: "#EFEDE8",
              fontWeight: 500,
            }}
          >
            بعد سنتين
          </span>
          <BigNumber value="6M" unit="EGP" color="#FF5B4F" />
          <span style={{ fontSize: 12, color: "#C4BEB1" }}>مبيعات أونلاين شهرية</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          marginTop: open ? 0 : "calc(-1 * clamp(18px, 2.4vw, 28px) - 18px)",
          transition:
            "grid-template-rows .6s cubic-bezier(.22,1,.36,1), opacity .45s ease, margin-top .6s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div className="acc-clip">
          <div className="kpi-grid">
            {EXTRA.map((s) => (
              <div
                key={s.l}
                className={s.total ? "kpi-total" : undefined}
                style={{
                  background: "rgba(11,11,11,.55)",
                  padding: "16px 20px",
                  display: "grid",
                  gap: 2,
                  alignContent: "center",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span
                    className="num"
                    dir="ltr"
                    style={{
                      fontSize: s.total
                        ? "clamp(28px, 3.6vw, 46px)"
                        : "clamp(22px, 2.6vw, 30px)",
                      fontWeight: 800,
                      lineHeight: 1.25,
                      color: s.total ? "#FF5B4F" : undefined,
                    }}
                  >
                    {s.v}
                  </span>
                  {s.unit ? (
                    <span className="mono" style={{ fontSize: 11, color: "#C4BEB1" }}>
                      {s.unit}
                    </span>
                  ) : null}
                </span>
                <span
                  style={{ fontSize: 12.5, color: "#C4BEB1", lineHeight: 1.5 }}
                >
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
