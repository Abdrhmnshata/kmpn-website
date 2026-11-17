import Link from "next/link";
import type { PortalData, Project, Ticket } from "@/lib/portal/notion";
import {
  INVOICE_STATUS,
  TICKET_STATUS,
  customerStatus,
  formatDate,
  formatMoney,
  formatRange,
  isAwaiting,
  isDoneProject,
  meetingStatus,
  projectStatus,
  resourceStatus,
  serviceLabel,
} from "@/lib/portal/format";
import { Empty, NotLinked, PageHead, Status } from "./Bits";

/**
 * The portal's screens, fed only by PortalData (already filtered by the
 * layer in lib/portal/layer.ts). Shared by /portal and the local preview.
 */

export type Tab = "projects" | "resources" | "meetings" | "invoices" | "support";
export type HrefFor = (tab: Tab) => string;

/* ------------------------------------------------------------ helpers ---- */

/** Top-level projects with their sub-projects, open ones first. */
function tree(projects: Project[]) {
  const ids = new Set(projects.map((p) => p.id));
  const children = new Map<string, Project[]>();
  const top: Project[] = [];
  for (const p of projects) {
    if (p.parentId && ids.has(p.parentId)) {
      children.set(p.parentId, [...(children.get(p.parentId) ?? []), p]);
    } else {
      top.push(p);
    }
  }
  const order = (a: Project, b: Project) =>
    Number(isDoneProject(a.status)) - Number(isDoneProject(b.status)) ||
    (a.start ?? "9").localeCompare(b.start ?? "9");
  top.sort(order);
  children.forEach((list) => list.sort(order));
  return { top, children };
}

function Card({
  title,
  href,
  count,
  children,
}: {
  title: string;
  href: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-card">
      <div className="p-card-head">
        <h2>
          {title}
          {count ? <span className="p-count num">{count}</span> : null}
        </h2>
        <Link href={href} className="p-link" style={{ fontSize: 14 }}>
          عرض الكل ←
        </Link>
      </div>
      {children}
    </section>
  );
}

/* ----------------------------------------------------------- dashboard ---- */

