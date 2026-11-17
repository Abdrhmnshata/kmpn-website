"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthClient, getUser, profileOf, GREETING_COOKIE } from "@/lib/supabase/auth";
import { addEditRequest, createTicket, getPortalData } from "@/lib/portal/notion";

export type FormState = {
  ok?: boolean;
  error?: string;
  /** Step of a multi-step form (the email-code login). */
  step?: "code";
  email?: string;
  message?: string;
  /** What was typed, so a form refills after an error (React 19 resets
   *  forms once their action returns). Never includes passwords. */
  values?: Record<string, string>;
};

const OFF = "خدمة الحسابات غير مفعّلة حاليًا. راسلنا على a@kmpn.agency.";

const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only same-site portal paths are allowed as a post-login destination. */
const safeNext = (v: FormDataEntryValue | null) => {
  const next = clean(v, 300);
  return next.startsWith("/portal") ? next : "/portal";
};

async function origin() {
  const h = await headers();
  const fromHeader = h.get("origin");
  if (fromHeader) return fromHeader;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "kmpn.agency";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Supabase's English errors, in the site's Arabic. */
function arabic(error: { message?: string; code?: string; status?: number }): string {
  const m = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  console.warn("[auth]", error.status, error.code, error.message);
  // Order matters: "Signups not allowed for otp" must not read as a bad code.
  if (m.includes("signups not allowed") || m.includes("otp_disabled") || m.includes("user not found"))
    return "لا يوجد حساب بهذا البريد. أنشئ حسابًا أولًا.";
  if (m.includes("invalid login") || m.includes("invalid_credentials"))
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (m.includes("not confirmed") || m.includes("email_not_confirmed"))
    return "أكّد بريدك الإلكتروني أولًا من الرسالة التي أرسلناها لك.";
  if (m.includes("expired") || m.includes("otp") || m.includes("token"))
    return "الكود غير صحيح أو انتهت صلاحيته. اطلب كودًا جديدًا.";
  if (m.includes("rate") || error.status === 429)
    return "طلبات كثيرة في وقت قصير. انتظر دقائق ثم حاول مرة أخرى.";
  if (m.includes("weak") || m.includes("password should"))
    return "كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.";
  return "حدثت مشكلة. حاول مرة أخرى.";
}

/* -------------------------------------------------------------- signup ---- */

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  if (clean(form.get("website"))) return { ok: true };

  const name = clean(form.get("name"), 120);
  const company = clean(form.get("company"), 160);
  const phone = clean(form.get("phone"), 40);
  const email = clean(form.get("email"), 160).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";

  const fail = (error: string): FormState => ({ error, values: { name, company, phone, email } });

  if (!name) return fail("اكتب اسمك.");
  if (!EMAIL_RE.test(email)) return fail("اكتب بريدًا إلكترونيًا صحيحًا.");
  if (password.length < 8) return fail("كلمة المرور 8 أحرف على الأقل.");

  const supabase = await getAuthClient();
  if (!supabase) return fail(OFF);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, company, phone },
      emailRedirectTo: `${await origin()}/auth/callback?next=/portal`,
    },
  });
  if (error) return fail(arabic(error));

  // Email confirmation on: no session until the link is clicked.
  if (!data.session) return { ok: true, email };
  redirect("/portal");
}

/* --------------------------------------------------------------- login ---- */

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = clean(form.get("email"), 160).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const fail = (error: string): FormState => ({ error, values: { email } });
  if (!EMAIL_RE.test(email) || !password) return fail("اكتب البريد الإلكتروني وكلمة المرور.");

  const supabase = await getAuthClient();
  if (!supabase) return fail(OFF);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail(arabic(error));
  redirect(safeNext(form.get("next")));
}

