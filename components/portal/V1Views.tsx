import Link from "next/link";
import type { Contract, Deliverable, DeliverableFile, EditThread, PortalData } from "@/lib/portal/notion";
import {
  DELIVERABLE_TYPES,
  contractKind,
  contractStatus,
  deliverableStatus,
  deliverableType,
  formatDate,
  formatMonth,
} from "@/lib/portal/format";
import { Empty, PageHead, Status } from "./Bits";
import { EditRequest } from "./EditRequest";

/**
 * Portal V1 sections (Notion page "Sign Up System"): deliverables with edit
 * requests and contracts, plus the «قريبًا» screen for the V2 sections.
 */

/* ------------------------------------------------------------ previews ---- */

/** At most this many embedded previews per deliverable; the rest are links. */
const MAX_FRAMES = 2;

function FilePreview({ file }: { file: DeliverableFile }) {
  if (file.kind === "image" && file.preview) {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer" className="d-media d-media-img">
        {/* Notion and Drive URLs are external and short-lived; no next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={file.preview} alt={file.name} loading="lazy" />
      </a>
    );
  }
  if (file.kind === "video" && file.preview) {
    return <video className="d-media" src={file.preview} controls preload="metadata" />;
  }
  if ((file.kind === "drive" || file.kind === "folder") && file.preview) {
    return (
      <iframe
        className={file.kind === "folder" ? "d-media d-media-folder" : "d-media"}
        src={file.preview}
        title={file.name}
        loading="lazy"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }
  return null;
}

function Files({ files }: { files: DeliverableFile[] }) {
  if (!files.length) return null;
  let frames = 0;
  const shown = files.filter((f) => {
    if (!f.preview) return false;
    if (f.kind === "drive" || f.kind === "folder") return frames++ < MAX_FRAMES;
    return true;
  });
  return (
    <>
      {shown.length ? (
        <div className={shown.length > 1 ? "d-gallery" : "d-gallery d-gallery-one"}>
          {shown.map((f) => (
            <FilePreview key={f.url} file={f} />
          ))}
        </div>
      ) : null}
      <ul className="d-files">
        {files.map((f) => (
          <li key={f.url}>
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="p-link">
              {f.kind === "folder" ? "فتح المجلد" : "فتح الملف"}
            </a>
            <span className="p-meta" dir="auto">
              {f.name.length > 60 ? `${f.name.slice(0, 57)}…` : f.name}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Threads({ threads }: { threads: EditThread[] }) {
  if (!threads.length) return null;
  return (
    <div className="d-threads">
      <strong className="d-threads-title">طلبات التعديل</strong>
      {threads.map((t) => {
        const answered = t.messages.some((m) => !m.fromClient);
        return (
          <div key={t.id} className="d-thread">
            {t.messages.map((m, i) => (
              <div key={i} className={m.fromClient ? "d-msg d-msg-client" : "d-msg d-msg-team"}>
                <span className="d-msg-who">{m.fromClient ? "طلبك" : "فريق كامبين"}</span>
                <p>{m.text}</p>
                <span className="p-meta">{formatDate(m.created)}</span>
              </div>
            ))}
            {answered ? null : <span className="p-meta">بانتظار رد الفريق</span>}
          </div>
        );
      })}
    </div>
  );
}

function DeliverableCard({
  d,
  threads,
  canRequest,
}: {
  d: Deliverable;
  threads: EditThread[];
  canRequest: boolean;
}) {
  const [label, tone] = deliverableStatus(d.status);
  return (
    <article className="card d-card">
      <div className="d-card-head">
        <div className="d-card-title">
          <h3>{d.name}</h3>
          <div className="d-card-meta">
            {d.types.map((t) => (
              <span key={t} className="p-chip">
                {deliverableType(t)}
              </span>
            ))}
            {d.date ? <span className="p-meta">{formatDate(d.date)}</span> : null}
          </div>
        </div>
        <Status label={label} tone={tone} />
      </div>
      <Files files={d.files} />
      <Threads threads={threads} />
      <EditRequest deliverableId={d.id} enabled={canRequest} />
    </article>
  );
}

/* -------------------------------------------------------- deliverables ---- */

export function DeliverablesView({
  data,
  threads,
  type,
  hrefFor,
  canRequest,
}: {
  data: PortalData;
  threads: Record<string, EditThread[]>;
  type?: string;
  hrefFor: (type: string | null) => string;
  canRequest: boolean;
}) {
  const active = DELIVERABLE_TYPES.find((t) => t.key.toLowerCase() === type?.toLowerCase())?.key ?? null;
  const count = (key: string) => data.deliverables.filter((d) => d.types.includes(key)).length;
  const list = active ? data.deliverables.filter((d) => d.types.includes(active)) : data.deliverables;

  // Newest month first; rows are already newest first.
  const months = new Map<string, Deliverable[]>();
  for (const d of list) {
    const m = formatMonth(d.date);
    months.set(m, [...(months.get(m) ?? []), d]);
  }

  return (
    <>
      <PageHead
        title="التسليمات"
        lead="كل ما سلّمناه لك: المكتبة الإبداعية والمستندات والأدلة الإرشادية والشيتات. وإذا احتجت تعديلًا على أي تسليم، اطلبه من أسفله."
      />
      <div className="work-chips">
        <Link href={hrefFor(null)} className="work-chip" aria-current={active ? undefined : "page"}>
          الكل <span className="work-chip-count num">{data.deliverables.length}</span>
        </Link>
        {DELIVERABLE_TYPES.map((t) => (
          <Link
            key={t.key}
            href={hrefFor(t.key)}
            className="work-chip"
            aria-current={active === t.key ? "page" : undefined}
          >
            {t.label} <span className="work-chip-count num">{count(t.key)}</span>
          </Link>
        ))}
      </div>

      {list.length ? (
        [...months.entries()].map(([month, items]) => (
          <section key={month} className="d-month">
            <h2 className="p-sub">{month}</h2>
            <div className="p-list">
              {items.map((d) => (
                <DeliverableCard key={d.id} d={d} threads={threads[d.id] ?? []} canRequest={canRequest} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <Empty>لا توجد تسليمات {active ? "في هذا القسم" : ""} حتى الآن.</Empty>
      )}
    </>
  );
}

/* ----------------------------------------------------------- contracts ---- */

function ContractRow({ c }: { c: Contract }) {
  const [label, tone] = contractStatus(c.status);
  return (
    <article className="card p-row">
      <div className="p-row-main">
        <h2>{c.name}</h2>
        <span className="p-meta">
          {[contractKind(c.kind), c.due ? formatDate(c.due) : ""].filter(Boolean).join(" · ")}
        </span>
      </div>
      <div className="p-row-side">
        <Status label={label} tone={tone} />
        {c.files.map((f) => (
          <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="p-link">
            تحميل {c.files.length > 1 ? f.name : "الملف"}
          </a>
        ))}
      </div>
    </article>
  );
}

export function ContractsView({ data }: { data: PortalData }) {
  return (
    <>
      <PageHead title="العقود" lead="عقودك وعروض الأسعار مع كامبين." />
      {data.contracts.length ? (
        <div className="p-list">
          {data.contracts.map((c) => (
            <ContractRow key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <Empty>لا توجد عقود أو عروض حتى الآن.</Empty>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- soon ---- */

export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHead title={title} />
      <div className="card p-card p-soon">
        <span className="p-soon-badge">قريبًا</span>
        <p>هذا القسم قادم في النسخة القادمة من بوابة العملاء.</p>
      </div>
    </>
  );
}
