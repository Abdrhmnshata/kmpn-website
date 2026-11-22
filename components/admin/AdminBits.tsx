import Link from "next/link";

/** Pieces shared by the /admin pages. */

export function Stat({
  label,
  value,
  sub,
  href,
  alert,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link href={href} prefetch={false} className={alert ? "card a-stat a-stat-alert" : "card a-stat"}>
      <span className="a-stat-label">{label}</span>
      <strong className="num">{value}</strong>
      {sub ? <span className="p-meta">{sub}</span> : null}
    </Link>
  );
}

/** Shown until SUPABASE_SERVICE_ROLE_KEY is set on the server. */
export function SignupsSetup() {
  return (
    <div className="p-banner">
      <strong>الحسابات المسجّلة مش ظاهرة لسه.</strong> محتاجين مفتاح Supabase السري: من Supabase ←
      Project Settings ← API Keys ← <span dir="ltr">service_role</span>، وحطه في Vercel باسم{" "}
      <code dir="ltr">SUPABASE_SERVICE_ROLE_KEY</code> (Sensitive).
    </div>
  );
}

/** When Notion or Supabase failed to answer this time. */
export function SourceErrors({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <p role="alert" className="p-notice p-notice-err">
      ماقدرناش نقرا: {errors.join("، ")}. اعمل refresh بعد شوية.
    </p>
  );
}

/** Filter links (?param=…) in the portal's chip style; `defaultKey` is the bare page. */
export function Filters({
  base,
  param,
  active,
  items,
  defaultKey = "all",
}: {
  base: string;
  param: string;
  active: string;
  items: { key: string; label: string; count: number }[];
  defaultKey?: string;
}) {
  return (
    <div className="work-chips">
      {items.map((f) => (
        <Link
          key={f.key}
          href={f.key === defaultKey ? base : `${base}?${param}=${f.key}`}
          prefetch={false}
          className="work-chip"
          aria-current={active === f.key ? "page" : undefined}
        >
          {f.label} <span className="work-chip-count num">{f.count}</span>
        </Link>
      ))}
    </div>
  );
}
