import "server-only";
import { unstable_cache } from "next/cache";
import {
  CATEGORIES,
  DEFAULT_OPEN,
  NEVER,
  SECTIONS,
  SECTION_OPTION,
  categoryOf,
  openFor,
  type Category,
  type Section,
} from "./layer";

/**
 * Client-portal data, read live from Notion through the layer in ./layer.ts.
 *
 *   customer   the client's row in "KC - Master Customers", matched when the
 *              client's confirmed email is in its "Portal Emails" field;
 *   projects,     databases found under the client's KC page and on the page
 *   deliverables, in its "Dashboard" field, sorted into categories by title,
 *   meetings,     with only the fields the layer allows (meetings, resources
 *   resources     and tickets are read only when open for the client, see
 *                 openFor in ./layer.ts);
 *   invoices      "Portal - Invoices" rows related to the customer, not Draft;
 *   contracts     "KMPN Dev Tasks" rows with Portal ticked and the customer;
 *   edit requests Notion comments on a deliverable's page (getEditThreads);
 *   tickets       "Portal - Support Tickets", matched on the client's email.
 *
 * Uses its own token (NOTION_PORTAL_TOKEN, server-only), separate from the
 * portfolio's NOTION_TOKEN, which stays off Vercel.
 */

const NOTION_VERSION = "2025-09-03";

const DS = {
  customers:
    process.env.NOTION_PORTAL_CUSTOMERS_DS ?? "285c45aa-cc37-80c6-90fa-000ba16709d0",
  // Invoices: on the director-only Notion page "Client Portal - بوابة العملاء".
  // Tickets: on "Operation Master Page" (Account Management), for the team.
  invoices: process.env.NOTION_PORTAL_INVOICES_DS ?? "41ac45aa-cc37-818c-9130-000b6f844124",
  tickets: process.env.NOTION_PORTAL_TICKETS_DS ?? "41ac45aa-cc37-81c4-86ba-000b898f3b43",
  // "Portal - Content Library": the paid creatives delivered to each client.
  library: process.env.NOTION_PORTAL_LIBRARY_DS ?? "420c45aa-cc37-81c0-b40f-000bad3b8584",
  // "Copywrite -Tasks": the content team's pieces; rows marked Client Dashboard = Yes
  // show in the client's library with the stage they are at.
  copywrite: process.env.NOTION_PORTAL_COPYWRITE_DS ?? "1d5c45aa-cc37-8170-b1d0-000b4f3cfa38",
  // "KMPN Dev Tasks" under Business Dev.
  contracts: process.env.NOTION_PORTAL_CONTRACTS_DS ?? "267c45aa-cc37-81c6-b4d9-000b23cc93b0",
};

const token = () => process.env.NOTION_PORTAL_TOKEN?.trim() ?? "";

export const isNotionConfigured = () => Boolean(token());

/* -------------------------------------------------------------- types ---- */

export type Customer = {
  id: string;
  company: string;
  status: string;
  services: string[];
  start: string | null;
  end: string | null;
  dashboardId: string | null;
  /** KC "Portal Sections", or null when nothing is picked (the default set). */
  sections: Section[] | null;
};

export type Project = {
  id: string;
  name: string;
  status: string;
  start: string | null;
  end: string | null;
  parentId: string | null;
  company: string;
};

export type Meeting = {
  id: string;
  name: string;
  status: string;
  date: string | null;
  company: string;
};

export type Resource = {
  id: string;
  name: string;
  status: string;
  due: string | null;
  company: string;
};

/**
 * A file on a deliverable, sorted into how the portal can show it: Google
 * Drive and Docs links get Google's own preview frame, Notion-hosted images
 * and videos play inline, anything else is a link.
 */
export type DeliverableFile = {
  name: string;
  url: string;
  kind: "image" | "video" | "pdf" | "drive" | "folder" | "link";
  /** What to put in an <iframe> (Drive/Docs preview), or the media URL. */
  preview: string | null;
};

export type Deliverable = {
  id: string;
  name: string;
  types: string[];
  status: string;
  date: string | null;
  files: DeliverableFile[];
  company: string;
};

export type Contract = {
  id: string;
  name: string;
  kind: "contract" | "proposal" | null;
  status: string;
  due: string | null;
  files: { name: string; url: string }[];
};

/** One edit request (a Notion comment thread the client started). */
export type EditThread = {
  id: string;
  messages: { fromClient: boolean; text: string; created: string }[];
};

export type InvoiceStatus = "unpaid" | "paid" | "overdue" | "void";

export type Invoice = {
  id: string;
  number: string;
  company: string;
  description: string;
  amount: number | null;
  currency: string;
  issued: string | null;
  due: string | null;
  status: InvoiceStatus;
  /** A Notion-hosted PDF (fresh signed URL) or the Drive link. */
  fileUrl: string | null;
};

export type TicketStatus = "new" | "progress" | "answered" | "closed";

export type Ticket = {
  id: string;
  subject: string;
  message: string;
  reply: string;
  status: TicketStatus;
  created: string;
};

/**
 * One paid creative in the client's content library («مكتبة المحتوى»):
 * a finished video or design KMPN made, from idea to final cut.
 */
/** Where a piece is on its way to the client, idea to final cut. */
export type LibraryStage = "idea" | "script" | "shoot" | "edit" | "design" | "review" | "done" | "paused";

export type LibraryItem = {
  id: string;
  name: string;
  stage: LibraryStage;
  /** The script, the files folder…: links the client can open. */
  links: { label: string; url: string }[];
  /** "YYYY-MM" from the Month select, for grouping and sorting; null when unset. */
  month: string | null;
  /** Running in the client's ads right now. */
  live: boolean;
  format: "video" | "static" | "carousel";
  aspect: string;
  duration: string;
  angle: string;
  platforms: string[];
  /** The final file on Google Drive. */
  url: string | null;
  driveId: string | null;
  /** Notion-hosted cover (short-lived URL), else null: the view falls back to Drive's thumbnail. */
  cover: string | null;
  caption: string;
  company: string;
};

