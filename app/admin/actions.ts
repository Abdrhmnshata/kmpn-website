"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { isSection } from "@/lib/portal/layer";
import {
  getClient,
  saveTicket,
  setClientEmails,
  setClientSections,
  type TicketStatus,
} from "@/lib/portal/notion";

/**
 * The director's changes, written to Notion (the portal's source of truth).
 * Every action checks the director again: a server action is a public POST
 * endpoint, whatever page its form sits on.
 */

export type AdminState = { ok?: boolean; error?: string; message?: string };

const EMAIL = /^[^\s@,;،]+@[^\s@,;،]+\.[^\s@,;،]+$/;
const TICKET_STATUSES: TicketStatus[] = ["new", "progress", "answered", "closed"];

function failure(err: unknown): AdminState {
  const status = (err as { status?: number } | null)?.status;
  if (status === 403) {
    return {
      error: "نوشن رفض التعديل: فعّل «Update content» لـ KMPN Portal من إعدادات الـ Integrations في نوشن.",
    };
  }
  if (status === 404) return { error: "الصفحة دي مش موجودة أو مش متوصلة بـ KMPN Portal." };
  console.error("[admin]", err instanceof Error ? err.message : err);
  return { error: "حصل خطأ ومتحفظش التعديل. جرّب تاني." };
}

/** Clients see a change on their next visit, and /admin shows it at once. */
function refresh() {
  revalidateTag("portal-access");
  revalidateTag("portal-data");
  revalidatePath("/admin", "layout");
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function linkEmail(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = field(form, "client");
  const email = field(form, "email").toLowerCase();
  if (!id) return { error: "اختار العميل." };
  if (!EMAIL.test(email)) return { error: "الإيميل مش مظبوط." };
  try {
    const client = await getClient(id);
    if (!client) return { error: "العميل ده مش موجود في KC." };
    if (client.emails.includes(email)) return { ok: true, message: `مربوط بالفعل بـ ${client.company}.` };
    await setClientEmails(id, [...client.emails, email]);
    refresh();
    return { ok: true, message: `اتربط بـ ${client.company}.` };
  } catch (err) {
    return failure(err);
  }
}

export async function unlinkEmail(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = field(form, "client");
  const email = field(form, "email").toLowerCase();
  try {
    const client = await getClient(id);
    if (!client) return { error: "العميل ده مش موجود في KC." };
    await setClientEmails(
      id,
      client.emails.filter((e) => e !== email),
    );
    refresh();
    return { ok: true, message: `اتشال من ${client.company}.` };
  } catch (err) {
    return failure(err);
  }
}

export async function saveSections(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = field(form, "client");
  const reset = field(form, "reset") === "1";
  const sections = form.getAll("section").map(String).filter(isSection);
  if (!reset && !sections.length) return { error: "اختار قسم واحد على الأقل، أو رجّع الافتراضي." };
  try {
    const client = await getClient(id);
    if (!client) return { error: "العميل ده مش موجود في KC." };
    await setClientSections(id, reset ? null : sections);
    refresh();
    return { ok: true, message: reset ? "رجع للأقسام الافتراضية." : "اتحفظ." };
  } catch (err) {
    return failure(err);
  }
}

export async function updateTicket(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = field(form, "ticket");
  const status = field(form, "status") as TicketStatus;
  const reply = field(form, "reply").slice(0, 2000);
  if (!id || !TICKET_STATUSES.includes(status)) return { error: "اختار حالة التذكرة." };
  try {
    await saveTicket(id, { status, reply });
    refresh();
    return { ok: true, message: "اتحفظ، والعميل هيشوفه في البوابة." };
  } catch (err) {
    return failure(err);
  }
}
