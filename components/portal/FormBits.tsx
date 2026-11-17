"use client";

import { useFormStatus } from "react-dom";

/** Labelled input in the site's field style. */
export function Field({
  label,
  required,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="p-label">
      <span>
        {label}
        {required ? <span style={{ color: "var(--accent)" }}> *</span> : null}
      </span>
      <input className="field" required={required} {...input} />
      {hint ? <small className="p-hint">{hint}</small> : null}
    </label>
  );
}

export function TextArea({
  label,
  required,
  ...area
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="p-label">
      <span>
        {label}
        {required ? <span style={{ color: "var(--accent)" }}> *</span> : null}
      </span>
      <textarea
        className="field"
        required={required}
        rows={5}
        style={{ resize: "vertical" }}
        {...area}
      />
    </label>
  );
}

export function Submit({
  children,
  pending: pendingLabel = "لحظة…",
  variant = "primary",
}: {
  children: React.ReactNode;
  pending?: string;
  variant?: "primary" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={variant === "primary" ? "btn-primary p-submit" : "btn-outline p-submit"}
      style={{ opacity: pending ? 0.7 : 1 }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Notice({ error, message }: { error?: string; message?: string }) {
  if (error)
    return (
      <p role="alert" className="p-notice p-notice-err">
        {error}
      </p>
    );
  if (message)
    return (
      <p role="status" className="p-notice p-notice-ok">
        {message}
      </p>
    );
  return null;
}

/** Hidden field bots fill and people don't. */
export function Honeypot() {
  return (
    <input
      name="website"
      type="text"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
    />
  );
}

export function CheckEmail({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="p-done">
      <span className="p-done-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </span>
      <h2>راجع بريدك الإلكتروني</h2>
      <p>
        أرسلنا رسالة إلى <strong dir="ltr">{email}</strong>. {children}
      </p>
    </div>
  );
}