export type PortalData = {
  /** True when the email is listed on at least one customer in Notion. */
  linked: boolean;
  /** Sections this client may open; the rest show as «قريبًا». */
  open: Section[];
  customers: Customer[];
  projects: Project[];
  deliverables: Deliverable[];
  contracts: Contract[];
  meetings: Meeting[];
  resources: Resource[];
  invoices: Invoice[];
  tickets: Ticket[];
  library: LibraryItem[];
};

const EMPTY: PortalData = {
  linked: false,
  open: DEFAULT_OPEN,
  customers: [],
  projects: [],
  deliverables: [],
  contracts: [],
  meetings: [],
  resources: [],
  invoices: [],
  tickets: [],
  library: [],
};

/* ------------------------------------------------------------ helpers ---- */

type NotionPage = {
  id: string;
  created_time: string;
  parent?: { type: string; data_source_id?: string };
  properties: Record<string, NotionProp>;
};

// Notion's property payloads are wide unions; only the fields read here.
type NotionProp = {
  type?: string;
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  select?: { name: string } | null;
  status?: { name: string } | null;
  multi_select?: { name: string }[];
  date?: { start: string; end: string | null } | null;
  number?: number | null;
  url?: string | null;
  email?: string | null;
  created_time?: string;
  relation?: { id: string }[];
  checkbox?: boolean;
  files?: { name?: string; type: string; file?: { url: string }; external?: { url: string } }[];
};

type Block = {
  id: string;
  type: string;
  has_children: boolean;
  child_page?: { title: string };
  child_database?: { title: string };
};

