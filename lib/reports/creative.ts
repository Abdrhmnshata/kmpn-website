import "server-only";

/**
 * «أداء المحتوى الإعلاني»: how each ad creative performs, read from the
 * team's creative-report artifact on claude.ai.
 *
 * A daily cloud routine refreshes that artifact from Meta (read-only) and
 * publishes a new data.json with it: one row per ad per day since the
 * account's first day, plus each ad's creative, cover and video. The
 * artifact is shared by link, and its files are served at
 *   https://<artifact uuid>.frame.claudeusercontent.com/_f/<version>/<path>
 * where any unknown version ("latest") redirects to the current one.
 *
 * The artifact's id is a secret (it opens the team's full internal report):
 * it lives in CREATIVE_REPORT_<SLUG>, never in this public repository. The
 * portal shows the client only the numbers below, and serves covers and
 * videos through /api/creative/<slug>/… so the artifact's address never
 * reaches the browser.
 */

const NUMBERS = [
  "spend",
  "impressions",
  "link_clicks",
  "purchases",
  "purchase_value",
  "v3s",
  "thruplay",
  "video_plays",
] as const;
type Num = (typeof NUMBERS)[number];
export type Totals = Record<Num, number>;

type RawAd = {
  ad_id: string;
  creative_key?: string;
  creative_name?: string;
  ad_name?: string;
  format?: string;
  status?: string;
  launch_date?: string;
  thumb?: string;
  video?: string;
  video_length_s?: number;
};
type RawReport = {
  meta: {
    currency?: string;
    target_roas?: number;
    floor_roas?: number;
    data_from: string;
    data_to: string;
    default_days?: number;
  };
  ads: RawAd[];
  days: string[];
  cols: string[];
  rows: (number | null)[][];
};

export type CreativeFormat = "video" | "image" | "catalog";

export type CreativeRow = {
  key: string;
  name: string;
  format: CreativeFormat;
  /** Paths inside the artifact (media/t/….jpg, media/v/….mp4), served by /api/creative. */
  thumb: string | null;
  video: string | null;
  lengthS: number | null;
  active: boolean;
  launch: string | null;
  ads: number;
  cur: Totals;
  prev: Totals | null;
};

export type RangeId = "yd" | "7d" | "14d" | "30d" | "tm" | "lm" | "all";
export type RangePreset = { id: RangeId; label: string; from: string; to: string };

export type CreativeSummary = {
  currency: string;
  target: number | null;
  floor: number | null;
  dataFrom: string;
  dataTo: string;
  range: RangePreset & { days: number };
  presets: RangePreset[];
  prevRange: { from: string; to: string } | null;
  total: Totals;
  prevTotal: Totals | null;
  creatives: CreativeRow[];
};

/* ------------------------------------------------------------ source ---- */

const ARTIFACT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The artifact behind a client's creative report, or null when it has none. */
function artifactFor(slug: string): string | null {
  const id = process.env[`CREATIVE_REPORT_${slug.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`]?.trim().toLowerCase();
  return id && ARTIFACT_ID.test(id) ? id : null;
}

export const hasCreativeReport = (slug: string) => artifactFor(slug) !== null;

/** Covers and videos only: nothing else of the artifact can be asked for. */
export const MEDIA_PATH = /^media\/(t\/[\w.-]+\.jpg|v\/[\w.-]+\.mp4)$/;

/** The artifact file's address, always its newest version. */
export function artifactFileUrl(slug: string, path: string): string | null {
  const id = artifactFor(slug);
  return id ? `https://${id}.frame.claudeusercontent.com/_f/latest/${path}` : null;
}

async function loadRaw(slug: string): Promise<RawReport> {
  const url = artifactFileUrl(slug, "data.json");
  if (!url) throw new Error(`no CREATIVE_REPORT for ${slug}`);
  // The routine publishes once a day; a 15-minute copy is fresh enough.
  const res = await fetch(url, { next: { revalidate: 900, tags: [`creative-${slug}`] } });
  if (!res.ok) throw new Error(`creative report ${slug}: HTTP ${res.status}`);
  const raw = (await res.json()) as RawReport;
  if (!raw?.meta?.data_from || !Array.isArray(raw.rows) || !Array.isArray(raw.ads)) {
    throw new Error(`creative report ${slug}: unexpected data.json shape`);
  }
  return raw;
}

/* ------------------------------------------------------------ ranges ---- */

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5) + 1;

function presets(from: string, to: string): RangePreset[] {
  const monthStart = `${to.slice(0, 8)}01`;
  const lastMonthEnd = addDays(monthStart, -1);
  const lastMonthStart = `${lastMonthEnd.slice(0, 8)}01`;
  const list: RangePreset[] = [
    { id: "yd", label: "آخر يوم", from: to, to },
    { id: "7d", label: "آخر 7 أيام", from: addDays(to, -6), to },
    { id: "14d", label: "آخر 14 يومًا", from: addDays(to, -13), to },
    { id: "30d", label: "آخر 30 يومًا", from: addDays(to, -29), to },
    { id: "tm", label: "هذا الشهر", from: monthStart, to },
    { id: "lm", label: "الشهر الماضي", from: lastMonthStart, to: lastMonthEnd },
    { id: "all", label: "كل البيانات", from, to },
  ];
  return list.filter((p) => p.to >= from).map((p) => ({ ...p, from: p.from < from ? from : p.from }));
}

