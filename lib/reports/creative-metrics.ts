import type { Totals } from "./creative";

/** The ratios the creative report shows, from summed Meta numbers (null when undefined). */
const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

export const metrics = (t: Totals) => ({
  spend: t.spend,
  value: t.purchase_value,
  purchases: t.purchases,
  impressions: t.impressions,
  clicks: t.link_clicks,
  roas: ratio(t.purchase_value, t.spend),
  cpa: ratio(t.spend, t.purchases),
  ctr: ratio(t.link_clicks, t.impressions),
  /** Hook rate: 3-second plays per impression. */
  hook: t.v3s > 0 ? ratio(t.v3s, t.impressions) : null,
  /** Hold rate: ThruPlays per 3-second play. */
  hold: t.v3s > 0 ? ratio(t.thruplay, t.v3s) : null,
});
export type Metrics = ReturnType<typeof metrics>;

const en = (digits: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtMoney = (v: number | null, short = false) =>
  v === null
    ? "—"
    : short && Math.abs(v) >= 1000
      ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v)
      : en(0).format(v);
export const fmtInt = (v: number | null) => (v === null ? "—" : en(0).format(Math.round(v)));
// A Latin x keeps "10.24x" in order inside Arabic text (× is neutral and flips).
export const fmtRoas = (v: number | null) => (v === null ? "—" : `${en(2).format(v)}x`);
export const fmtPct = (v: number | null) => (v === null ? "—" : `${en(Math.abs(v) < 0.1 ? 2 : 1).format(v * 100)}%`);

/** Change against the previous period, as a fraction (0.12 = +12%). */
export const change = (now: number | null, before: number | null) =>
  now === null || before === null || before === 0 ? null : now / before - 1;

/** ROAS against the account's target and floor: good, ok or weak. */
export function roasTone(v: number | null, target: number | null, floor: number | null) {
  if (v === null || target === null) return "";
  if (v >= target) return "good";
  if (v >= (floor ?? target)) return "ok";
  return "bad";
}
