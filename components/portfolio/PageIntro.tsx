import type { ReactNode } from "react";

/** The pill + headline + paragraph that opens every "أعمالنا" page. */
export function PageIntro({
  pill,
  title,
  text,
}: {
  pill: string;
  title: ReactNode;
  text: string;
}) {
  return (
    <section
      style={{
        padding: "clamp(40px, 6vw, 80px) 0 clamp(20px, 3vw, 32px)",
        display: "grid",
        gap: 14,
        maxWidth: "64ch",
      }}
    >
      <span className="pill" style={{ justifySelf: "start" }}>
        <span className="dot" />
        {pill}
      </span>
      <h1
        style={{
          fontSize: "clamp(34px, 5vw, 60px)",
          lineHeight: 1.3,
          fontWeight: 700,
          textWrap: "balance",
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 16.5, lineHeight: 1.9, color: "var(--fg2)", textWrap: "pretty" }}>
        {text}
      </p>
    </section>
  );
}

export const Accent = ({ children }: { children: ReactNode }) => (
  <span style={{ color: "var(--accent)" }}>{children}</span>
);
