import Link from "next/link";
import { adminSnapshot } from "@/lib/admin/data";
import { Empty, PageHead, Status } from "@/components/portal/Bits";
import { Filters, SignupsSetup, SourceErrors } from "@/components/admin/AdminBits";
import { LinkSignup } from "@/components/admin/AdminForms";
import { formatDate } from "@/lib/portal/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "المسجّلين · لوحة المدير" };

export default async function SignupsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const [{ filter = "all" }, { clients, signups, errors, clientsOf }] = await Promise.all([
    searchParams,
    adminSnapshot({ tickets: false }),
  ]);
  const all = signups ?? [];
  const groups = {
    all,
    waiting: all.filter((s) => s.verified && !clientsOf(s.email).length),
    linked: all.filter((s) => clientsOf(s.email).length),
    unconfirmed: all.filter((s) => !s.verified),
  };
  const active = filter in groups ? (filter as keyof typeof groups) : "all";
  const list = groups[active];
  const choices = clients.map((c) => ({ id: c.id, company: c.company }));

  return (
    <>
      <PageHead
        title="المسجّلين"
        lead="كل اللي عملوا حساب في البوابة. اللي أكد إيميله ومش مربوط، اختار العميل بتاعه واربطه، وهيشوف بياناته من أول refresh."
      />
      <SourceErrors errors={errors} />
      {signups === null && !errors.length ? <SignupsSetup /> : null}
      {signups ? (
        <Filters
          base="/admin/signups"
          param="filter"
          active={active}
          items={[
            { key: "all", label: "الكل", count: groups.all.length },
            { key: "waiting", label: "مستنيين ربط", count: groups.waiting.length },
            { key: "linked", label: "مربوطين", count: groups.linked.length },
            { key: "unconfirmed", label: "مأكدوش الإيميل", count: groups.unconfirmed.length },
          ]}
        />
      ) : null}

      {list.length ? (
        <div className="p-list">
          {list.map((s) => {
            const linked = clientsOf(s.email);
            return (
              <article key={s.id} className="card p-row a-signup">
                <div className="p-row-main">
                  <h2>{s.name || s.email.split("@")[0]}</h2>
                  <span className="p-meta" dir="ltr" style={{ display: "block", textAlign: "start" }}>
                    {s.email}
                  </span>
                  <span className="p-meta">
                    {[
                      s.company && `الشركة: ${s.company}`,
                      s.phone && `موبايل: ${s.phone}`,
                      `سجّل ${formatDate(s.created)}`,
                      s.lastSignIn ? `آخر دخول ${formatDate(s.lastSignIn)}` : "مدخلش لسه",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className="p-row-side">
                  {s.verified ? <Status label="أكد الإيميل" tone="ok" /> : <Status label="مأكدش الإيميل" tone="warn" />}
                  {linked.map((c) => (
                    <Link key={c.id} href={`/admin/view/${c.id}`} prefetch={false} className="p-chip">
                      {c.company}
                    </Link>
                  ))}
                  {!linked.length && s.verified ? <LinkSignup email={s.email} clients={choices} /> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : signups ? (
        <Empty>مفيش حسابات هنا.</Empty>
      ) : null}
    </>
  );
}