/* ----------------------------------------------------------- summary ---- */

const zero = (): Totals => Object.fromEntries(NUMBERS.map((k) => [k, 0])) as Totals;

function formatOf(raw: string | undefined): CreativeFormat {
  if (/video/i.test(raw ?? "")) return "video";
  if (/catalog/i.test(raw ?? "")) return "catalog";
  return "image";
}

/** Each creative's numbers over a range (and the same length just before it), biggest spend first. */
export async function loadCreativeSummary(slug: string, rangeId?: string): Promise<CreativeSummary> {
  const raw = await loadRaw(slug);
  const { data_from: dataFrom, data_to: dataTo } = raw.meta;
  const list = presets(dataFrom, dataTo);
  const fallback = `${raw.meta.default_days ?? 14}d`;
  const range =
    list.find((p) => p.id === rangeId) ?? list.find((p) => p.id === fallback) ?? list[list.length - 1];
  const days = daysBetween(range.from, range.to);
  // A calendar month (this month so far, last month) is set against the same
  // days of the month before it; any other range against the days just before.
  const monthly = (range.id === "tm" || range.id === "lm") && range.from.endsWith("-01");
  const prevFrom = monthly ? `${addDays(range.from, -1).slice(0, 8)}01` : addDays(range.from, -days);
  const monthEnd = addDays(range.from, -1);
  const prevTo = monthly ? [addDays(prevFrom, days - 1), monthEnd].sort()[0] : monthEnd;
  const hasPrev = prevFrom >= dataFrom;

  const col = new Map(raw.cols.map((c, i) => [c, i + 2]));
  const cur = new Map<number, Totals>();
  const prev = new Map<number, Totals>();
  const add = (into: Map<number, Totals>, ad: number, row: (number | null)[]) => {
    const t = into.get(ad) ?? zero();
    for (const k of NUMBERS) {
      const i = col.get(k);
      const v = i === undefined ? null : row[i];
      if (typeof v === "number" && Number.isFinite(v)) t[k] += v;
    }
    into.set(ad, t);
  };
  for (const row of raw.rows) {
    const [ad, dayIndex] = row as [number, number];
    const day = raw.days[dayIndex];
    if (!day) continue;
    if (day >= range.from && day <= range.to) add(cur, ad, row);
    else if (hasPrev && day >= prevFrom && day <= prevTo) add(prev, ad, row);
  }

  // One card per creative: every placement and copy of the same asset counts once.
  const groups = new Map<string, number[]>();
  raw.ads.forEach((ad, i) => {
    if (!(cur.get(i)?.spend ?? 0)) return;
    const key = ad.creative_key || ad.ad_id;
    groups.set(key, [...(groups.get(key) ?? []), i]);
  });

  const sum = (from: Map<number, Totals>, ids: number[]) => {
    const t = zero();
    let any = false;
    for (const i of ids) {
      const s = from.get(i);
      if (!s) continue;
      any = true;
      for (const k of NUMBERS) t[k] += s[k];
    }
    return any ? t : null;
  };

  const creatives: CreativeRow[] = [...groups.entries()].map(([key, ids]) => {
    const bySpend = [...ids].sort((a, b) => (cur.get(b)?.spend ?? 0) - (cur.get(a)?.spend ?? 0));
    const top = raw.ads[bySpend[0]];
    const withThumb = bySpend.map((i) => raw.ads[i]).find((a) => a.thumb && MEDIA_PATH.test(a.thumb));
    const withVideo = bySpend.map((i) => raw.ads[i]).find((a) => a.video && MEDIA_PATH.test(a.video));
    const launches = ids.map((i) => raw.ads[i].launch_date).filter((d): d is string => !!d).sort();
    return {
      key,
      name: top.creative_name || top.ad_name || key,
      format: formatOf(top.format),
      thumb: withThumb?.thumb ?? null,
      video: withVideo?.video ?? null,
      lengthS: withVideo?.video_length_s ?? null,
      active: ids.some((i) => raw.ads[i].status === "Active"),
      launch: launches[0] ?? null,
      ads: ids.length,
      cur: sum(cur, ids) ?? zero(),
      prev: hasPrev ? sum(prev, ids) : null,
    };
  });
  creatives.sort((a, b) => b.cur.spend - a.cur.spend);

  const all = (from: Map<number, Totals>) => sum(from, [...from.keys()]) ?? zero();
  return {
    currency: raw.meta.currency ?? "",
    target: raw.meta.target_roas ?? null,
    floor: raw.meta.floor_roas ?? null,
    dataFrom,
    dataTo,
    range: { ...range, days },
    presets: list,
    prevRange: hasPrev ? { from: prevFrom, to: prevTo } : null,
    total: all(cur),
    prevTotal: hasPrev ? all(prev) : null,
    creatives,
  };
}
