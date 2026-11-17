import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/** Frame of the login / sign-up pages: the site header, a centred card. */
export function AuthShell({
  title,
  lead,
  children,
  below,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  below?: React.ReactNode;
}) {
  return (
    <div className="page">
      <Header ctaHref="/contact" />
      <main className="container auth-wrap">
        <div className="auth-card">
          <span className="pill" style={{ justifySelf: "start" }}>
            <span className="dot" />
            بوابة العملاء
          </span>
          <h1 className="auth-title">{title}</h1>
          {lead ? <p className="auth-lead">{lead}</p> : null}
          {children}
        </div>
        {below ? <div className="auth-below">{below}</div> : null}
      </main>
      <Footer />
    </div>
  );
}
