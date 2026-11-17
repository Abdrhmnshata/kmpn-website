import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { StudioCard } from "@/components/portfolio/StudioCard";
import { CompanyStatus } from "@/components/portfolio/bits";
import {
  STUDIO,
  companyStatus,
  countryLabel,
  getStudioProject,
  otherStudioProjects,
  studioServiceLabels,
} from "@/lib/portfolio";

type Params = { params: Promise<{ slug: string }> };

/** Every project is prerendered; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STUDIO.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getStudioProject((await params).slug);
  if (!p) return {};
  const title = `${p.name} · كامبين استوديو`;
  const description = `${studioServiceLabels(p).join("، ")} لعلامة ${p.name}، من تصميم كامبين استوديو.`;
  const images = p.cover ? [{ url: p.cover.src, width: p.cover.width, height: p.cover.height }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/portfolio/studio/${p.slug}` },
    openGraph: { title, description, url: `/portfolio/studio/${p.slug}`, images },
    twitter: { title, description, images: images?.map((i) => i.url) },
  };
}

function ExternalIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export default async function ProjectPage({ params }: Params) {
  const p = getStudioProject((await params).slug);
  if (!p) notFound();

  const services = studioServiceLabels(p);
  const country = countryLabel(p.country);
  const status = companyStatus(p.companyStatus);
  const facts: [string, string][] = [];
  if (country) facts.push(["الدولة", country]);
  if (p.year) facts.push(["السنة", p.year]);

  return (
    <div className="page">
      <Header ctaHref="#contact" />

      <main id="top">
        <div className="hero-zone" data-tone="sand">
          <div className="container">
            <nav
              aria-label="مسار التصفح"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: "clamp(24px, 3vw, 36px) 0 0",
                fontSize: 14,
                color: "var(--muted)",
              }}
            >
              <Link href="/portfolio">أعمالنا</Link>
              <span aria-hidden="true">←</span>
              <Link href="/portfolio/studio">كامبين استوديو</Link>
              <span aria-hidden="true">←</span>
              <span dir="auto" style={{ color: "var(--fg2)" }}>
                {p.name}
              </span>
            </nav>

            <section
              style={{
                padding: "clamp(16px, 2.5vw, 28px) 0 clamp(24px, 3vw, 36px)",
                display: "grid",
                gap: 16,
              }}
            >
              <h1
                className="num"
                style={{
                  fontSize: "clamp(36px, 6vw, 72px)",
                  lineHeight: 1.15,
                  fontWeight: 800,
                  textWrap: "balance",
                }}
              >
                {p.name}
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {services.map((s) => (
                  <span key={s} className="work-tag work-tag-lg">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="container">
          {p.cover && (
            <div className="work-hero" style={{ background: p.cover.color ?? "var(--sunk)" }}>
              <Image
                src={p.cover.src}
                width={p.cover.width}
                height={p.cover.height}
                alt={`هوية ${p.name}`}
                sizes="(max-width: 1200px) 100vw, 1120px"
                priority
              />
            </div>
          )}

          <section className="work-facts">
            <dl className="work-dl">
              <div>
                <dt>الخدمات</dt>
                <dd>{services.join(" · ")}</dd>
              </div>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              {status && (
                <div>
                  <dt>حالة الشركة</dt>
                  <dd>
                    <CompanyStatus status={status} />
                  </dd>
                </div>
              )}
            </dl>

            {(p.behance || p.brandBook) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {p.behance && (
                  <a
                    href={p.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ height: 50, padding: "0 24px", fontSize: 15, gap: 8 }}
                  >
                    المشروع كاملاً على Behance
                    <ExternalIcon />
                  </a>
                )}
                {p.brandBook && (
                  <a
                    href={p.brandBook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ height: 50, padding: "0 24px", fontSize: 15, gap: 8 }}
                  >
                    دليل الهوية
                    <ExternalIcon />
                  </a>
                )}
              </div>
            )}
          </section>

          {p.concept && (
            <section style={{ padding: "clamp(24px, 4vw, 48px) 0", display: "grid", gap: 20 }}>
              <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, lineHeight: 1.4 }}>
                فكرة الشعار
              </h2>
              <Image
                src={p.concept.src}
                width={p.concept.width}
                height={p.concept.height}
                alt={`شرح فكرة شعار ${p.name}`}
                sizes="(max-width: 1200px) 100vw, 1120px"
                className="work-concept"
              />
            </section>
          )}

          <section
            className="sec-line-t"
            style={{ padding: "clamp(32px, 5vw, 56px) 0 clamp(8px, 2vw, 16px)", display: "grid", gap: 20 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, lineHeight: 1.4 }}>
                مشاريع أخرى من الاستوديو
              </h2>
              <Link href="/portfolio/studio" className="vert-link">
                كل أعمال كامبين استوديو ←
              </Link>
            </div>
            <div className="work-grid" style={{ paddingBottom: 0 }}>
              {otherStudioProjects(p.slug).map((o) => (
                <StudioCard key={o.slug} project={o} />
              ))}
            </div>
          </section>

          <CtaSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