/** Step 1 of the password-less login: email the client a one-time code. */
export async function sendCode(_: FormState, form: FormData): Promise<FormState> {
  const email = clean(form.get("email"), 160).toLowerCase();
  const fail = (error: string): FormState => ({ error, email, values: { email } });
  if (!EMAIL_RE.test(email)) return fail("اكتب بريدًا إلكترونيًا صحيحًا.");

  const supabase = await getAuthClient();
  if (!supabase) return fail(OFF);

  const next = safeNext(form.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return fail(arabic(error));
  return { step: "code", email };
}

/** Step 2: check the code from the email. */
export async function verifyCode(_: FormState, form: FormData): Promise<FormState> {
  const email = clean(form.get("email"), 160).toLowerCase();
  // Digits only, then length: a pasted "7 1 3 3 3 0 3 0" keeps all eight.
  const code = clean(form.get("code"), 40).replace(/\D/g, "").slice(0, 10);
  if (!EMAIL_RE.test(email)) return { error: "اكتب بريدًا إلكترونيًا صحيحًا." };
  if (code.length < 6) return { step: "code", email, error: "اكتب الكود كاملًا." };

  const supabase = await getAuthClient();
  if (!supabase) return { error: OFF };

  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error) return { step: "code", email, error: arabic(error) };
  redirect(safeNext(form.get("next")));
}

export async function sendPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = clean(form.get("email"), 160).toLowerCase();
  const fail = (error: string): FormState => ({ error, values: { email } });
  if (!EMAIL_RE.test(email)) return fail("اكتب بريدًا إلكترونيًا صحيحًا.");

  const supabase = await getAuthClient();
  if (!supabase) return fail(OFF);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent("/portal/account?reset=1")}`,
  });
  // Same answer whether or not the address has an account.
  if (error && error.status === 429) return fail(arabic(error));
  return { ok: true, email };
}

export async function signOut() {
  const supabase = await getAuthClient();
  await supabase?.auth.signOut();
  (await cookies()).delete(GREETING_COOKIE);
  redirect("/");
}

/* ------------------------------------------------------------- account ---- */

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const name = clean(form.get("name"), 120);
  const company = clean(form.get("company"), 160);
  const phone = clean(form.get("phone"), 40);
  const fail = (error: string): FormState => ({ error, values: { name, company, phone } });
  if (!name) return fail("اكتب اسمك.");

  const supabase = await getAuthClient();
  if (!supabase) return fail(OFF);

  const { error } = await supabase.auth.updateUser({ data: { full_name: name, company, phone } });
  if (error) return fail(arabic(error));
  (await cookies()).set(GREETING_COOKIE, encodeURIComponent(name.split(/\s+/)[0]), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/portal", "layout");
  return { ok: true, message: "تم حفظ بياناتك." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (password.length < 8) return { error: "كلمة المرور 8 أحرف على الأقل." };

  const supabase = await getAuthClient();
  if (!supabase) return { error: OFF };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: arabic(error) };
  return { ok: true, message: "تم تغيير كلمة المرور." };
}

/* ------------------------------------------------------------- support ---- */

export async function openTicket(_: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/login?next=/portal/support");
  const profile = profileOf(user);

  const subject = clean(form.get("subject"), 200);
  const message = clean(form.get("message"), 4000);
  const fail = (error: string): FormState => ({ error, values: { subject, message } });
  if (!subject || !message) return fail("اكتب عنوان المشكلة وتفاصيلها.");
  if (!profile.verified) return fail("أكّد بريدك الإلكتروني أولًا.");

  const ok = await createTicket({ email: profile.email, name: profile.name, subject, message });
  if (!ok) return fail("تعذّر إرسال التذكرة الآن. راسلنا على a@kmpn.agency.");
  revalidatePath("/portal", "layout");
  return { ok: true, message: "تم استلام تذكرتك، وسيرد عليك فريقنا قريبًا." };
}

/* ------------------------------------------------------- deliverables ---- */

export async function requestEdit(_: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/login?next=/portal/deliverables");
  const profile = profileOf(user);

  const deliverableId = clean(form.get("deliverable"), 64);
  const message = clean(form.get("message"), 1800);
  const fail = (error: string): FormState => ({ error, values: { message } });
  if (!message) return fail("اكتب التعديل المطلوب.");
  if (!profile.verified) return fail("أكّد بريدك الإلكتروني أولًا.");

  // Only one of this client's own deliverables can take a comment.
  const data = await getPortalData(profile.email);
  if (!data.deliverables.some((d) => d.id === deliverableId)) {
    return fail("هذا التسليم غير متاح لحسابك.");
  }

  const ok = await addEditRequest({ deliverableId, name: profile.name, email: profile.email, message });
  if (!ok) return fail("تعذّر إرسال الطلب الآن. راسلنا على a@kmpn.agency.");
  revalidatePath("/portal/deliverables");
  return { ok: true, message: "وصل طلبك لفريق كامبين، وسيظهر ردهم هنا." };
}
