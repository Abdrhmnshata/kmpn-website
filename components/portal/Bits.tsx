import Link from "next/link";

export function Status({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={`p-status p-status-${tone}`}>
      <span className="p-status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="p-empty">
      <p>{children}</p>
      {action}
    </div>
  );
}

export function PageHead({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="p-head">
      <h1>{title}</h1>
      {lead ? <p>{lead}</p> : null}
    </header>
  );
}

/** Shown while the client's email isn't on any customer in Notion yet. */
export function NotLinked({ verified }: { verified: boolean }) {
  return (
    <div className="p-banner">
      {verified ? (
        <>
          <strong>حسابك جاهز.</strong> لم نربطه بمشاريعك بعد؛ إذا كنت عميلًا لكامبين{" "}
          <Link href="/portal/support" className="p-link">
            افتح تذكرة
          </Link>{" "}
          وسنربطه خلال يوم عمل.
        </>
      ) : (
        <>
          <strong>أكّد بريدك الإلكتروني</strong> من الرسالة التي أرسلناها لك، حتى تظهر مشاريعك
          وفواتيرك هنا.
        </>
      )}
    </div>
  );
}
