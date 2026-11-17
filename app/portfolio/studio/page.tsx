import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { Accent, PageIntro } from "@/components/portfolio/PageIntro";
import { VerticalTabs } from "@/components/portfolio/VerticalTabs";
import { FilterGrid } from "@/components/portfolio/FilterGrid";
import { StudioCard } from "@/components/portfolio/StudioCard";
import { STUDIO, chipValues, studioServiceLabel } from "@/lib/portfolio";

const DESCRIPTION =
  "هويات بصرية واستراتيجيات علامات تجارية صمّمها فريق كامبين استوديو لعلامات في مصر والخليج. كل مشروع يبدأ باستراتيجية واضحة للعلامة، وينتهي بهوية جاهزة للظهور في كل مكان.";

export const metadata: Metadata = {
  title: "كامبين استوديو · أعمالنا · كامبين",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio/studio" },
  openGraph: { title: "كامبين استوديو · أعمالنا", description: DESCRIPTION, url: "/portfolio/studio" },
};

export default function StudioPage() {
  const chips = chipValues(STUDIO, (p) => p.services.filter((s) => studioServiceLabel(s))).map(
    (s) => ({ key: s, label: studioServiceLabel(s)! }),
  );

  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top">
        <div className="hero-zone" data-tone="sand">
          <div className="container">
            <PageIntro
              pill="كامبين استوديو"
              title={
                <>
                  هويات تُعرَف من <Accent>أول نظرة</Accent>.
                </>
              }
              text={DESCRIPTION}
            />
          </div>
        </div>

        <div className="container">
          <VerticalTabs current="studio" />

          <FilterGrid
            label="تصنيف مشاريع الاستوديو"
            chips={chips}
            items={STUDIO.map((p) => ({
              id: p.id,
              keys: p.services,
              node: <StudioCard project={p} />,
            }))}
          />

          <CtaSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