async function notion<T>(path: string, body?: unknown, method?: "PATCH"): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`https://api.notion.com/v1/${path}`, {
        method: method ?? (body === undefined ? "GET" : "POST"),
        headers: {
          Authorization: `Bearer ${token()}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      });
    } catch (err) {
      // "fetch failed": a dropped connection, typically a socket reused after
      // the function slept. It failed every background refresh of the cache,
      // which then kept serving old data; a second try gets a new connection.
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        continue;
      }
      throw err;
    }
    // Notion allows about 3 requests a second and says how long to wait.
    if (res.status === 429 && attempt < 3) {
      const wait = Math.min(Number(res.headers.get("retry-after")) || 1, 5);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      continue;
    }
    if (res.status >= 500 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      continue;
    }
    if (!res.ok) {
      const message = `Notion ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`;
      throw Object.assign(new Error(message), { status: res.status });
    }
    return res.json() as Promise<T>;
  }
}

async function query(dataSource: string, body: Record<string, unknown> = {}) {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const data = await notion<{
      results: NotionPage[];
      has_more: boolean;
      next_cursor: string | null;
    }>(`data_sources/${dataSource}/query`, { ...body, start_cursor: cursor, page_size: 100 });
    pages.push(...data.results);
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

/**
 * A failure that may pass on a retry: a rate limit, a Notion outage or a
 * network error. A missing or unshared database (404, 403) stays missing
 * until someone fixes it in Notion, so it does not count.
 */
function isTransient(err: unknown) {
  const status = (err as { status?: number } | null)?.status;
  return status === undefined || status === 429 || status >= 500;
}

/** Runs one source; a failure there leaves the others standing. */
async function safely<T>(
  label: string,
  fallback: T,
  run: () => Promise<T>,
  onFail?: () => void,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.error(`[portal] ${label}:`, err instanceof Error ? err.message : err);
    if (isTransient(err)) onFail?.();
    return fallback;
  }
}

/**
 * Keeps a complete read in Next's data cache, which every server instance
 * shares, for `seconds`; after that the cached copy is still served at once
 * while a fresh read runs in the background. A read that hit a passing
 * failure is returned to this request but never kept.
 *
 * `maxAgeMs`: if those background refreshes keep failing, the old copy
 * would be served for good (it happened: data stuck for hours). A copy older
 * than this is read again now, under a key of its own, before answering.
 */
async function keepComplete<T>(
  keyParts: string[],
  seconds: number,
  load: () => Promise<{ value: T; complete: boolean }>,
  tags: string[] = ["portal"],
  maxAgeMs?: number,
): Promise<{ value: T; complete: boolean }> {
  const read = async (parts: string[]) => {
    let partial: { value: T } | null = null;
    const loader = async () => {
      const result = await load();
      if (!result.complete) {
        partial = { value: result.value };
        throw new Error("[portal] incomplete Notion read, not cached");
      }
      return { value: result.value, at: Date.now() };
    };
    // Next keys this cache by the loader's source text as well as the key parts, and
    // the built text changes with every deploy (minified names): each deploy
    // started cold, and the first visitor waited for a full walk of Notion.
    // The key parts already name the data with a version, so pin the text.
    loader.toString = () => "kmpn-portal";
    const cached = unstable_cache(loader, parts, { revalidate: seconds, tags });
    try {
      return { ...(await cached()), complete: true };
    } catch (err) {
      const got = partial as { value: T } | null;
      if (got) return { value: got.value, at: Date.now(), complete: false };
      throw err;
    }
  };
  const hit = await read(keyParts);
  if (maxAgeMs && Date.now() - hit.at > maxAgeMs) {
    const fresh = await read([...keyParts, String(Math.floor(Date.now() / maxAgeMs))]);
    return { value: fresh.value, complete: fresh.complete };
  }
  return { value: hit.value, complete: hit.complete };
}

/** Some property names in these databases end in a space; match trimmed. */
function prop(page: NotionPage, name: string): NotionProp | undefined {
  if (name === "title") return Object.values(page.properties).find((p) => p.type === "title");
  const key = Object.keys(page.properties).find((k) => k.trim() === name);
  return key ? page.properties[key] : undefined;
}

const text = (p?: NotionProp) =>
  (p?.title ?? p?.rich_text ?? [])
    .map((t) => t.plain_text)
    .join("")
    .trim();

const choice = (p?: NotionProp) => p?.select?.name ?? p?.status?.name ?? "";

/** "Thimar - KC" → "Thimar". */
const companyName = (title: string) => title.replace(/\s*-\s*KC\s*$/i, "").trim();

const emailsOf = (p?: NotionProp) =>
  text(p)
    .toLowerCase()
    .split(/[\s,;،]+/)
    .filter(Boolean);

/** The 32-hex Notion id inside a page link, dashed. */
function idFromUrl(url?: string | null) {
  const hex = url?.replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0];
  return hex
    ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    : null;
}

const hidden = (cat: Category, status: string) =>
  CATEGORIES[cat].hide.includes(status.trim().toLowerCase());

/* ------------------------------------------------------------ customer ---- */

function toCustomer(row: NotionPage): Customer {
  const date = prop(row, "Date")?.date ?? null;
  return {
    id: row.id,
    company: companyName(text(prop(row, "Company"))),
    status: choice(prop(row, "Status")),
    services: (prop(row, "Active Projects")?.multi_select ?? []).map((o) => o.name),
    start: date?.start ?? null,
    end: date?.end ?? null,
    dashboardId: idFromUrl(prop(row, "Dashboard")?.url),
    sections: sectionsOf(prop(row, "Portal Sections")),
  };
}

function sectionsOf(p?: NotionProp): Section[] | null {
  const names = new Set((p?.multi_select ?? []).map((o) => o.name.trim().toLowerCase()));
  if (!names.size) return null;
  return SECTIONS.filter((s) => names.has(SECTION_OPTION[s].toLowerCase()));
}

async function customersFor(email: string) {
  const rows = await query(DS.customers, {
    filter: { property: "Portal Emails", rich_text: { contains: email } },
  });
  // `contains` is a substring match, so confirm the exact address.
  return rows.filter((row) => emailsOf(prop(row, "Portal Emails")).includes(email));
}

/** A KC row by its page id, only if it really belongs to KC. */
async function customerById(id: string) {
  const row = await notion<NotionPage>(`pages/${id}`);
  const parent = row.parent?.data_source_id?.replace(/-/g, "");
  return parent === DS.customers.replace(/-/g, "") ? row : null;
}

/* ----------------------------------------------------------- discovery ---- */

type Sources = Record<Category, string[]>;

// The databases under a client's pages rarely change, and walking them costs
// dozens of API calls, so a complete walk is kept for six hours.
const SOURCES_SECONDS = 6 * 60 * 60;

/**
 * Below the client's own pages, only these blocks are opened. Opening every
 * text block with children (list items, paragraphs, to-dos) of every sub-page
 * took about 150 calls, and Notion allows about 3 a second: 46 seconds.
 */
const CONTAINERS = new Set([
  "column_list",
  "column",
  "toggle",
  "callout",
  "synced_block",
  "heading_1",
  "heading_2",
  "heading_3",
  "tab",
]);

/** At most this many Notion calls at once during a walk (Notion allows about 3 a second). */
function limiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return async <T,>(run: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>((resolve) => queue.push(resolve));
    active++;
    try {
      return await run();
    } finally {
      active--;
      queue.shift()?.();
    }
  };
}

type Limit = ReturnType<typeof limiter>;

async function childDatabases(
  pageId: string,
  limit: Limit,
  onError: (err: unknown) => void,
  depth = 0,
  found: { id: string; title: string }[] = [],
) {
  if (depth > 3) return found;
  const inside: Promise<unknown>[] = [];
  let cursor: string | undefined;
  do {
    const res = await limit(() =>
      notion<{ results: Block[]; has_more: boolean; next_cursor: string | null }>(
        `blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`,
      ),
    );
    for (const b of res.results) {
      if (b.type === "child_database") {
        found.push({ id: b.id, title: b.child_database?.title ?? "" });
      } else if (b.type === "child_page") {
        if (!NEVER.test(b.child_page?.title ?? "")) {
          inside.push(childDatabases(b.id, limit, onError, depth + 1, found).catch(onError));
        }
      } else if (b.has_children && (depth === 0 || CONTAINERS.has(b.type))) {
        // Same page, look inside: anything on the client's own pages (Ottroga's
        // databases sit in a page under a numbered list item), only layout
        // blocks deeper down, where pages are long notes and docs.
        inside.push(childDatabases(b.id, limit, onError, depth, found).catch(onError));
      }
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  await Promise.all(inside);
  return found;
}

async function sourcesOf(customer: Customer): Promise<{ sources: Sources; complete: boolean }> {
  const { value, complete } = await keepComplete(
    ["portal-sources-v6", customer.id, customer.dashboardId ?? ""],
    SOURCES_SECONDS,
    () => walkSources(customer),
    ["portal-sources"],
  );
  return { sources: value, complete };
}

async function walkSources(customer: Customer): Promise<{ value: Sources; complete: boolean }> {
  const sources: Sources = { deliverables: [], projects: [], meetings: [], resources: [] };
  const roots = [customer.id, customer.dashboardId].filter(Boolean) as string[];
  // Only a full walk is cached: after a failed call (rate limit, outage) the
  // next visit tries again instead of showing empty lists for ten minutes.
  let complete = true;
  const failed = (label: string, err: unknown) => {
    if (isTransient(err)) complete = false;
    console.error(`[portal] ${label}:`, err instanceof Error ? err.message : err);
  };
  const limit = limiter(3);
  // A failed call marks the walk incomplete (so it is not kept) but keeps
  // what the other calls found, instead of dropping the whole page.
  const found = await Promise.all(
    roots.map(async (root) => {
      const dbs: { id: string; title: string }[] = [];
      const onError = (err: unknown) => failed(`walk ${root}`, err);
      await childDatabases(root, limit, onError, 0, dbs).catch(onError);
      return dbs;
    }),
  );
  await Promise.all(
    found.flat().map(async (db) => {
      const cat = categoryOf(db.title);
      if (!cat) return;
      try {
        const info = await limit(() =>
          notion<{ data_sources?: { id: string; name: string }[] }>(`databases/${db.id}`),
        );
        for (const ds of info.data_sources ?? []) {
          if (!sources[cat].includes(ds.id)) sources[cat].push(ds.id);
        }
      } catch (err) {
        failed(`database ${db.id}`, err);
      }
    }),
  );
  return { value: sources, complete };
}

/* ---------------------------------------------------------------- read ---- */

async function readProjects(ids: string[], company: string): Promise<Project[]> {
  const rows = (await Promise.all(ids.map((id) => query(id)))).flat();
  return rows
    .map((row) => {
      const dates = prop(row, "Dates")?.date ?? null;
      return {
        id: row.id,
        name: text(prop(row, "title")),
        status: choice(prop(row, "Status")),
        start: dates?.start ?? null,
        end: dates?.end ?? null,
        parentId: prop(row, "Parent project")?.relation?.[0]?.id ?? null,
        company,
      };
    })
    .filter((p) => p.name && !hidden("projects", p.status));
}

async function readMeetings(ids: string[], company: string): Promise<Meeting[]> {
  const rows = (await Promise.all(ids.map((id) => query(id)))).flat();
  return rows
    .map((row) => ({
      id: row.id,
      name: text(prop(row, "title")),
      status: choice(prop(row, "Status")),
      date: prop(row, "Meeting Date")?.date?.start ?? row.created_time,
      company,
    }))
    .filter((m) => m.name && !hidden("meetings", m.status))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

async function readResources(ids: string[], company: string): Promise<Resource[]> {
  const rows = (await Promise.all(ids.map((id) => query(id)))).flat();
  return rows
    .map((row) => ({
      id: row.id,
      name: text(prop(row, "title")),
      status: choice(prop(row, "Status")),
      due: prop(row, "Due Date")?.date?.start ?? null,
      company,
    }))
    .filter((r) => r.name && !hidden("resources", r.status));
}

/* -------------------------------------------------------- deliverables ---- */

const IMAGE = /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i;
const VIDEO = /\.(mp4|mov|webm|m4v)(\?|$)/i;
const PDF = /\.pdf(\?|$)/i;

/** Sorts a Files-property entry into how the portal shows it. */
function toFile(name: string, url: string): DeliverableFile {
  const label = name || url;
  const driveFile = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if (driveFile) return { name: label, url, kind: "drive", preview: `https://drive.google.com/file/d/${driveFile[1]}/preview` };
  const folder = url.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]{10,})/);
  if (folder) return { name: label, url, kind: "folder", preview: `https://drive.google.com/embeddedfolderview?id=${folder[1]}#grid` };
  const doc = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([\w-]{10,})/);
  if (doc) return { name: label, url, kind: "drive", preview: `https://docs.google.com/${doc[1]}/d/${doc[2]}/preview` };
  const probe = `${name} ${url.split("?")[0]}`;
  if (IMAGE.test(probe)) return { name: label, url, kind: "image", preview: url };
  if (VIDEO.test(probe)) return { name: label, url, kind: "video", preview: url };
  if (PDF.test(probe)) return { name: label, url, kind: "pdf", preview: null };
  return { name: label, url, kind: "link", preview: null };
}

