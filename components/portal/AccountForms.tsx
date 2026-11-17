"use client";

import { useActionState } from "react";
import { updatePassword, updateProfile, type FormState } from "@/app/auth-actions";
import { Field, Notice, Submit } from "./FormBits";

export function ProfileForm({
  name,
  company,
  phone,
  email,
}: {
  name: string;
  company: string;
  phone: string;
  email: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="card p-card p-form">
      <h2 style={{ fontSize: 19, fontWeight: 700 }}>بياناتي</h2>
      <Field label="البريد الإلكتروني" value={email} dir="ltr" readOnly disabled />
      <Field label="الاسم" name="name" defaultValue={state.values?.name ?? name} autoComplete="name" required />
      <Field label="اسم الشركة أو المتجر" name="company" defaultValue={state.values?.company ?? company} autoComplete="organization" />
      <Field label="رقم الجوال / واتساب" name="phone" type="tel" defaultValue={state.values?.phone ?? phone} autoComplete="tel" dir="ltr" />
      <Notice error={state.error} message={state.ok ? state.message : undefined} />
      <Submit pending="جارٍ الحفظ…">حفظ</Submit>
    </form>
  );
}

export function PasswordForm({ reset }: { reset: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(updatePassword, {});
  return (
    <form action={action} className="card p-card p-form" id="password">
      <h2 style={{ fontSize: 19, fontWeight: 700 }}>
        {reset ? "اختر كلمة مرور جديدة" : "تغيير كلمة المرور"}
      </h2>
      <Field
        label="كلمة المرور الجديدة"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        dir="ltr"
        required
        autoFocus={reset}
        hint="8 أحرف على الأقل."
      />
      <Notice error={state.error} message={state.ok ? state.message : undefined} />
      <Submit pending="جارٍ الحفظ…" variant={reset ? "primary" : "outline"}>
        حفظ كلمة المرور
      </Submit>
    </form>
  );
}
