"use client";

import { useEffect, useState } from "react";

type Channel = {
  key: "meta" | "google";
  name: string;
  dates: string;
  roas: string;
  gradient: string;
  googleBar?: boolean;
  shot: string;
  shotAlt: string;
  shotTitle: string;
  rows: [string, string][];
};

const CHANNELS: Channel[] = [
  {
    key: "meta",
    name: "Meta Ads",
    dates: "JUL 2024 → SEP 2026",
    roas: "×12.16",
    gradient: "linear-gradient(135deg, #0866FF 0%, #0A3D99 45%, #061A40 100%)",
    shot: "/assets/shot-meta.png",
    shotAlt: "تقرير Meta Ads — Altawheed Wel Nour",
    shotTitle: "Meta Ads · All accounts",
    rows: [
      ["الإنفاق ← العائد", "2.39M ← 29.0M"],
      ["الظهور", "56.3M"],
      ["النقرات", "2.66M"],
      ["التحويلات", "18,457"],
      ["CPC", "0.90 EGP"],
    ],
  },
  {
    key: "google",
    name: "Google Ads",
    dates: "OCT 2024 → SEP 2026",
    roas: "×11.85",
    gradient: "linear-gradient(135deg, #34A853 0%, #16733A 45%, #0B2414 100%)",
    googleBar: true,
    shot: "/assets/shot-google.png",
    shotAlt: "تقرير Google Ads — T&N Official",
    shotTitle: "Google Ads · T&N Official",
    rows: [
      ["الإنفاق ← العائد", "1.91M ← 22.6M"],
      ["الظهور", "159.7M"],
      ["النقرات", "2.10M"],
      ["التحويلات", "15,390"],
      ["CPC", "0.91 EGP"],
    ],
  },
];

const METHOD: [string, string][] = [
  [
    "مصدر البيانات",
    "لوحة تقارير موحّدة بتجمع بيانات المتجر الإلكتروني، وإعلانات ميتا وجوجل، وتحليلات جوجل، وأدوات البحث، وصفحة فيسبوك. تم التصدير في 1 أكتوبر 2026.",
  ],
  [
    "المبيعات والطلبات",
    "مأخوذة مباشرة من سجلات المتجر الإلكتروني خلال 24 شهر من أكتوبر 2024 لسبتمبر 2026.",
  ],
  [
    "العائد على الإنفاق الإعلاني",
    "قيمة المبيعات المنسوبة لإعلانات ميتا وجوجل ÷ إجمالي الإنفاق: 4.29 مليون جنيه إنفاق مقابل 51.6 مليون جنيه عائد.",
  ],
];

