import Link from "next/link";
import { VERTICALS, type VerticalKey } from "@/lib/portfolio";

/** Switches between the whole of "أعمالنا" and each vertical's page. */
export function VerticalTabs({ current }: { current: VerticalKey | "all" }) {
  const tabs = [
    { key: "all", label: "كل الأعمال", href: "/portfolio", count: null as number | null },
    ...VERTICALS.map((v) => ({ key: v.key, label: v.name, href: v.href, count: v.count })),
  ];

  return (
    <nav aria-label="وحدات كامبين" className="work-chips work-tabs">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className="work-chip"
          aria-current={t.key === current ? "page" : undefined}
        >
          {t.label}
          {t.count !== null && <span className="work-chip-count num">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
