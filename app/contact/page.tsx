import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "تواصل معنا · كامبين",
  description: "اطلب عرضًا توضيحيًا وسنقوم بالرد عليكم في أقرب وقت.",
};

const CONTACTS = [
  { label: "البريد", value: "a@kmpn.agency", href: "mailto:a@kmpn.agency" },
  {
    label: "إنستجرام",
    value: "@kmpn_agency",
    href: "https://www.instagram.com/kmpn_agency/",
  },
];

export default function ContactPage() {
  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top" className="container">
        <section
          style={{
            padding: "clamp(40px, 6vw, 80px) 0 clamp(48px, 6vw, 80px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "32px clamp(28px, 5vw, 64px)",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <span className="pill" style={{ justifySelf: "start" }}>
              <span className="dot" />
              تواصل معنا
            </span>
            <h1
              style={{
                fontSize: "clamp(32px, 4.6vw, 54px)",
                lineHeight: 1.3,
                fontWeight: 700,
                textWrap: "balance",
              }}
            >
              املأ البيانات الآن وابدأ في تحول تجارتك{" "}
              <span style={{ color: "var(--accent)" }}>رقمياً</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: "var(--fg2)" }}>
              اطلب عرضًا توضيحيًا وسنقوم بالرد عليكم في أقرب وقت.
            </p>

            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    padding: "14px 18px",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    {c.label}
                  </span>
                  <strong dir="ltr">{c.value}</strong>
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "var(--sunk)",
              borderRadius: 24,
              padding: "clamp(20px, 3vw, 32px)",
            }}
          >
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
