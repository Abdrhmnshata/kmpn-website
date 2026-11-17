"use client";

import { useActionState } from "react";
import { unlockReport, type UnlockState } from "@/app/report/[slug]/actions";
import { Field, Submit } from "@/components/portal/FormBits";

export function UnlockForm({ slug, name }: { slug: string; name: string }) {
  const [state, action] = useActionState<UnlockState, FormData>(unlockReport.bind(null, slug), {});
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">تقرير الأداء</h1>
        <p className="auth-lead">تقرير {name} المباشر من كامبين. أدخل كلمة المرور التي أرسلناها لك.</p>
        <form action={action} className="p-form">
          <Field
            label="كلمة المرور"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            dir="ltr"
          />
          {state.error ? (
            <p className="p-notice p-notice-err" role="alert">
              {state.error}
            </p>
          ) : null}
          <Submit pending="جارٍ التحقق…">عرض التقرير</Submit>
        </form>
      </div>
    </div>
  );
}
