import Image from "next/image";
import { logoBackground, type companyStatus, type Img } from "@/lib/portfolio";

/** "● تعمل الآن": the client company's current status, as a coloured dot. */
export function CompanyStatus({
  status,
}: {
  status: NonNullable<ReturnType<typeof companyStatus>>;
}) {
  return (
    <span className={`work-status work-status-${status.tone}`}>
      <span className="work-status-dot" aria-hidden="true" />
      {status.label}
    </span>
  );
}

const MAX_TAGS = 3;

export function TagList({ labels, max = MAX_TAGS }: { labels: string[]; max?: number }) {
  const shown = labels.slice(0, max);
  const more = labels.length - shown.length;
  if (!shown.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {shown.map((l) => (
        <span key={l} className="work-tag">
          {l}
        </span>
      ))}
      {more > 0 && <span className="work-tag">+{more}</span>}
    </div>
  );
}

export function CardFooter({ label, external }: { label: string; external?: boolean }) {
  return (
    <span className="work-footer">
      {label}
      <span aria-hidden="true">{external ? "↗" : "←"}</span>
    </span>
  );
}

/** A logo centred on its own background, filling a card's media box. */
export function LogoMedia({ logo, alt }: { logo: Img; alt: string }) {
  return (
    <div className="work-media work-media-logo" style={{ background: logoBackground(logo) }}>
      <Image src={logo.src} width={logo.width} height={logo.height} alt={alt} sizes="240px" />
    </div>
  );
}

export function PinIcon() {
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
