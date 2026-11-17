import "server-only";
import { CATEGORIES, NEVER, categoryOf, type Category } from "./layer";

/**
 * Client-portal data, read live from Notion through the layer in ./layer.ts.
 *
 *   customer   the client's row in "KC - Master Customers", matched when the
 *              client's confirmed email is in its "Portal Emails" field;
 *   projects,  databases found under the client's KC page and on the page in
 *   meetings,  its "Dashboard" field, sorted into categories by title, with
 *   resources  only the fields the layer allows;
 *   invoices   "Portal - Invoices" rows related to the customer, not Draft;
 *   tickets    "Portal - Support Tickets", matched on the client's email.
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
  customers: Customer[];
  projects: Project[];
  meetings: Meeting[];
  resources: Resource[];
  invoices: Invoice[];
  tickets: Ticket[];
};

const EMPTY: PortalData = {
  linked: false,
  customers: [],
  projects: [],
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
  files?: { type: string; file?: { url: string }; external?: { url: string } }[];
};

type Block = {
  id: string;
  type: string;
  has_children: boolean;
  child_page?: { title: string };
  child_database?: { title: string };
};

async function notion<T>(path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://api.notion.com/v1/${path}`, {
      method: body === undefined ? "GET" : "POST",
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
      throw new Error(`Notion ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
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

/** Runs one source; a failure there leaves the others standing. */
async function safely<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.error(`[portal] ${label}:`, err instanceof Error ? err.message : err);
    return fallback;
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
  };
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

// The databases under a client's pages rarely change; walking them costs a
// dozen API calls, so the result is kept for a few minutes per server.
const SOURCES_TTL = 10 * 60 * 1000;
const sourcesCache = new Map<string, { at: number; sources: Sources }>();

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

async function sourcesOf(customer: Customer): Promise<Sources> {
  const cached = sourcesCache.get(customer.id);
  if (cached && Date.now() - cached.at < SOURCES_TTL) return cached.sources;

  const sources: Sources = { projects: [], meetings: [], resources: [] };
  const roots = [customer.id, customer.dashboardId].filter(Boolean) as string[];
  // Only a full walk is cached: after a failed call (rate limit, outage) the
  // next visit tries again instead of showing empty lists for ten minutes.
  let complete = true;
  const failed = (label: string, err: unknown) => {
    complete = false;
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
  if (complete) sourcesCache.set(customer.id, { at: Date.now(), sources });
  return sources;
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

async function build(customers: Customer[], ticketFilter: Record<string, unknown> | null) {
  const perCustomer = await Promise.all(
    customers.map(async (c) => {
      const src = await sourcesOf(c);
      const [projects, meetings, resources] = await Promise.all([
        safely(`projects ${c.company}`, [], () => readProjects(src.projects, c.company)),
        safely(`meetings ${c.company}`, [], () => readMeetings(src.meetings, c.company)),
        safely(`resources ${c.company}`, [], () => readResources(src.resources, c.company)),
      ]);
      return { projects, meetings, resources };
    }),
  );
  const [invoices, tickets] = await Promise.all([
    safely("invoices", [], () => readInvoices(customers)),
    ticketFilter ? safely("tickets", [], () => readTickets(ticketFilter)) : Promise.resolve([]),
  ]);
  return {
    linked: customers.length > 0,
    customers,
    projects: perCustomer.flatMap((x) => x.projects),
    meetings: perCustomer.flatMap((x) => x.meetings),
    resources: perCustomer.flatMap((x) => x.resources),
    invoices,
    tickets,
  } satisfies PortalData;
}

/**
 * Everything the portal shows for one client. `email` must be a confirmed
 * address; the caller checks that.
 */
export async function getPortalData(email: string): Promise<PortalData> {
  if (!isNotionConfigured() || !email) return EMPTY;
  const address = email.toLowerCase();
  const rows = await safely("customers", [], () => customersFor(address));
  return build(rows.map(toCustomer), { property: "Email", email: { equals: address } });
}

/**
 * What one KC customer would see — for the team's local preview only
 * (app/preview), never reachable in production.
 */
export async function getPortalDataForCustomer(id: string): Promise<PortalData> {
  if (!isNotionConfigured()) return EMPTY;
  const row = await safely("customer", null, () => customerById(id));
  if (!row) return EMPTY;
  return build([toCustomer(row)], { property: "Customer", relation: { contains: row.id } });
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
