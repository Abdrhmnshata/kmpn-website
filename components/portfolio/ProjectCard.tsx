import Image from "next/image";
import Link from "next/link";
import { serviceLabels, type Project } from "@/lib/portfolio";

const MAX_TAGS = 3;

export function ProjectCard({ project: p }: { project: Project }) {
  const labels = serviceLabels(p);
  const shown = labels.slice(0, MAX_TAGS);
  const more = labels.length - shown.length;

  return (
    <Link href={`/portfolio/${p.slug}`} className="story-card work-card">
      <div className="work-media" style={{ background: p.cover?.color ?? "var(--sunk)" }}>
        {p.cover && (
          <Image
            src={p.cover.src}
            width={p.cover.width}
            height={p.cover.height}
            alt={`هوية ${p.name}`}
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 380px"
          />
        )}
      </div>

      <div style={{ padding: "18px 20px 20px", display: "grid", gap: 12 }}>
        <h2 className="num" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>
          {p.name}
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {shown.map((l) => (
            <span key={l} className="work-tag">
              {l}
            </span>
          ))}
          {more > 0 && <span className="work-tag">+{more}</span>}
        </div>

        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          شاهد المشروع
          <span aria-hidden="true">←</span>
        </span>
      </div>
    </Link>
  );
}