const filesOf = (p?: NotionProp) =>
  (p?.files ?? [])
    .map((f) => ({ name: f.name ?? "", url: f.file?.url ?? f.external?.url ?? "" }))
    .filter((f) => f.url);

async function readDeliverables(ids: string[], company: string): Promise<Deliverable[]> {
  const rows = (await Promise.all(ids.map((id) => query(id)))).flat();
  return rows
    .map((row) => ({
      id: row.id,
      name: text(prop(row, "title")),
      types: (prop(row, "Type")?.multi_select ?? []).map((o) => o.name),
      status: choice(prop(row, "Status")),
      date: prop(row, "Delivery Date")?.date?.start ?? null,
      files: filesOf(prop(row, "Files")).map((f) => toFile(f.name, f.url)),
      company,
    }))
    .filter((d) => d.name && !hidden("deliverables", d.status))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/* ----------------------------------------------------------- contracts ---- */

async function readContracts(customers: Customer[]): Promise<Contract[]> {
  if (!DS.contracts || customers.length === 0) return [];
  const rows = await query(DS.contracts, {
    filter: {
      and: [
        { property: "Portal", checkbox: { equals: true } },
        { or: customers.map((c) => ({ property: "Customer", relation: { contains: c.id } })) },
      ],
    },
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });
  return rows.map((row) => {
    const kind = choice(prop(row, "Portal Type")).toLowerCase();
    return {
      id: row.id,
      name: text(prop(row, "Task name")),
      kind: kind === "contract" || kind === "proposal" ? kind : null,
      status: choice(prop(row, "Status")),
      due: prop(row, "Due date")?.date?.start ?? null,
      files: filesOf(prop(row, "Files & media")).map((f) => ({ name: f.name || "الملف", url: f.url })),
    };
  });
}

const INVOICE_STATUS: Record<string, InvoiceStatus> = {
  Unpaid: "unpaid",
  Paid: "paid",
  Overdue: "overdue",
  Void: "void",
};

const TICKET_STATUS: Record<string, TicketStatus> = {
  New: "new",
  "In progress": "progress",
  Answered: "answered",
  Closed: "closed",
};

async function readInvoices(customers: Customer[]): Promise<Invoice[]> {
  if (!DS.invoices || customers.length === 0) return [];
  const names = new Map(customers.map((c) => [c.id, c.company]));
  const rows = await query(DS.invoices, {
    filter: {
      and: [
        { or: customers.map((c) => ({ property: "Customer", relation: { contains: c.id } })) },
        { property: "Status", select: { does_not_equal: "Draft" } },
        { property: "Status", select: { is_not_empty: true } },
      ],
    },
    sorts: [{ property: "Issued", direction: "descending" }],
  });
  return rows.map((row) => {
    const file = prop(row, "PDF")?.files?.[0];
    const customerId = prop(row, "Customer")?.relation?.[0]?.id ?? "";
    return {
      id: row.id,
      number: text(prop(row, "Invoice")),
      company: names.get(customerId) ?? "",
      description: text(prop(row, "Description")),
      amount: prop(row, "Amount")?.number ?? null,
      currency: choice(prop(row, "Currency")) || "EGP",
      issued: prop(row, "Issued")?.date?.start ?? null,
      due: prop(row, "Due")?.date?.start ?? null,
      status: INVOICE_STATUS[choice(prop(row, "Status"))] ?? "unpaid",
      fileUrl: file?.file?.url ?? file?.external?.url ?? prop(row, "Link")?.url ?? null,
    };
  });
}

/* ---------------------------------------------------- content library ---- */

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  يناير: 1, فبراير: 2, مارس: 3, أبريل: 4, ابريل: 4, مايو: 5, يونيو: 6, يوليو: 7, أغسطس: 8, اغسطس: 8,
  سبتمبر: 9, أكتوبر: 10, اكتوبر: 10, نوفمبر: 11, ديسمبر: 12,
};

