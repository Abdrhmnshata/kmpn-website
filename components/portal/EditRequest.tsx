"use client";

import { useActionState, useState } from "react";
import { requestEdit, type FormState } from "@/app/auth-actions";
import { Notice, Submit, TextArea } from "./FormBits";

/** "طلب تعديل" under a deliverable: opens a short form that posts a Notion comment. */
export function EditRequest({ deliverableId, enabled }: { deliverableId: string; enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(requestEdit, {});

  if (!enabled) return null;
  if (!open && !state.ok) {
    return (
      <button type="button" className="btn-outline p-small-btn" onClick={() => setOpen(true)}>
        طلب تعديل
      </button>
    );
  }

  return (
    <form action={action} className="p-form d-request">
      <input type="hidden" name="deliverable" value={deliverableId} />
      {state.ok ? null : (
        <TextArea
          label="ما التعديل المطلوب؟"
          name="message"
          rows={3}
          maxLength={1800}
          defaultValue={state.values?.message}
          placeholder="مثال: تكبير اللوجو في آخر 3 ثوانٍ، وتغيير الموسيقى."
          required
        />
      )}
      <Notice error={state.error} message={state.ok ? state.message : undefined} />
      {state.ok ? null : (
        <div className="d-request-actions">
          <Submit pending="جارٍ الإرسال…">إرسال الطلب</Submit>
          <button type="button" className="p-link p-plain" onClick={() => setOpen(false)}>
            إلغاء
          </button>
        </div>
      )}
    </form>
  );
}
