"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/actions";

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 14,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  height: 50,
  borderRadius: 12,
  border: "1px solid var(--line2)",
  background: "var(--bg)",
  color: "var(--fg)",
  padding: "0 14px",
  fontFamily: "inherit",
  fontSize: 15,
  outline: "none",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary"
      style={{
        height: 54,
        fontSize: 16,
        marginTop: 4,
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? "جارٍ الإرسال…" : "إرسال"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    { ok: false },
  );

  if (state.ok) {
    return (
      <div
        style={{
          display: "grid",
          gap: 12,
          justifyItems: "center",
          textAlign: "center",
          padding: "32px 8px",
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#32AC63",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>تم استلام بياناتك</h2>
        <p style={{ color: "var(--fg2)" }}>سنتواصل معك في أقرب وقت.</p>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "grid", gap: 14 }}>
      <label style={labelStyle}>
        <span>
          الاسم <span style={{ color: "var(--accent)" }}>*</span>
        </span>
        <input
          name="name"
          type="text"
          placeholder="اسمك بالكامل"
          required
          className="field"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>
          رقم الجوال / واتساب <span style={{ color: "var(--accent)" }}>*</span>
        </span>
        <input
          name="phone"
          type="tel"
          placeholder="+20 1xx xxx xxxx"
          required
          className="field"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>البريد الإلكتروني</span>
        <input
          name="email"
          type="email"
          placeholder="name@company.com"
          className="field"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>اسم المتجر أو رابطه</span>
        <input
          name="store"
          type="text"
          placeholder="tawheedwnour.com"
          className="field"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <span>ما الذي تحتاجه؟</span>
        <textarea
          name="msg"
          rows={4}
          placeholder="أخبرنا باختصار عن نشاطك وهدفك"
          className="field"
          style={{
            ...inputStyle,
            height: "auto",
            padding: "12px 14px",
            resize: "vertical",
          }}
        />
      </label>

      {/* honeypot */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {state.error ? (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--accent)",
            fontWeight: 600,
          }}
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
