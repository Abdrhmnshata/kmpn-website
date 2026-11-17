"use client";

import { useActionState } from "react";
import { sendPasswordReset, type FormState } from "@/app/auth-actions";
import { CheckEmail, Field, Notice, Submit } from "./FormBits";

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(sendPasswordReset, {});

  if (state.ok && state.email) {
    return (
      <CheckEmail email={state.email}>
        إذا كان لهذا البريد حساب، ستجد فيها رابطًا لتعيين كلمة مرور جديدة.
      </CheckEmail>
    );
  }

  return (
    <form action={action} className="p-form">
      <Field label="البريد الإلكتروني" name="email" type="email" defaultValue={state.values?.email} autoComplete="email" placeholder="name@company.com" dir="ltr" required />
      <Notice error={state.error} />
      <Submit pending="جارٍ الإرسال…">أرسل رابط التعيين</Submit>
    </form>
  );
}