function Lightbox({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="سكرين شوت"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(11,11,11,.86)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          color: "#FAF7F2",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((v) => !v);
            }}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 999,
              border: "1px solid #4A463E",
              background: "transparent",
              color: "#FAF7F2",
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {zoom ? "تصغير −" : "تكبير +"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: 0,
              background: "#FAF7F2",
              color: "#0B0B0B",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: zoom ? "flex-start" : "center",
          alignItems: "flex-start",
          padding: 16,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          onClick={() => setZoom((v) => !v)}
          style={{
            width: zoom ? "220%" : "100%",
            maxWidth: zoom ? "none" : 1400,
            height: "auto",
            borderRadius: 12,
            cursor: zoom ? "zoom-out" : "zoom-in",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export function AdResults() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [methOpen, setMethOpen] = useState(false);
  const [lb, setLb] = useState<Channel | null>(null);

  return (
    <>
      <div style={{ display: "grid", gap: 12 }}>
        <div className="res-grid">
          {CHANNELS.map((c) => {
            const isOpen = !!open[c.key];
            return (
              <div
                key={c.key}
                style={{
                  border: "1px solid rgba(255,255,255,.14)",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: c.gradient,
                  color: "#FAF7F2",
                }}
              >
                {c.googleBar ? (
                  <div
                    aria-hidden="true"
                    style={{
                      height: 4,
                      background:
                        "linear-gradient(90deg, #4285F4 0 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75% 100%)",
                    }}
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => setOpen((p) => ({ ...p, [c.key]: !p[c.key] }))}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "16px clamp(16px, 2.5vw, 22px)",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "#FAF7F2",
                    textAlign: "right",
                  }}
                >
                  <span style={{ display: "grid", gap: 2 }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{c.name}</span>
                    <span
                      className="mono"
                      dir="ltr"
                      style={{ fontSize: 11, color: "rgba(250,247,242,.72)" }}
                    >
                      {c.dates}
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ display: "grid", justifyItems: "end" }}>
                      <span
                        className="num"
                        dir="ltr"
                        style={{
                          fontSize: "clamp(22px, 2.6vw, 30px)",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          lineHeight: 1.2,
                        }}
                      >
                        {c.roas}
                      </span>
                      <span
                        style={{ fontSize: 11.5, color: "rgba(250,247,242,.72)" }}
                      >
                        ROAS
                      </span>
                    </span>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        border: "1.5px solid rgba(250,247,242,.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform .45s cubic-bezier(.22,1,.36,1)",
                        transform: isOpen ? "rotate(180deg)" : "none",
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
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </span>
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition: "grid-template-rows .6s cubic-bezier(.22,1,.36,1)",
                  }}
                >
                  <div className="acc-clip">
                    <div
                      style={{
                        padding:
                          "0 clamp(16px, 2.5vw, 22px) clamp(16px, 2.5vw, 22px)",
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(130px, 1fr))",
                          gap: 1,
                          background: "rgba(255,255,255,.12)",
                          border: "1px solid rgba(255,255,255,.14)",
                          borderRadius: 12,
                          overflow: "hidden",
                        }}
                      >
                        {c.rows.map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              display: "grid",
                              gap: 2,
                              padding: "12px 14px",
                              background: "rgba(0,0,0,.28)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "rgba(250,247,242,.72)",
                              }}
                            >
                              {label}
                            </span>
                            <span
                              style={{ fontWeight: 700, fontSize: 15 }}
                              dir="ltr"
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setLb(c)}
                        aria-label={`تكبير سكرين شوت ${c.name}`}
                        style={{
                          position: "relative",
                          display: "block",
                          padding: 0,
                          border: "1px solid rgba(255,255,255,.2)",
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#fff",
                          cursor: "zoom-in",
                          aspectRatio: "16 / 7",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.shot}
                          alt={c.shotAlt}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                            display: "block",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            bottom: 10,
                            left: 10,
                            background: "#0B0B0B",
                            color: "#FAF7F2",
                            borderRadius: 999,
                            padding: "4px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          اضغط للتكبير ⤢
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- data source & method ---- */}
      <div
        style={{
          marginTop: 16,
          border: "1px solid var(--line)",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        <button
          type="button"
          onClick={() => setMethOpen((v) => !v)}
          aria-expanded={methOpen}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            color: "var(--fg)",
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700 }}>
            مصدر الأرقام وطريقة حسابها
          </span>
          <span
            style={{
              width: 32,
              height: 32,
              flex: "none",
              borderRadius: "50%",
              border: "1.5px solid var(--line2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform .45s cubic-bezier(.22,1,.36,1)",
              transform: methOpen ? "rotate(180deg)" : "none",
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
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateRows: methOpen ? "1fr" : "0fr",
            transition: "grid-template-rows .6s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div className="acc-clip">
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "0 40px",
                padding: "0 20px 8px",
              }}
            >
              {METHOD.map(([title, body]) => (
                <div
                  key={title}
                  style={{
                    display: "grid",
                    gap: 4,
                    padding: "14px 0",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}
                  >
                    {title}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--fg2)",
                      lineHeight: 1.85,
                    }}
                  >
                    {body}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lb ? (
        <Lightbox src={lb.shot} title={lb.shotTitle} onClose={() => setLb(null)} />
      ) : null}
    </>
  );
}
