"use client";

import { useActionState } from "react";
import {
  linkEmail,
  saveSections,
  unlinkEmail,
  updateTicket,
  type AdminState,
} from "@/app/admin/actions";
import { SECTIONS } from "@/lib/portal/layer";
import { SECTION_LABEL } from "@/lib/portal/nav";
import { TICKET_STATUS } from "@/lib/portal/format";
import type { TicketStatus } from "@/lib/portal/notion";
import { Notice, Submit } from "@/components/portal/FormBits";

/** The director's small forms on /admin; each writes to Notion. */

const LABEL: Record<string, string> = SECTION_LABEL;

function Result({ state }: { state: AdminState }) {
  return <Notice error={state.error} message={state.ok ? state.message : undefined} />;
}

/** A signed-up account: pick the client it belongs to. */
export function LinkSignup({
  email,
  clients,
}: {
  email: string;
  clients: { id: string; company: string }[];
}) {
  const [state, action] = useActionState<AdminState, FormData>(linkEmail, {});
  return (
    <form action={action} className="a-inline">
      <input type="hidden" name="email" value={email} />
      <select name="client" className="field a-select" defaultValue="" required aria-label="العميل">
        <option value="" disabled>
          اختار العميل…
        </option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.company}
          </option>
        ))}
      </select>
      <Submit pending="…" variant="outline">
        اربط
      </Submit>
      <Result state={state} />
    </form>
  );
}

/** A client card: add an email that may open its portal. */
export function AddEmail({ clientId }: { clientId: string }) {
  const [state, action] = useActionState<AdminState, FormData>(linkEmail, {});
  return (
    <form action={action} className="a-inline">
      <input type="hidden" name="client" value={clientId} />
      <input
        type="email"
        name="email"
        className="field a-email"
        placeholder="name@company.com"
        required
        dir="ltr"
        aria-label="إيميل جديد"
      />
      <Submit pending="…" variant="outline">
        ضيف
      </Submit>
      <Result state={state} />
    </form>
  );
}

/** One linked email, with a button that unlinks it. */
export function EmailChip({ clientId, email }: { clientId: string; email: string }) {
  const [state, action] = useActionState<AdminState, FormData>(unlinkEmail, {});
  return (
    <form action={action} className="a-chip">
      <input type="hidden" name="client" value={clientId} />
      <input type="hidden" name="email" value={email} />
      <span dir="ltr">{email}</span>
      <button type="submit" className="a-chip-x" aria-label={`شيل ${email}`} title="شيل الإيميل">
        ×
      </button>
      {state.error ? <Result state={state} /> : null}
    </form>
  );
}

/** Which portal sections a client opens; the rest show as «قريبًا». */
export function SectionsForm({
  clientId,
  open,
  isDefault,
}: {
  clientId: string;
  open: string[];
  isDefault: boolean;
}) {
  const [state, action] = useActionState<AdminState, FormData>(saveSections, {});
  return (
    <form action={action} className="a-sections">
      <input type="hidden" name="client" value={clientId} />
      <div className="a-checks">
        {SECTIONS.map((s) => (
          <label key={s} className="a-check">
            <input type="checkbox" name="section" value={s} defaultChecked={open.includes(s)} />
            <span>{LABEL[s] ?? s}</span>
          </label>
        ))}
      </div>
      <div className="a-inline">
        <Submit pending="…">احفظ الأقسام</Submit>
        {isDefault ? (
          <span className="p-meta">الأقسام الافتراضية</span>
        ) : (
          <button type="submit" name="reset" value="1" className="p-link a-reset">
            رجّع الافتراضي
          </button>
        )}
      </div>
      <Result state={state} />
    </form>
  );
}

const STATUSES: TicketStatus[] = ["new", "progress", "answered", "closed"];

/** The team's reply and status on one ticket. */
export function TicketReply({
  id,
  status,
  reply,
}: {
  id: string;
  status: TicketStatus;
  reply: string;
}) {
  const [state, action] = useActionState<AdminState, FormData>(updateTicket, {});
  return (
    <form action={action} className="a-reply">
      <input type="hidden" name="ticket" value={id} />
      <textarea
        name="reply"
        className="field"
        rows={3}
        maxLength={2000}
        defaultValue={reply}
        placeholder="ردّك على العميل، هيظهرله في البوابة."
        aria-label="الرد"
      />
      <div className="a-inline">
        <select name="status" className="field a-select" defaultValue={status === "new" ? "answered" : status} aria-label="الحالة">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {TICKET_STATUS[s][0]}
            </option>
          ))}
        </select>
        <Submit pending="جارٍ الحفظ…">احفظ</Submit>
      </div>
      <Result state={state} />
    </form>
  );
}
