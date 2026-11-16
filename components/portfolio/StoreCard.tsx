import Image from "next/image";
import {
  countryLabel,
  displayHost,
  logoBackground,
  migrationLabel,
  type Store,
} from "@/lib/portfolio";
import { CardFooter, LogoMedia, PinIcon } from "./bits";

export function StoreCard({ store: s }: { store: Store }) {
  const country = countryLabel(s.country);
  const migration = migrationLabel(s.migratedFrom);

  const inner = (
    <>
      {s.image ? (
        <div className="work-media" style={{ background: s.image.color ?? "#0E1A1F" }}>
          <Image
            src={s.image.src}
            width={s.image.width}
            height={s.image.height}
            alt={`متجر ${s.name}`}
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 380px"
          />
        </div>
      ) : s.logo ? (
        <LogoMedia logo={s.logo} alt={`شعار ${s.name}`} />
      ) : (
        <div className="work-media" style={{ background: "var(--sunk)" }} />
      )}

      <div className="work-body">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {s.logo && s.image && (
            <span className="work-avatar" style={{ background: logoBackground(s.logo) }}>
              <Image src={s.logo.src} width={s.logo.width} height={s.logo.height} alt="" sizes="36px" />
            </span>
          )}
          <h3 className="num work-title">{s.name}</h3>
        </div>

        <div className="work-meta">
          {country && (
            <span>
              <PinIcon />
              {country}
            </span>
          )}
          {s.year && <span className="num">{s.year}</span>}
          {migration && <span>{migration}</span>}
        </div>

        {s.url && <CardFooter label={displayHost(s.url)} external />}
      </div>
    </>
  );

  return s.url ? (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="story-card work-card">
      {inner}
    </a>
  ) : (
    <div className="work-card">{inner}</div>
  );
}
