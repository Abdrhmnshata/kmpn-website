import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StoriesGrid } from "@/components/StoriesGrid";
import { getStories } from "@/lib/stories";

export const metadata: Metadata = {
  title: "قصص النجاح · كامبين",
  description:
    "كل قصة هنا بدأت بتحدٍّ واضح وانتهت بنتيجة يمكن قياسها — من الهوية إلى المتجر إلى الإعلانات.",
};

/** Keeps the Supabase-backed list fresh without a rebuild. */
export const revalidate = 60;

export default async function SuccessStoriesPage() {
  const stories = await getStories();

  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top" className="container">
        <section
          style={{
            padding: "clamp(40px, 6vw, 80px) 0 clamp(24px, 3vw, 36px)",
            display: "grid",
            gap: 14,
            maxWidth: "62ch",
          }}
        >
          <span className="pill" style={{ justifySelf: "start" }}>
            <span className="dot" />
            قصص النجاح
          </span>
          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 60px)",
              lineHeight: 1.3,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            أرقام حقيقية، من <span style={{ color: "var(--accent)" }}>قبل</span> لـ{" "}
            <span style={{ color: "var(--accent)" }}>بعد</span>.
          </h1>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.9,
              color: "var(--fg2)",
              textWrap: "pretty",
            }}
          >
            كل قصة هنا بدأت بتحدٍّ واضح وانتهت بنتيجة يمكن قياسها — من الهوية إلى
            المتجر إلى الإعلانات.
          </p>
        </section>

        <StoriesGrid stories={stories} />
      </main>

      <Footer />
    </div>
  );
}
