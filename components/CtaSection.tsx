import { BOOKING_URL } from "@/lib/content";

/** Section "10 CTA" — shared by Home, Services, Company and Values. */
export function CtaSection() {
  return (
    <section
      id="contact"
      style={{
        padding: "clamp(24px, 4vw, 48px) 0 clamp(48px, 6vw, 80px)",
        scrollMarginTop: 80,
      }}
    >
      <div className="cta-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/kmpn-cta-illustration.png"
          alt=""
          aria-hidden="true"
          className="cta-img"
        />
        <div className="cta-copy">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(238,64,55,.16)",
              color: "#FF7266",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#EE4037",
              }}
            />
            جلسة استكشافية مجانية
          </span>

          <h2
            style={{
              fontSize: "clamp(28px, 4.2vw, 50px)",
              lineHeight: 1.3,
              fontWeight: 700,
              color: "#FAF7F2",
              textWrap: "balance",
            }}
          >
            ابدأ تحويل أعمالك رقميًا بخطوات{" "}
            <span style={{ color: "#FF5B4F" }}>واضحة ومدروسة</span>
          </h2>

          <p
            style={{
              fontSize: "clamp(15px, 1.6vw, 18px)",
              lineHeight: 1.9,
              color: "#C4BEB1",
              maxWidth: "46ch",
            }}
          >
            احجز جلسة استكشافية نراجع فيها متجرك ونضع خطة تنفيذية تناسب أهدافك.
          </p>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 8,
              background: "#EE4037",
              color: "#fff",
              borderRadius: 999,
              height: 56,
              padding: "0 32px",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 16,
              fontWeight: 700,
              boxShadow: "0 14px 30px -12px rgba(238,64,55,.7)",
            }}
            className="cta-btn"
          >
            ابدأ تحوّلك الرقمي الآن! <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  );
}
