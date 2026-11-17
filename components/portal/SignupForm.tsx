"use client";

import { useActionState } from "react";
import { signUp, type FormState } from "@/app/auth-actions";
import { CheckEmail, Field, Honeypot, Notice, Submit } from "./FormBits";

export function SignupForm() {
  const [state, action] = useActionState<FormState, FormData>(signUp, {});

  if (state.ok && state.email) {
    return (
      <CheckEmail email={state.email}>
        اضغط على رابط التأكيد فيها لتفعيل حسابك، ثم سجّل دخولك.
      </CheckEmail>
    );
  }

  return (
    <form action={action} className="p-form">
      <Field label="الاسم" name="name" defaultValue={state.values?.name} autoComplete="name" placeholder="اسمك بالكامل" required />
      <Field label="اسم الشركة أو المتجر" name="company" defaultValue={state.values?.company} autoComplete="organization" placeholder="tawheedwnour.com" />
      <Field label="رقم الجوال / واتساب" name="phone" defaultValue={state.values?.phone} type="tel" autoComplete="tel" placeholder="+20 1xx xxx xxxx" dir="ltr" />
      <Field label="البريد الإلكتروني" name="email" defaultValue={state.values?.email} type="email" autoComplete="email" placeholder="name@company.com" dir="ltr" required />
      <Field
        label="كلمة المرور"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        dir="ltr"
        required
        hint="8 أحرف على الأقل."
      />
      <Honeypot />
      <Notice error={state.error} />
      <Submit pending="جارٍ إنشاء الحساب…">إنشاء حساب</Submit>
    </form>
  );
}
