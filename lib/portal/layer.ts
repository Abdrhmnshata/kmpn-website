/**
 * The client-portal data layer: the only Notion data that may reach a
 * client's account. Anything not listed here stays in Notion. Agreed with
 * the team on 2026-11-16.
 *
 * Two sources per client:
 *   KC         the client's row in "KC - Master Customers" (internal master)
 *              and the databases under its page;
 *   Dashboard  the page linked in the row's "Dashboard" field (what the team
 *              already shows the client), for databases that live there.
 *
 * Notion's API cannot read a linked view, only the original database. So
 * the portal reads the originals under the client's own KC page and its own
 * dashboard, and never follows a view into another client's data.
 */

/** Fields of the KC row the portal reads (everything else stays). */
export const CUSTOMER_FIELDS = ["Company", "Status", "Active Projects", "Date"] as const;

/** Pages and databases the portal never walks into or reads. */
export const NEVER = /credential|password|passwords|\bpass\b|باسورد|internal|داخلي|invoice|فاتور/i;

export type Category = "deliverables" | "projects" | "meetings" | "resources";

/** The portal sections a client can be given, in menu order. */
export const SECTIONS = [
  "projects",
  "reports",
  "resources",
  "meetings",
  "support",
  "deliverables",
  "invoices",
  "contracts",
] as const;
export type Section = (typeof SECTIONS)[number];
export const isSection = (key: string): key is Section => (SECTIONS as readonly string[]).includes(key);

/** Each section's option in the KC "Portal Sections" multi-select. */
export const SECTION_OPTION: Record<Section, string> = {
  projects: "Projects",
  reports: "Reports",
  resources: "Resources",
  meetings: "Meetings",
  support: "Support",
  deliverables: "Deliverables",
  invoices: "Invoices",
  contracts: "Contracts",
};

/**
 * Sections closed by default: a client whose KC row has nothing picked in
 * "Portal Sections" sees them as «قريبًا». The director opens or closes
 * sections per client from /admin/clients.
 */
export const SOON: readonly Section[] = ["deliverables", "invoices", "contracts"];
export const DEFAULT_OPEN: Section[] = SECTIONS.filter((s) => !SOON.includes(s));

/**
 * The sections open for a signed-in client: everything their KC rows picked,
 * and the default set for a row with nothing picked. A section not open is
 * shown as «قريبًا» and never read from Notion.
 */
export function openFor(picked: (Section[] | null)[]): Section[] {
  if (!picked.length) return DEFAULT_OPEN;
  const open = new Set<Section>();
  for (const sections of picked) for (const s of sections ?? DEFAULT_OPEN) open.add(s);
  return SECTIONS.filter((s) => open.has(s));
}

/**
 * Contracts & proposals: rows of "KMPN Dev Tasks" (Business Dev.) with
 * *Portal* ticked and the client in *Customer*. Only these fields leave
 * Notion; never the page body, assignees or other tasks.
 */
export const CONTRACT_FIELDS = ["Task name", "Portal Type", "Status", "Due date", "Files & media"] as const;

/**
 * Which databases count as what, by title, and which of their fields may be
 * shown. Rows with a `hide` status never leave Notion.
 */
export const CATEGORIES: Record<
  Category,
  { match: RegExp; fields: string[]; hide: string[] }
> = {
  // Checked first: a "… Deliverables" database is never a project list.
  deliverables: {
    match: /deliverable/i,
    // The files are the point here (previews and downloads). Edit requests
    // are Notion comments on the row's page, see lib/portal/notion.ts.
    fields: ["title", "Type", "Status", "Delivery Date", "Files"],
    hide: ["backlog", "cancelled"],
  },
  projects: {
    match: /project/i,
    // Not Completion (it follows Status: Delivered reads 70%), Owner,
    // Summary, Files, or the page body.
    fields: ["title", "Status", "Dates", "Parent project"],
    hide: ["backlog", "rejected"],
  },
  meetings: {
    match: /meet/i,
    // Not Attendees, Files, links, or the notes in the page body.
    fields: ["title", "Status", "Meeting Date", "Created"],
    hide: [],
  },
  resources: {
    match: /resource/i,
    // Not Files or Tags.
    fields: ["title", "Status", "Due Date"],
    hide: ["cancelled", "backlog"],
  },
};

export function categoryOf(title: string): Category | null {
  if (NEVER.test(title)) return null;
  for (const [cat, rule] of Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]) {
    if (rule.match.test(title)) return cat;
  }
  return null;
}
