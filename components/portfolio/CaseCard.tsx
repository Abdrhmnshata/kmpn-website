import Link from "next/link";
import {
  casePage,
  countryLabel,
  digitalServiceLabels,
  displayHost,
  industryLabels,
  solutionLabel,
  type DigitalCase,
} from "@/lib/portfolio";
import { CardFooter, LogoMedia, PinIcon, TagList } from "./bits";

export function CaseCard({ item: c }: { item: DigitalCase }) {
  const page = casePage(c);
  const solution = solutionLabel(c.solution);
  const country = countryLabel(c.country);
  const industries = industryLabels(c);
  const hasNumbers = Boolean(c.roi || c.monthly || c.performance);

  const inner = (
    <>
      {c.logo ? (
        <LogoMedia logo={c.logo} alt={`شعار ${c.brand}`} />
      ) : (
        <div className="work-media" style={{ background: "var(--sunk)" }} />
      )}

      <div className="work-body">
        <div style={{ display: "grid", gap: 8 }}>
          <h3 className="num work-title">{c.brand}</h3>
          <div className="work-meta">
            {solution && <span className="work-tag work-tag-accent">{solution}</span>}
            {industries.map((i) => (
              <span key={i}>{i}</span>
            ))}
            {country && (
              <span>
                <PinIcon />
                {country}
              </span>
            )}
          </div>
        </div>

        {hasNumbers && (
          <dl className="work-numbers">
            {c.roi && (
              <div className="work-roi">
                <dt>العائد</dt>
                <dd className="num" dir="ltr">
                  {c.roi}
                </dd>
              </div>
            )}
            {c.monthly && (
              <div>
                <dt>الرقم الشهري</dt>
                <dd>
                  <bdi dir="ltr">{c.monthly}</bdi>
                </dd>
              </div>
            )}
            {c.performance && (
              <div>
                <dt>الأداء</dt>
                <dd>
                  <bdi dir="ltr">{c.performance}</bdi>
                </dd>
              </div>
            )}
          </dl>
        )}

        <TagList labels={digitalServiceLabels(c)} max={4} />

        {page ? (
          <CardFooter label="اقرأ القصة كاملة" />
        ) : c.store ? (
          <CardFooter label={displayHost(c.store)} external />
        ) : null}
      </div>
    </>
  );

  if (page) {
    return (
      <Link href={page} className="story-card work-card">
        {inner}
      </Link>
    );
  }
  if (c.store) {
    return (
      <a href={c.store} target="_blank" rel="noopener noreferrer" className="story-card work-card">
        {inner}
      </a>
    );
  }
  return <div className="work-card">{inner}</div>;
}
