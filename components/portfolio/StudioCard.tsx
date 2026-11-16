import Image from "next/image";
import Link from "next/link";
import { companyStatus, countryLabel, studioServiceLabels, type StudioProject } from "@/lib/portfolio";
import { CardFooter, CompanyStatus, PinIcon, TagList } from "./bits";

export function StudioCard({ project: p }: { project: StudioProject }) {
  const country = countryLabel(p.country);
  const status = companyStatus(p.companyStatus);

  return (
    <Link href={`/portfolio/studio/${p.slug}`} className="story-card work-card">
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

      <div className="work-body">
        <div style={{ display: "grid", gap: 8 }}>
          <h3 className="num work-title">{p.name}</h3>
          {(country || status) && (
            <div className="work-meta">
              {country && (
                <span>
                  <PinIcon />
                  {country}
                </span>
              )}
              {status && <CompanyStatus status={status} />}
            </div>
          )}
        </div>
        <TagList labels={studioServiceLabels(p)} />
        <CardFooter label="شاهد المشروع" />
      </div>
    </Link>
  );
}
