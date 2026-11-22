import "server-only";
import { listAllTickets, listClients, type AdminClient } from "@/lib/portal/notion";
import { listSignups } from "@/lib/supabase/admin";

/**
 * Everything the director's dashboard reads, fresh on every visit (no
 * cache: the director must see a change as soon as it is made). A source
 * that fails comes back empty with its error, so the rest still shows.
 */
export async function adminSnapshot() {
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
    guard("العملاء من نوشن", [] as AdminClient[], listClients),
    guard("الحسابات من Supabase", null, listSignups),
    guard("التذاكر من نوشن", [], listAllTickets),
  ]);

  const byEmail = new Map<string, AdminClient[]>();
  for (const c of all) for (const e of c.emails) byEmail.set(e, [...(byEmail.get(e) ?? []), c]);
  const byId = new Map(all.map((c) => [c.id.replace(/-/g, ""), c]));

  return {
    /** Real clients only; KMPN's own projects are in `internal`. */
    clients: all.filter((c) => !c.internal),
    internal: all.filter((c) => c.internal),
    /** null when SUPABASE_SERVICE_ROLE_KEY is not set. */
    signups,
    tickets,
    errors,
    clientsOf: (email: string) => byEmail.get(email.toLowerCase()) ?? [],
    clientById: (id: string) => byId.get(id.replace(/-/g, "")) ?? null,
  };
}
