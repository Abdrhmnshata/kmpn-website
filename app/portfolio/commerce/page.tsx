import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { Accent, PageIntro } from "@/components/portfolio/PageIntro";
import { VerticalTabs } from "@/components/portfolio/VerticalTabs";
import { FilterGrid } from "@/components/portfolio/FilterGrid";
import { StoreCard } from "@/components/portfolio/StoreCard";
import { COMMERCE, chipValues, countryLabel } from "@/lib/portfolio";

const DESCRIPTION =
  "متاجر أطلقناها من الصفر أو نقلناها إلى شوبيفاي من منصات أخرى، لعلامات في مصر والخليج. كل المتاجر هنا تعمل الآن، افتح أي متجر وجرّبه بنفسك.";

export const metadata: Metadata = {
  title: "كامبين كومرس · أعمالنا · كامبين",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio/commerce" },
  openGraph: { title: "كامبين كومرس · أعمالنا", description: DESCRIPTION, url: "/portfolio/commerce" },
};

export default function CommercePage() {
  const chips = chipValues(COMMERCE, (s) => (s.country ? [s.country] : [])).map((c) => ({
    key: c,
    label: countryLabel(c)!,
  }));

  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top">
        <div className="hero-zone" data-tone="mint">
          <div className="container">
            <PageIntro
              pill="كامبين كومرس"
              title={
                <>
                  متاجر شوبيفاي <Accent>تبيع فعلاً</Accent>.
                </>
              }
              text={DESCRIPTION}
            />
          </div>
        </div>

        <div className="container">
          <VerticalTabs current="commerce" />

          <FilterGrid
            label="تصنيف المتاجر"
            chips={chips}
            items={COMMERCE.map((s) => ({
              id: s.id,
              keys: s.country ? [s.country] : [],
              node: <StoreCard store={s} />,
            }))}
          />

          <CtaSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
