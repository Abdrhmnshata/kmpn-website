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
    const res = await fetch(`https://api.notion.com/v1/${path}`, {
      method: method ?? (body === undefined ? "GET" : "POST"),
      headers: {
        Authorization: `Bearer ${token()}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    // Notion allows about 3 requests a second and says how long to wait.
    if (res.status === 429 && attempt < 3) {
      const wait = Math.min(Number(res.headers.get("retry-after")) || 1, 5);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
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
 */
async function keepComplete<T>(
  keyParts: string[],
  seconds: number,
  load: () => Promise<{ value: T; complete: boolean }>,
  tags: string[] = ["portal"],
): Promise<{ value: T; complete: boolean }> {
  let partial: { value: T } | null = null;
  const cached = unstable_cache(
    async () => {
      const result = await load();
      if (!result.complete) {
        partial = { value: result.value };
        throw new Error("[portal] incomplete Notion read, not cached");
      }
      return result.value;
    },
    keyParts,
    { revalidate: seconds, tags },
  );
  try {
    return { value: await cached(), complete: true };
  } catch (err) {
    const read = partial as { value: T } | null;
    if (read) return { value: read.value, complete: false };
    throw err;
  }
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

async function childDatabases(pageId: string, depth = 0, found: { id: string; title: string }[] = []) {
  if (depth > 3) return found;
  let cursor: string | undefined;
  do {
    const res = await notion<{ results: Block[]; has_more: boolean; next_cursor: string | null }>(
      `blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`,
    );
    for (const b of res.results) {
      if (b.type === "child_database") {
        found.push({ id: b.id, title: b.child_database?.title ?? "" });
      } else if (b.type === "child_page") {
        if (!NEVER.test(b.child_page?.title ?? "")) await childDatabases(b.id, depth + 1, found);
      } else if (b.has_children) {
        // Columns, callouts, toggles: same page, look inside.
        await childDatabases(b.id, depth, found);
      }
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return found;
}

async function sourcesOf(customer: Customer): Promise<{ sources: Sources; complete: boolean }> {
  const { value, complete } = await keepComplete(
    ["portal-sources", customer.id, customer.dashboardId ?? ""],
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
  for (const root of roots) {
    let dbs: { id: string; title: string }[] = [];
    try {
      dbs = await childDatabases(root);
    } catch (err) {
      failed(`walk ${root}`, err);
    }
    for (const db of dbs) {
      const cat = categoryOf(db.title);
      if (!cat) continue;
      try {
        const info = await notion<{ data_sources?: { id: string; name: string }[] }>(
          `databases/${db.id}`,
        );
        for (const ds of info.data_sources ?? []) {
          if (!sources[cat].includes(ds.id)) sources[cat].push(ds.id);
        }
      } catch (err) {
        failed(`database ${db.id}`, err);
      }
    }
  }
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
  const perCustomer = await Promise.all(
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
  const [invoices, contracts, tickets] = await Promise.all([
    closed("invoices") ? Promise.resolve([] as Invoice[]) : safely("invoices", [], () => readInvoices(customers), fail),
    closed("contracts")
      ? Promise.resolve([] as Contract[])
      : safely("contracts", [], () => readContracts(customers), fail),
    ticketFilter && !closed("support")
      ? safely("tickets", [], () => readTickets(ticketFilter), fail)
      : Promise.resolve([] as Ticket[]),
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
const inflight = new Map<string, Promise<PortalData>>();

function remembered(
  key: string,
  load: () => Promise<{ data: PortalData; complete: boolean }>,
): Promise<PortalData> {
  const running = inflight.get(key);
  if (running) return running;
  const read = keepComplete(
    ["portal-data-v3", key],
    DATA_SECONDS,
    async () => {
      const { data, complete } = await load();
      return { value: data, complete };
    },
    ["portal", "portal-data"],
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
    ["portal-access-v1", address],
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
 * (/admin/clients/<id>) and the team's local preview (app/preview).
 */
export async function getPortalDataForCustomer(id: string): Promise<PortalData> {
  if (!isNotionConfigured()) return EMPTY;
  const row = await safely("customer", null, () => customerById(id));
  if (!row) return EMPTY;
  return (await build([toCustomer(row)], { property: "Customer", relation: { contains: row.id } })).data;
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
    // A few at a time: Notion allows about 3 requests a second.
    for (let i = 0; i < deliverableIds.length; i += 3) {
      await Promise.all(
        deliverableIds.slice(i, i + 3).map(async (id) => {
          const res = await notion<{ results: NotionComment[] }>(`comments?block_id=${id}&page_size=100`);
          const threads = new Map<string, NotionComment[]>();
          for (const c of res.results) {
            threads.set(c.discussion_id, [...(threads.get(c.discussion_id) ?? []), c]);
          }
          out[id] = [...threads.values()]
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
        }),
      );
    }
    return out;
  } catch (err) {
    console.error("[portal] edit threads:", err instanceof Error ? err.message : err);
    return {};
  }
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
