"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendCode, signIn, verifyCode, type FormState } from "@/app/auth-actions";
import { Field, Notice, Submit } from "./FormBits";

type Mode = "password" | "code";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [mode, setMode] = useState<Mode>("password");

  return (
    <div className="p-form">
      <div className="seg" role="tablist" aria-label="طريقة الدخول">
        <button type="button" role="tab" aria-selected={mode === "password"} onClick={() => setMode("password")}>
          بكلمة المرور
        </button>
        <button type="button" role="tab" aria-selected={mode === "code"} onClick={() => setMode("code")}>
          بكود على البريد
        </button>
      </div>
      {notice ? <Notice error={notice} /> : null}
      {mode === "password" ? <PasswordLogin next={next} /> : <CodeLogin next={next} />}
    </div>
  );
}

function PasswordLogin({ next }: { next: string }) {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  return (
    <form action={action} className="p-form">
      <input type="hidden" name="next" value={next} />
      <Field label="البريد الإلكتروني" name="email" type="email" defaultValue={state.values?.email} autoComplete="email" placeholder="name@company.com" dir="ltr" required />
      <Field label="كلمة المرور" name="password" type="password" autoComplete="current-password" dir="ltr" required />
      <Link href="/forgot-password" className="p-link" style={{ justifySelf: "start", fontSize: 14 }}>
        نسيت كلمة المرور؟
      </Link>
      <Notice error={state.error} />
      <Submit pending="جارٍ الدخول…">تسجيل الدخول</Submit>
    </form>
  );
}

function CodeLogin({ next }: { next: string }) {
  const [sent, send] = useActionState<FormState, FormData>(sendCode, {});
  const [checked, check] = useActionState<FormState, FormData>(verifyCode, {});
  // "Change email" returns to step 1 without losing what was typed.
  const [editing, setEditing] = useState(false);

  const email = checked.email ?? sent.email;
  const onCodeStep = sent.step === "code" && !editing;

  if (!onCodeStep) {
    return (
      <form
        action={(fd) => {
          setEditing(false);
          send(fd);
        }}
        className="p-form"
      >
        <input type="hidden" name="next" value={next} />
        <Field
          label="البريد الإلكتروني"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          dir="ltr"
          defaultValue={email}
          required
          hint="سنرسل لك كودًا ورابطًا للدخول بدون كلمة مرور."
        />
        <Notice error={sent.error} />
        <Submit pending="جارٍ الإرسال…">أرسل الكود</Submit>
      </form>
    );
  }

  return (
    <form action={check} className="p-form">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="email" value={email} />
      <p className="p-hint" style={{ fontSize: 14 }}>
        أرسلنا كودًا إلى <strong dir="ltr">{email}</strong>. اكتبه هنا، أو اضغط على الرابط في الرسالة.
      </p>
      <Field
        label="الكود"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        // A pasted code may carry spaces; the server keeps the digits only.
        maxLength={24}
        dir="ltr"
        className="field p-code"
        required
        autoFocus
      />
      <Notice error={checked.error} />
      <Submit pending="جارٍ التحقق…">دخول</Submit>
      <button type="button" className="p-link p-plain" onClick={() => setEditing(true)}>
        تغيير البريد أو إرسال كود جديد
      </button>
    </form>
  );
}