/** "October 2026", "Oct 2026", "أكتوبر 2026" or "2026-10" → "2026-10". */
function monthKey(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  const iso = s.match(/^(\d{4})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}`;
  const year = s.match(/\d{4}/)?.[0];
  const word = s.replace(/\d+/g, "").trim();
  const month = MONTHS[word] ?? MONTHS[word.slice(0, 3)];
  return year && month ? `${year}-${String(month).padStart(2, "0")}` : null;
}

const DRIVE_FILE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/;

const FORMAT: Record<string, LibraryItem["format"]> = { video: "video", static: "static", carousel: "carousel" };

async function readLibrary(customers: Customer[]): Promise<LibraryItem[]> {
  if (!DS.library || customers.length === 0) return [];
  const names = new Map(customers.map((c) => [c.id.replace(/-/g, ""), c.company]));
  const rows = await query(DS.library, {
    filter: {
      and: [
        { or: customers.map((c) => ({ property: "Customer", relation: { contains: c.id } })) },
        { property: "Status", select: { does_not_equal: "In Production" } },
        { property: "Status", select: { is_not_empty: true } },
      ],
    },
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
  });
  return rows
    .map((row) => {
      const url = prop(row, "Drive Link")?.url ?? null;
      const customerId = (prop(row, "Customer")?.relation?.[0]?.id ?? "").replace(/-/g, "");
      return {
        id: row.id,
        name: text(prop(row, "Name")),
        stage: "done" as const,
        links: [],
        month: monthKey(choice(prop(row, "Month"))),
        live: choice(prop(row, "Status")).toLowerCase() === "live",
        format: FORMAT[choice(prop(row, "Format")).toLowerCase()] ?? "video",
        aspect: choice(prop(row, "Aspect")),
        duration: text(prop(row, "Duration")),
        angle: text(prop(row, "Angle")),
        platforms: (prop(row, "Platform")?.multi_select ?? []).map((o) => o.name),
        url,
        driveId: url?.match(DRIVE_FILE)?.[1] ?? null,
        cover: filesOf(prop(row, "Cover"))[0]?.url ?? null,
        caption: text(prop(row, "Caption")),
        company: names.get(customerId) ?? "",
      } satisfies LibraryItem;
    })
    .filter((item) => item.name)
    // Newest month first; within a month, in the order the team added them.
    .sort((a, b) => (b.month ?? "").localeCompare(a.month ?? ""));
}

/** Copywrite -Tasks "Status" → the stage the client reads. Archived rows are not read. */
const COPY_STAGE: Record<string, LibraryStage> = {
  backlog: "idea",
  ideation: "idea",
  "in scriptwriting": "script",
  "in copywriting": "script",
  "rf shooting": "shoot",
  "rf video editing": "edit",
  "in video editing": "edit",
  "rf design": "design",
  "in design": "design",
  "ready for revision": "review",
  delivered: "done",
  published: "done",
  paused: "paused",
};

/** The Copywrite "Brand" option spelled differently from the KC company. */
const BRAND_ALIASES: Record<string, string[]> = { ottroga: ["ottroja"] };

/** "Bader - بادر" → ["bader - بادر", "bader"], plus any alias. */
function brandsOf(company: string): string[] {
  const full = company.trim().toLowerCase();
  const head = company.split(/\s+[-–—]\s+/)[0].trim().toLowerCase();
  return [...new Set([full, head, ...(BRAND_ALIASES[head] ?? [])])];
}

/** What a link is, for its button. */
function linkLabel(url: string): string {
  if (/docs\.google\.com\/document/.test(url)) return "السكريبت";
  if (/docs\.google\.com\/spreadsheets/.test(url)) return "الشيت";
  if (/docs\.google\.com\/presentation/.test(url)) return "العرض";
  if (/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders/.test(url)) return "فولدر الملفات";
  if (DRIVE_FILE.test(url)) return "الملف على درايف";
  return "رابط";
}

const IMAGE_FILE = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i;

async function readCopywrite(customers: Customer[]): Promise<LibraryItem[]> {
  if (!DS.copywrite || customers.length === 0) return [];
  const companyOf = new Map<string, string>();
  for (const c of customers) for (const b of brandsOf(c.company)) companyOf.set(b, c.company);
  // Every brand's flagged rows (a few dozen), matched to this client's brand here:
  // a select filter on an option that does not exist would fail the whole query.
  const rows = await query(DS.copywrite, {
    filter: {
      and: [
        { property: "Client Dashboard", select: { equals: "Yes" } },
        { property: "Status", status: { does_not_equal: "Archived" } },
      ],
    },
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
  });
  return rows
    .flatMap((row) => {
      const company = companyOf.get(choice(prop(row, "Brand")).trim().toLowerCase());
      // A row with sub-tasks is a batch ("October Copywrite"); its pieces are the rows.
      if (!company || (prop(row, "Sub-tasks")?.relation ?? []).length) return [];
      const status = choice(prop(row, "Status")).trim().toLowerCase();
      const stage = COPY_STAGE[status] ?? "idea";
      const files = [
        ...filesOf(prop(row, "Delivery")),
        ...filesOf(prop(row, "Creatives")),
        ...filesOf(prop(row, "Files & media")),
      ];
      const thumbs = filesOf(prop(row, "Thumbnails"));
      const driveFile = files.find((f) => DRIVE_FILE.test(f.url));
      const links = files
        .filter((f) => !IMAGE_FILE.test(f.url.split("?")[0]))
        .map((f) => ({ label: linkLabel(f.url), url: f.url }));
      const when =
        prop(row, "Publish Date")?.date?.start ??
        prop(row, "Completed on")?.date?.start ??
        prop(row, "Due")?.date?.start ??
        row.created_time;
      const item: LibraryItem = {
        id: row.id,
        name: text(prop(row, "Task name")),
        stage,
        links: links.filter((l, i) => links.findIndex((x) => x.url === l.url) === i),
        month: when ? monthKey(when) : null,
        live: status === "published",
        format: stage === "design" ? "static" : "video",
        aspect: "",
        duration: "",
        angle: "",
        platforms: [],
        url: driveFile?.url ?? null,
        driveId: driveFile?.url.match(DRIVE_FILE)?.[1] ?? null,
        cover: thumbs[0]?.url ?? files.find((f) => IMAGE_FILE.test(f.url.split("?")[0]))?.url ?? null,
        caption: "",
        company,
      };
      return item.name ? [item] : [];
    })
    .sort((a, b) => (b.month ?? "").localeCompare(a.month ?? ""));
}

async function readTickets(filter: Record<string, unknown>): Promise<Ticket[]> {
  if (!DS.tickets) return [];
  const rows = await query(DS.tickets, {
    filter,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });
  return rows.map((row) => ({
    id: row.id,
    subject: text(prop(row, "Subject")),
    message: text(prop(row, "Message")),
    reply: text(prop(row, "Reply")),
    status: TICKET_STATUS[choice(prop(row, "Status"))] ?? "new",
    created: row.created_time,
  }));
}

/**
 * Reads everything for these customers. `complete` is false when any source
 * failed (rate limit, outage), so the caller knows not to keep the result.
 */
async function build(customers: Customer[], ticketFilter: Record<string, unknown> | null) {
  let complete = true;
  const fail = () => {
    complete = false;
  };
  const open = openFor(customers.map((c) => c.sections));
  const closed = (s: Section) => !open.includes(s);
  // The client's own databases and the shared ones are read side by side:
  // neither needs the other, and waiting cost up to a second.
  const perCustomerRead = Promise.all(
    customers.map(async (c) => {
      const walk = await sourcesOf(c);
      if (!walk.complete) fail();
      const src = walk.sources;
      // A section closed for this client is not read at all.
      const [projects, deliverables, meetings, resources] = await Promise.all([
        closed("projects")
          ? Promise.resolve([] as Project[])
          : safely(`projects ${c.company}`, [], () => readProjects(src.projects, c.company), fail),
        closed("deliverables")
          ? Promise.resolve([] as Deliverable[])
          : safely(`deliverables ${c.company}`, [], () => readDeliverables(src.deliverables, c.company), fail),
        closed("meetings")
          ? Promise.resolve([] as Meeting[])
          : safely(`meetings ${c.company}`, [], () => readMeetings(src.meetings, c.company), fail),
        closed("resources")
          ? Promise.resolve([] as Resource[])
          : safely(`resources ${c.company}`, [], () => readResources(src.resources, c.company), fail),
      ]);
      return { projects, deliverables, meetings, resources };
    }),
  );
  const sharedRead = Promise.all([
    closed("invoices") ? Promise.resolve([] as Invoice[]) : safely("invoices", [], () => readInvoices(customers), fail),
    closed("contracts")
      ? Promise.resolve([] as Contract[])
      : safely("contracts", [], () => readContracts(customers), fail),
    ticketFilter && !closed("support")
      ? safely("tickets", [], () => readTickets(ticketFilter), fail)
      : Promise.resolve([] as Ticket[]),
    // The content library lives under «التسليمات».
    closed("deliverables")
      ? Promise.resolve([] as LibraryItem[])
      : safely("library", [], () => readLibrary(customers), fail),
    closed("deliverables")
      ? Promise.resolve([] as LibraryItem[])
      : safely("copywrite", [], () => readCopywrite(customers), fail),
  ]);
  const [perCustomer, [invoices, contracts, tickets, library, copywrite]] = await Promise.all([
    perCustomerRead,
    sharedRead,
  ]);
  const data = {
    linked: customers.length > 0,
    open,
    customers,
    projects: perCustomer.flatMap((x) => x.projects),
    deliverables: perCustomer.flatMap((x) => x.deliverables),
    contracts,
    meetings: perCustomer.flatMap((x) => x.meetings),
    resources: perCustomer.flatMap((x) => x.resources),
    invoices,
    tickets,
    // Newest month first; a stable sort keeps each source's order within a month.
    library: [...library, ...copywrite].sort((a, b) => (b.month ?? "").localeCompare(a.month ?? "")),
  } satisfies PortalData;
  return { data, complete };
}

/*
 * Every portal page needs the same Notion data, and Notion allows only about
 * three requests a second. So one client's data is kept for a minute (see
 * keepComplete), and requests that arrive while it is being read wait for
 * that read instead of starting their own.
 */
const DATA_SECONDS = 60;

/** No client ever sees data older than this, even if background refreshes fail. */
const DATA_MAX_AGE_MS = 5 * 60 * 1000;
const inflight = new Map<string, Promise<PortalData>>();

function remembered(
  key: string,
  load: () => Promise<{ data: PortalData; complete: boolean }>,
): Promise<PortalData> {
  const running = inflight.get(key);
  if (running) return running;
  const read = keepComplete(
    ["portal-data-v10", key],
    DATA_SECONDS,
    async () => {
      const { data, complete } = await load();
      return { value: data, complete };
    },
    ["portal", "portal-data"],
    DATA_MAX_AGE_MS,
  )
    .then((r) => r.value)
    .finally(() => inflight.delete(key));
  inflight.set(key, read);
  return read;
}

export type PortalAccess = { linked: boolean; open: Section[] };

/**
 * Which sections a client may open: one query on KC, kept for a minute like
 * the data (never for an address not linked yet). The menu and the page
 * guards use it, so a closed section costs no further Notion calls.
 */
export async function getPortalAccess(email: string): Promise<PortalAccess> {
  if (!isNotionConfigured() || !email) return { linked: false, open: DEFAULT_OPEN };
  const address = email.toLowerCase();
  const { value } = await keepComplete(
    ["portal-access-v2", address],
    DATA_SECONDS,
    async () => {
      let found = true;
      const rows = await safely("customers", [], () => customersFor(address), () => {
        found = false;
      });
      const customers = rows.map(toCustomer);
      return {
        value: { linked: customers.length > 0, open: openFor(customers.map((c) => c.sections)) },
        complete: found && customers.length > 0,
      };
    },
    ["portal", "portal-access"],
    DATA_MAX_AGE_MS,
  );
  return value;
}

/**
 * Everything the portal shows for one client. `email` must be a confirmed
 * address; the caller checks that.
 */
export async function getPortalData(email: string): Promise<PortalData> {
  if (!isNotionConfigured() || !email) return EMPTY;
  const address = email.toLowerCase();
  return remembered(`email:${address}`, async () => {
    let found = true;
    const rows = await safely("customers", [], () => customersFor(address), () => {
      found = false;
    });
    const result = await build(rows.map(toCustomer), { property: "Email", email: { equals: address } });
    // An address not linked to any client yet is never kept, so a client the
    // team links in Notion sees their data on the very next visit.
    return { data: result.data, complete: found && result.complete && rows.length > 0 };
  });
}

/**
 * What one KC customer sees: for the director's "view as client" page
 * (/admin/view/<id>) and the team's local preview (app/preview). Kept for a
 * minute like a client's own data, so moving between its tabs answers at
 * once; the director's changes clear it ("portal-data").
 */
export async function getPortalDataForCustomer(id: string): Promise<PortalData> {
  if (!isNotionConfigured()) return EMPTY;
  return remembered(`customer:${id.replace(/-/g, "")}`, async () => {
    let found = true;
    const row = await safely("customer", null, () => customerById(id), () => {
      found = false;
    });
    if (!row) return { data: EMPTY, complete: false };
    const result = await build([toCustomer(row)], { property: "Customer", relation: { contains: row.id } });
    return { data: result.data, complete: found && result.complete };
  });
}

/** KC customers with a Dashboard link — for the local preview's index. */
export async function listPreviewCustomers() {
  if (!isNotionConfigured()) return [];
  const rows = await safely("preview list", [], () =>
    query(DS.customers, { filter: { property: "Dashboard", url: { is_not_empty: true } } }),
  );
  return rows.map((row) => ({
    id: row.id,
    company: companyName(text(prop(row, "Company"))),
    portalEmails: emailsOf(prop(row, "Portal Emails")).length > 0,
  }));
}

/* --------------------------------------------------------------- write ---- */

const rich = (value: string) => ({
  rich_text: value ? [{ type: "text", text: { content: value.slice(0, 2000) } }] : [],
});

export async function createTicket(input: {
  email: string;
  name: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  if (!isNotionConfigured() || !DS.tickets) return false;
  const email = input.email.toLowerCase();
  try {
    const customers = await safely("customers", [], () => customersFor(email));
    await notion("pages", {
      parent: { type: "data_source_id", data_source_id: DS.tickets },
      properties: {
        Subject: { title: [{ type: "text", text: { content: input.subject.slice(0, 200) } }] },
        Email: { email },
        Name: rich(input.name),
        Message: rich(input.message),
        Status: { select: { name: "New" } },
        Customer: { relation: customers.map((c) => ({ id: c.id })) },
      },
    });
    return true;
  } catch (err) {
    console.error("[portal] Notion ticket failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

/* ------------------------------------------------------- edit requests ---- */

// Edit requests are Notion comments on the deliverable's page, so the team
// answers them where it already works. The integration needs the "Read
// comments" and "Insert comments" capabilities.

/** First line of every request the portal posts; stripped when shown. */
const REQUEST_HEADER = "طلب تعديل من بوابة العملاء";

type NotionComment = {
  id: string;
  discussion_id: string;
  created_time: string;
  created_by: { id: string };
  rich_text: { plain_text: string }[];
};

let botId: Promise<string> | null = null;
const integrationId = () => (botId ??= notion<{ id: string }>("users/me").then((u) => u.id));

/**
 * The client's edit-request threads per deliverable. Only threads the portal
 * started are returned: the team's own discussions on the same page stay
 * internal. Team replies show as "فريق كامبين", never by name.
 */
export async function getEditThreads(deliverableIds: string[]): Promise<Record<string, EditThread[]>> {
  if (!isNotionConfigured() || deliverableIds.length === 0) return {};
  try {
    const me = await integrationId();
    const out: Record<string, EditThread[]> = {};
    // A few at a time: Notion allows about 3 requests a second. Each
    // deliverable's threads are kept for a minute, so only the first visit
    // reads them, and a new request clears its own (threadsTag).
    for (let i = 0; i < deliverableIds.length; i += 3) {
      await Promise.all(
        deliverableIds.slice(i, i + 3).map(async (id) => {
          out[id] = await unstable_cache(() => readThreads(id, me), ["portal-threads-v1", id], {
            revalidate: DATA_SECONDS,
            tags: ["portal", threadsTag(id)],
          })();
        }),
      );
    }
    return out;
  } catch (err) {
    console.error("[portal] edit threads:", err instanceof Error ? err.message : err);
    return {};
  }
}

/** The cache tag of one deliverable's edit threads. */
export const threadsTag = (deliverableId: string) => `portal-threads-${deliverableId.replace(/-/g, "")}`;

async function readThreads(id: string, me: string): Promise<EditThread[]> {
  const res = await notion<{ results: NotionComment[] }>(`comments?block_id=${id}&page_size=100`);
  const threads = new Map<string, NotionComment[]>();
  for (const c of res.results) {
    threads.set(c.discussion_id, [...(threads.get(c.discussion_id) ?? []), c]);
  }
  return [...threads.values()]
    .map((list) => list.sort((a, b) => a.created_time.localeCompare(b.created_time)))
    .filter((list) => list[0].created_by.id === me)
    .map((list) => ({
      id: list[0].discussion_id,
      messages: list.map((c) => {
        const fromClient = c.created_by.id === me;
        const body = c.rich_text.map((t) => t.plain_text).join("");
        return {
          fromClient,
          // The portal's header line names the client for the team.
          text: fromClient ? body.split("\n").slice(1).join("\n").trim() || body : body,
          created: c.created_time,
        };
      }),
    }))
    .sort((a, b) => b.messages[0].created.localeCompare(a.messages[0].created));
}

/**
 * Posts a client's edit request as a comment on the deliverable's page. The
 * caller must check the deliverable is one of this client's.
 */
export async function addEditRequest(input: {
  deliverableId: string;
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  if (!isNotionConfigured()) return false;
  try {
    await notion("comments", {
      parent: { page_id: input.deliverableId },
      rich_text: [
        {
          type: "text",
          text: {
            content: `${REQUEST_HEADER} · ${input.name} (${input.email})\n${input.message}`.slice(0, 2000),
          },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[portal] edit request:", err instanceof Error ? err.message : err);
    return false;
  }
}

/* --------------------------------------------------------------- admin ---- */

/** A KC customer as the director's dashboard (/admin) shows it. */
export type AdminClient = {
  id: string;
  company: string;
  status: string;
  /** KC "Active Projects": the services KMPN runs for them. */
  services: string[];
  emails: string[];
  /** What KC "Portal Sections" picked, or null for the default set. */
  sections: Section[] | null;
  /** The sections this client actually gets. */
  open: Section[];
  hasDashboard: boolean;
  /** KMPN's own projects, not clients: KC Relation "Internal", or KMPN/كامبين in the name. */
  internal: boolean;
};

function toAdminClient(row: NotionPage): AdminClient {
  const c = toCustomer(row);
  return {
    id: c.id,
    company: c.company,
    status: c.status,
    services: c.services,
    emails: emailsOf(prop(row, "Portal Emails")),
    sections: c.sections,
    open: openFor([c.sections]),
    hasDashboard: Boolean(c.dashboardId),
    internal: choice(prop(row, "Relation")) === "Internal" || /kmpn|كامبين/i.test(c.company),
  };
}

const STATUS_RANK: Record<string, number> = { Active: 0, "In Pipeline": 1, "Not started": 2, Paused: 3 };

/** Every KC customer, read fresh: active ones first. */
export async function listClients(): Promise<AdminClient[]> {
  if (!isNotionConfigured()) return [];
  const rows = await query(DS.customers);
  return rows
    .map(toAdminClient)
    .sort((a, b) => (STATUS_RANK[a.status] ?? 4) - (STATUS_RANK[b.status] ?? 4) || a.company.localeCompare(b.company));
}

/** One KC customer, read fresh; null when it is not a KC row. */
export async function getClient(id: string): Promise<AdminClient | null> {
  const row = await customerById(id).catch(() => null);
  return row ? toAdminClient(row) : null;
}

export type AdminTicket = Ticket & { email: string; name: string; customerIds: string[] };

/** Every support ticket, newest first, with who opened it. */
export async function listAllTickets(): Promise<AdminTicket[]> {
  if (!isNotionConfigured() || !DS.tickets) return [];
  const rows = await query(DS.tickets, { sorts: [{ timestamp: "created_time", direction: "descending" }] });
  return rows.map((row) => ({
    id: row.id,
    subject: text(prop(row, "Subject")),
    message: text(prop(row, "Message")),
    reply: text(prop(row, "Reply")),
    status: TICKET_STATUS[choice(prop(row, "Status"))] ?? "new",
    created: row.created_time,
    email: prop(row, "Email")?.email ?? "",
    name: text(prop(row, "Name")),
    customerIds: (prop(row, "Customer")?.relation ?? []).map((r) => r.id),
  }));
}

// These writes need the "Update content" capability on the KMPN Portal
// integration; without it Notion answers 403.

/** Replaces a customer's "Portal Emails". */
export async function setClientEmails(id: string, emails: string[]) {
  await notion(`pages/${id}`, { properties: { "Portal Emails": rich(emails.join(", ")) } }, "PATCH");
}

/** Replaces a customer's "Portal Sections"; null clears it (the default set). */
export async function setClientSections(id: string, sections: Section[] | null) {
  const multi = (sections ?? []).map((s) => ({ name: SECTION_OPTION[s] }));
  await notion(`pages/${id}`, { properties: { "Portal Sections": { multi_select: multi } } }, "PATCH");
}

const TICKET_OPTION: Record<TicketStatus, string> = {
  new: "New",
  progress: "In progress",
  answered: "Answered",
  closed: "Closed",
};

/** The team's reply and status on a ticket; the client sees both. */
export async function saveTicket(id: string, input: { status: TicketStatus; reply: string }) {
  await notion(
    `pages/${id}`,
    { properties: { Status: { select: { name: TICKET_OPTION[input.status] } }, Reply: rich(input.reply) } },
    "PATCH",
  );
}
