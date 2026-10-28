"use server";

import { getSupabase } from "@/lib/supabase/server";

export type ContactState = {
  ok: boolean;
  error?: string;
};

const MAX = { name: 120, phone: 40, email: 160, store: 200, msg: 4000 };

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = clean(formData.get("name"), MAX.name);
  const phone = clean(formData.get("phone"), MAX.phone);
  const email = clean(formData.get("email"), MAX.email);
  const company = clean(formData.get("store"), MAX.store);
  const message = clean(formData.get("msg"), MAX.msg);

  // Honeypot — real users never fill this hidden field.
  if (clean(formData.get("website"), 100)) return { ok: true };

  if (!name || !phone) {
    return { ok: false, error: "من فضلك اكتب الاسم ورقم الجوال." };
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.warn("[contact] Supabase not configured — lead was not stored:", {
      name,
      phone,
    });
    return {
      ok: false,
      error: "خدمة الاستقبال غير مفعّلة حاليًا. راسلنا على a@kmpn.agency.",
    };
  }

  const { error } = await supabase.from("contact_leads").insert({
    name,
    phone,
    email: email || null,
    company: company || null,
    message: message || null,
    source: "website-contact",
  });

  if (error) {
    console.error("[contact] insert failed:", error.message);
    return { ok: false, error: "حصلت مشكلة أثناء الإرسال. حاول مرة أخرى." };
  }

  return { ok: true };
}
