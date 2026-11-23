import Link from "next/link";
import {
  caseCover,
  caseMonthly,
  caseName,
  casePage,
  casePerformance,
  caseStore,
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
  const name = caseName(c);
  const monthly = caseMonthly(c);
  const performance = casePerformance(c);
  const cover = caseCover(c);
  const store = caseStore(c);
  const hasNumbers = Boolean(c.roi || monthly || performance);

  const inner = (
    <>
      {cover ? (
        <div className="work-media" style={{ background: "var(--sunk)" }}>
          {/* Covers from the stories, Studio and Commerce: sizes vary, so a plain cropped image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.src} alt={name} loading="lazy" />
        </div>
      ) : c.logo ? (
        <LogoMedia logo={c.logo} alt={`شعار ${name}`} />
      ) : (
        <div className="work-media" style={{ background: "var(--sunk)" }} />
      )}

      <div className="work-body">
        <div style={{ display: "grid", gap: 8 }}>
          <h3 className="work-title">{name}</h3>
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
            {monthly && (
              <div>
                <dt>الرقم الشهري</dt>
                <dd>{c.monthlyAr ? monthly : <bdi dir="ltr">{monthly}</bdi>}</dd>
              </div>
            )}
            {performance && (
              <div>
                <dt>الأداء</dt>
                <dd>{c.performanceAr ? performance : <bdi dir="ltr">{performance}</bdi>}</dd>
              </div>
            )}
          </dl>
        )}

        <TagList labels={digitalServiceLabels(c)} max={4} />

        {page ? (
          <CardFooter label="اقرأ القصة كاملة" />
        ) : store ? (
          <CardFooter label={displayHost(store)} external />
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
  if (store) {
    return (
      <a href={store} target="_blank" rel="noopener noreferrer" className="story-card work-card">
        {inner}
      </a>
    );
  }
  return <div className="work-card">{inner}</div>;
}
