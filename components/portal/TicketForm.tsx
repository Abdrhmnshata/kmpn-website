"use client";

import { useActionState } from "react";
import { openTicket, type FormState } from "@/app/auth-actions";
import { Field, Notice, Submit, TextArea } from "./FormBits";

export function TicketForm() {
  const [state, action] = useActionState<FormState, FormData>(openTicket, {});
  return (
    <form action={action} className="card p-card p-form">
      <h2 style={{ fontSize: 19, fontWeight: 700 }}>تذكرة جديدة</h2>
      <Field label="العنوان" name="subject" defaultValue={state.values?.subject} placeholder="مثال: تعديل على صفحة المنتج" maxLength={200} required />
      <TextArea label="التفاصيل" name="message" defaultValue={state.values?.message} placeholder="اشرح المشكلة أو الطلب، وأرفق روابط إن وجدت." maxLength={4000} required />
      <Notice error={state.error} message={state.ok ? state.message : undefined} />
      <Submit pending="جارٍ الإرسال…">إرسال التذكرة</Submit>
    </form>
  );
}