export function DashboardView({
  name,
  data,
  verified,
  href,
}: {
  name: string;
  data: PortalData;
  verified: boolean;
  href: HrefFor;
}) {
  const { top } = tree(data.projects);
  const openProjects = top.filter((p) => !isDoneProject(p.status));
  const awaiting = data.resources.filter((r) => isAwaiting(r.status));
  const unpaid = data.invoices.filter((i) => i.status === "unpaid" || i.status === "overdue");
  const due = Object.entries(
    unpaid.reduce<Record<string, number>>((acc, i) => {
      acc[i.currency] = (acc[i.currency] ?? 0) + (i.amount ?? 0);
      return acc;
    }, {}),
  );

  return (
    <>
      <h1 className="p-hello">
        مرحبًا،
        <br />
        {name}
      </h1>

      {data.customers.map((c) => (
        <div key={c.id} className="p-client">
          <strong>{c.company}</strong>
          <Status label={customerStatus(c.status)[0]} tone={customerStatus(c.status)[1]} />
          {c.services.length ? (
            <span className="p-services">{c.services.map(serviceLabel).join(" · ")}</span>
          ) : null}
        </div>
      ))}
      {!data.linked ? <NotLinked verified={verified} /> : null}

      <div className="p-grid">
        <Card title="المشاريع" href={href("projects")} count={openProjects.length ? String(openProjects.length) : undefined}>
          {openProjects.length ? (
            <ul className="p-mini">
              {openProjects.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <Status label={projectStatus(p.status)[0]} tone={projectStatus(p.status)[1]} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{top.length ? "تم تسليم جميع المشاريع." : "ليس لديك أي مشاريع حتى الآن."}</Empty>
          )}
        </Card>

        <Card title="المطلوب منك" href={href("resources")} count={awaiting.length ? String(awaiting.length) : undefined}>
          {awaiting.length ? (
            <ul className="p-mini">
              {awaiting.slice(0, 4).map((r) => (
                <li key={r.id}>
                  <span>{r.name}</span>
                  {r.due ? <span className="p-meta">{formatDate(r.due)}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>لا يوجد شيء مطلوب منك الآن.</Empty>
          )}
        </Card>

        <Card title="الاجتماعات" href={href("meetings")}>
          {data.meetings.length ? (
            <ul className="p-mini">
              {data.meetings.slice(0, 3).map((m) => (
                <li key={m.id}>
                  <span>{m.name}</span>
                  <span className="p-meta">{formatDate(m.date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>لا توجد اجتماعات بعد.</Empty>
          )}
        </Card>

        <Card title="الفواتير" href={href("invoices")}>
          {data.invoices.length ? (
            <p className="p-figure">
              {due.length ? (
                due.map(([cur, sum]) => (
                  <span key={cur} className="num">
                    {formatMoney(sum, cur)}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 17 }}>لا توجد مبالغ مستحقة</span>
              )}
            </p>
          ) : (
            <Empty>ليس لديك أي فواتير حتى الآن.</Empty>
          )}
        </Card>

        <Card title="التذاكر" href={href("support")}>
          {data.tickets.length ? (
            <ul className="p-mini">
              {data.tickets.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <span>{t.subject}</span>
                  <Status label={TICKET_STATUS[t.status][0]} tone={TICKET_STATUS[t.status][1]} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>ليس لديك أي مشاكل حتى الآن.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ projects ---- */

export function ProjectsView({ data }: { data: PortalData }) {
  const { top, children } = tree(data.projects);
  const services = [...new Set(data.customers.flatMap((c) => c.services))];
  return (
    <>
      <PageHead title="المشاريع" lead="مراحل العمل التي ينفذها فريق كامبين معك، وحالة كل مرحلة." />
      {services.length ? (
        <div className="p-chips">
          {services.map((s) => (
            <span key={s} className="p-chip">
              {serviceLabel(s)}
            </span>
          ))}
        </div>
      ) : null}

      {top.length ? (
        <div className="p-list">
          {top.map((p) => {
            const kids = children.get(p.id) ?? [];
            const [label, tone] = projectStatus(p.status);
            return (
              <article key={p.id} className="card p-project">
                <div className="p-row">
                  <div className="p-row-main">
                    <h2>{p.name}</h2>
                    {formatRange(p.start, p.end) ? (
                      <span className="p-meta">{formatRange(p.start, p.end)}</span>
                    ) : null}
                  </div>
                  <Status label={label} tone={tone} />
                </div>
                {kids.length ? (
                  <ul className="p-subs">
                    {kids.map((k) => (
                      <li key={k.id}>
                        <span>{k.name}</span>
                        <Status label={projectStatus(k.status)[0]} tone={projectStatus(k.status)[1]} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <Empty>ليس لديك أي مشاريع حتى الآن.</Empty>
      )}
    </>
  );
}

/* ----------------------------------------------------------- resources ---- */

export function ResourcesView({ data }: { data: PortalData }) {
  const awaiting = data.resources.filter((r) => isAwaiting(r.status));
  const rest = data.resources.filter((r) => !isAwaiting(r.status));
  return (
    <>
      <PageHead
        title="المطلوب منك"
        lead="الملفات والبيانات التي نحتاجها منك لاستكمال العمل، وكل ما استلمناه."
      />
      {awaiting.length ? (
        <div className="p-list">
          {awaiting.map((r) => (
            <article key={r.id} className="card p-row">
              <div className="p-row-main">
                <h2>{r.name}</h2>
              </div>
              <div className="p-row-side">
                {r.due ? <span className="p-meta">مطلوب قبل {formatDate(r.due)}</span> : null}
                <Status label={resourceStatus(r.status)[0]} tone={resourceStatus(r.status)[1]} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty>لا يوجد شيء مطلوب منك الآن.</Empty>
      )}

      {rest.length ? (
        <details className="p-more">
          <summary>
            باقي الملفات والطلبات <span className="num">({rest.length})</span>
          </summary>
          <ul className="p-mini">
            {rest.map((r) => (
              <li key={r.id}>
                <span>{r.name}</span>
                <Status label={resourceStatus(r.status)[0]} tone={resourceStatus(r.status)[1]} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------ meetings ---- */

export function MeetingsView({ data }: { data: PortalData }) {
  return (
    <>
      <PageHead title="الاجتماعات" lead="اجتماعاتك مع فريق كامبين." />
      {data.meetings.length ? (
        <div className="p-list">
          {data.meetings.map((m) => (
            <article key={m.id} className="card p-row">
              <div className="p-row-main">
                <h2>{m.name}</h2>
                <span className="p-meta">{formatDate(m.date)}</span>
              </div>
              <Status label={meetingStatus(m.status)[0]} tone={meetingStatus(m.status)[1]} />
            </article>
          ))}
        </div>
      ) : (
        <Empty>لا توجد اجتماعات بعد.</Empty>
      )}
    </>
  );
}

/* ------------------------------------------------------------ invoices ---- */

export function InvoicesView({ data }: { data: PortalData }) {
  return (
    <>
      <PageHead title="الفواتير" lead="كل فواتيرك مع كامبين وحالة سدادها." />
      {data.invoices.length ? (
        <div className="p-list">
          {data.invoices.map((i) => (
            <article key={i.id} className="card p-row">
              <div className="p-row-main">
                <h2 className="num" dir="ltr" style={{ textAlign: "right" }}>
                  {i.number}
                </h2>
                <p>{[i.description, i.company].filter(Boolean).join(" · ")}</p>
                <span className="p-meta">
                  صدرت {formatDate(i.issued)}
                  {i.due ? ` · تستحق ${formatDate(i.due)}` : ""}
                </span>
              </div>
              <div className="p-row-side">
                <strong className="num p-amount">{formatMoney(i.amount, i.currency)}</strong>
                <Status label={INVOICE_STATUS[i.status][0]} tone={INVOICE_STATUS[i.status][1]} />
                {i.fileUrl ? (
                  <a href={i.fileUrl} target="_blank" rel="noopener noreferrer" className="p-link">
                    تحميل الفاتورة
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty>ليس لديك أي فواتير حتى الآن.</Empty>
      )}
    </>
  );
}

/* ------------------------------------------------------------- tickets ---- */

export function TicketsList({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="p-list">
      <h2 className="p-sub">تذاكرك</h2>
      {tickets.length ? (
        tickets.map((t) => (
          <article key={t.id} className="card p-ticket">
            <div className="p-ticket-head">
              <h3>{t.subject}</h3>
              <Status label={TICKET_STATUS[t.status][0]} tone={TICKET_STATUS[t.status][1]} />
            </div>
            <span className="p-meta">{formatDate(t.created)}</span>
            {t.message ? <p className="p-ticket-msg">{t.message}</p> : null}
            {t.reply ? (
              <div className="p-reply">
                <strong>رد فريق كامبين</strong>
                <p>{t.reply}</p>
              </div>
            ) : null}
          </article>
        ))
      ) : (
        <Empty>ليس لديك أي تذاكر حتى الآن.</Empty>
      )}
    </section>
  );
}
