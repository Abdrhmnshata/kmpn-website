import "server-only";
import { unstable_cache } from "next/cache";
import { listAllTickets, listClients, type AdminClient, type AdminTicket } from "@/lib/portal/notion";
import { listSignups, type Signup } from "@/lib/supabase/admin";

/**
 * What the director's dashboard reads. Each source is kept for 30 seconds and
 * shared by every admin page, so moving between pages answers at once instead
 * of reading Notion and Supabase again on every click.
 *
 * Fresh where it matters: every change made from the dashboard, a new
 * sign-up and a new ticket clear the cache at once (revalidateTag "admin…").
 * Changes made straight in Notion show within 30 seconds, and nothing older
 * than five minutes is ever shown: the key changes every five minutes, which
 * forces a fresh read.
 */
const SECONDS = 30;
const MAX_AGE_MS = 5 * 60 * 1000;

function kept<T>(key: string, tag: string, load: () => Promise<T>): Promise<T> {
  const window = String(Math.floor(Date.now() / MAX_AGE_MS));
  return unstable_cache(load, [key, window], { revalidate: SECONDS, tags: ["admin", tag] })();
}

const clientsSource = () => kept("admin-clients-v1", "admin-clients", listClients);
const signupsSource = () => kept("admin-signups-v1", "admin-signups", listSignups);
const ticketsSource = () => kept("admin-tickets-v1", "admin-tickets", listAllTickets);

/**
 * Everything an admin page needs; pass only the sources it shows (the client
 * list is always read). A source that fails comes back empty with its error,
 * so the rest still shows.
 */
export async function adminSnapshot({ signups: withSignups = true, tickets: withTickets = true } = {}) {
  const errors: string[] = [];
  const guard = async <T,>(label: string, fallback: T, run: () => Promise<T>) => {
    try {
      return await run();
    } catch (err) {
      console.error(`[admin] ${label}:`, err instanceof Error ? err.message : err);
      errors.push(label);
      return fallback;
    }
  };
  const [all, signups, tickets] = await Promise.all([
    guard("العملاء من نوشن", [] as AdminClient[], clientsSource),
    withSignups ? guard("الحسابات من Supabase", null as Signup[] | null, signupsSource) : null,
    withTickets ? guard("التذاكر من نوشن", [] as AdminTicket[], ticketsSource) : ([] as AdminTicket[]),
  ]);

  const byEmail = new Map<string, AdminClient[]>();
  for (const c of all) for (const e of c.emails) byEmail.set(e, [...(byEmail.get(e) ?? []), c]);
  const byId = new Map(all.map((c) => [c.id.replace(/-/g, ""), c]));

  return {
    /** Real clients only; KMPN's own projects are in `internal`. */
    clients: all.filter((c) => !c.internal),
    internal: all.filter((c) => c.internal),
    /** null when SUPABASE_SERVICE_ROLE_KEY is not set (or not read on this page). */
    signups,
    tickets,
    errors,
    clientsOf: (email: string) => byEmail.get(email.toLowerCase()) ?? [],
    clientById: (id: string) => byId.get(id.replace(/-/g, "")) ?? null,
  };
}
