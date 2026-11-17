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

export type Category = "projects" | "meetings" | "resources";

/**
 * Which databases count as what, by title, and which of their fields may be
 * shown. Rows with a `hide` status never leave Notion.
 */
export const CATEGORIES: Record<
  Category,
  { match: RegExp; fields: string[]; hide: string[] }
> = {
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
