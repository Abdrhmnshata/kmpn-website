import "server-only";
import { sheetsGet } from "./google";
import type { ReportClient } from "./clients";

/* =========================================================
   A client's performance sheet, read as the team sees it:
   every value as formatted in the sheet and every cell's
   effective background (fixed fills and conditional
   formatting alike), so the report keeps the sheet's colours
   without re-implementing its rules.
   ========================================================= */

const REVALIDATE = 60; // seconds; the report trails the sheet by at most a minute

export type Tone = "good" | "bad" | "warn" | "info" | "neutral";

export type Cell = {
  text: string;
  num: number | null;
  /** The sheet colour mapped to a theme tone, so it reads in light and dark. */
  tone: Tone | null;
  /** A colour that fits no tone, kept as is. */
  color: string | null;
  bold: boolean;
};

export type ReportRow = {
  /** Text in the "Achievment" column that is not a progress bar (a product line, "ROAS"). */
  group: string | null;
  metric: string;
  note: string | null;
  extras: string[];
  target: Cell | null;
  daily: Cell | null;
  mtd: Cell | null;
  pct: Cell | null;
  days: Cell[];
};

export type Section = { title: string; rows: ReportRow[] };

export type Block = {
  /** Day headers up to the last day with data. */
  days: string[];
  /** Day columns in the sheet (the length of the month). */
  totalDays: number;
  noteLabel: string | null;
  extraLabels: string[];
  sections: Section[];
};

export type ParsedTab =
  | { kind: "blocks"; title: string; blocks: Block[]; side: string[][] }
  | { kind: "table"; title: string; header: Cell[]; rows: Cell[][] };

export type TabRef = { title: string; label: string; month: number | null };

/* ---------- fetching ------------------------------------ */

type ApiColor = { red?: number; green?: number; blue?: number };
type ApiCell = {
  formattedValue?: string;
  effectiveFormat?: { backgroundColor?: ApiColor; textFormat?: { bold?: boolean } };
};
type ApiRange = { startRowIndex?: number; endRowIndex?: number; startColumnIndex?: number; endColumnIndex?: number };
type ApiSheet = {
  properties: { title: string; hidden?: boolean; index?: number };
  merges?: ApiRange[];
  data?: { rowData?: { values?: ApiCell[] }[] }[];
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** The client's tabs in report order: months newest first, then the extra tabs. */
export async function reportTabs(client: ReportClient): Promise<TabRef[]> {
  const res = await sheetsGet<{ sheets: ApiSheet[] }>(
    client.spreadsheetId,
    new URLSearchParams({ fields: "sheets.properties(title,hidden,index)" }),
    REVALIDATE,
  );
  const titles = res.sheets.map((s) => s.properties.title);
  const months: TabRef[] = [];
  for (const title of titles) {
    const m = client.monthTab.exec(title);
    if (!m) continue;
    const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (month < 0) continue;
    months.push({ title, label: MONTHS_AR[month], month });
  }
  months.sort((a, b) => (b.month ?? 0) - (a.month ?? 0));
  const extras = client.extraTabs
    .filter((t) => titles.includes(t.title))
    .map((t) => ({ title: t.title, label: t.label, month: null }));
  return [...months, ...extras];
}

/** The tab list, the tab asked for (else the newest month) and its contents. */
export async function loadReport(client: ReportClient, wanted: string | undefined) {
  const tabs = await reportTabs(client);
  const current = tabs.find((t) => t.title === wanted) ?? tabs[0];
  if (!current) throw new Error(`no report tabs in ${client.spreadsheetId}`);
  return { tabs, current, tab: await readTab(client, current.title) };
}

export async function readTab(client: ReportClient, title: string): Promise<ParsedTab> {
  const quoted = `'${title.replace(/'/g, "''")}'`;
  const res = await sheetsGet<{ sheets: ApiSheet[] }>(
    client.spreadsheetId,
    new URLSearchParams({
      ranges: quoted,
      includeGridData: "true",
      fields:
        "sheets(properties.title,merges,data.rowData.values(formattedValue,effectiveFormat(backgroundColor,textFormat.bold)))",
    }),
    REVALIDATE,
  );
  const sheet = res.sheets[0];
  const grid = (sheet.data?.[0]?.rowData ?? []).map((r) => (r.values ?? []).map(toCell));
  return parseGrid(title, grid, sheet.merges ?? []);
}

/* ---------- cells --------------------------------------- */

const EMPTY: Cell = { text: "", num: null, tone: null, color: null, bold: false };

function toCell(c: ApiCell): Cell {
  const text = (c.formattedValue ?? "").trim();
  const { tone, color } = colorOf(c.effectiveFormat?.backgroundColor);
  return { text, num: toNum(text), tone, color, bold: Boolean(c.effectiveFormat?.textFormat?.bold) };
}

export function toNum(text: string): number | null {
  const s = text.replace(/[£$€,\s]/g, "").replace(/^E(?=[\d.-])/, "");
  if (!s) return null;
  const pct = s.endsWith("%");
  const n = Number(pct ? s.slice(0, -1) : s);
  if (!Number.isFinite(n)) return null;
  return pct ? n / 100 : n;
}

/** Sheets omits zero colour channels; a missing colour is the default white. */
function colorOf(c: ApiColor | undefined): { tone: Tone | null; color: string | null } {
  if (!c) return { tone: null, color: null };
  const r = c.red ?? 0;
  const g = c.green ?? 0;
  const b = c.blue ?? 0;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (min > 0.97) return { tone: null, color: null };
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (s < 0.12) return { tone: l > 0.8 ? "neutral" : null, color: null };
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h >= 75 && h < 170) return { tone: "good", color: null };
  if (h < 15 || h >= 340) return { tone: "bad", color: null };
  if (h < 65) return { tone: "warn", color: null };
  if (h >= 170 && h < 260) return { tone: "info", color: null };
  const hex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return { tone: null, color: `#${hex(r)}${hex(g)}${hex(b)}` };
}

/* ---------- parsing ------------------------------------- */

const DAY = /^(\d{1,2}-[A-Za-z]{3}|[A-Za-z]{3}-\d{1,2})$/;
const BAR = /[█▓▒░]/;

type Cols = {
  platform: number;
  achievement: number;
  metric: number;
  note: number;
  target: number;
  daily: number;
  mtd: number;
  pct: number;
  days: number[];
  extras: number[];
  first: number;
};

function columnsOf(header: Cell[]): Cols {
  const cols: Cols = {
    platform: -1,
    achievement: -1,
    metric: -1,
    note: -1,
    target: -1,
    daily: -1,
    mtd: -1,
    pct: -1,
    days: [],
    extras: [],
    first: Infinity,
  };
  header.forEach((cell, i) => {
    const t = cell.text.toLowerCase();
    if (!t) return;
    if (t === "platform") cols.platform = i;
    else if (t.startsWith("achi")) cols.achievement = i;
    else if (t === "metric") cols.metric = i;
    else if (t === "calculations" || t === "calculation" || t === "src" || t === "product line") cols.note = i;
    else if (t === "target") cols.target = i;
    else if (t.startsWith("daily")) cols.daily = i;
    else if (t.includes("mtd")) cols.mtd = i;
    else if (t === "%") cols.pct = i;
    else if (DAY.test(cell.text)) cols.days.push(i);
    else {
      cols.extras.push(i);
      return;
    }
    cols.first = Math.min(cols.first, i);
  });
  // Text left of the table (notes the team keeps beside it) is not a column.
  cols.extras = cols.extras.filter((i) => i > cols.first);
  return cols;
}

const isHeader = (row: Cell[]) => row.some((c) => c.text.toLowerCase() === "metric");
const at = (row: Cell[], i: number) => (i >= 0 ? (row[i] ?? EMPTY) : EMPTY);
const orNull = (row: Cell[], i: number) => (i >= 0 ? (row[i] ?? EMPTY) : null);

/** A day holds data when it has a value other than the zeros formulas leave ahead of time. */
const hasData = (c: Cell) => c.text !== "" && c.num !== 0;

function parseGrid(title: string, grid: Cell[][], merges: ApiRange[]): ParsedTab {
  const headerRows = grid.map((row, i) => (isHeader(row) ? i : -1)).filter((i) => i >= 0);
  if (headerRows.length === 0) return plainTable(title, grid);

  // Merged "Achievment" cells (a group label spanning rows) count on every row they cover.
  const mergedFrom = new Map<string, string>();
  for (const m of merges) {
    const r0 = m.startRowIndex ?? 0;
    const c0 = m.startColumnIndex ?? 0;
    const text = grid[r0]?.[c0]?.text;
    if (!text) continue;
    for (let r = r0 + 1; r < (m.endRowIndex ?? r0 + 1); r++)
      for (let c = c0; c < (m.endColumnIndex ?? c0 + 1); c++) mergedFrom.set(`${r}:${c}`, text);
  }

  const blocks: Block[] = [];
  let firstCol = Infinity;

  headerRows.forEach((h, n) => {
    const end = headerRows[n + 1] ?? grid.length;
    const cols = columnsOf(grid[h]);
    firstCol = Math.min(firstCol, cols.first);
    const sections: Section[] = [];
    let section: Section | null = null;

    for (let r = h + 1; r < end; r++) {
      const row = grid[r];
      const platform = at(row, cols.platform).text;
      if (platform) {
        section = { title: platform, rows: [] };
        sections.push(section);
      }
      const metricText = at(row, cols.metric).text;
      const noteText = at(row, cols.note).text;
      const label = metricText || noteText;
      const values = [cols.target, cols.daily, cols.mtd, cols.pct, ...cols.days].map((i) => at(row, i));
      if (!label && !values.some((c) => c.text)) continue;

      const groupText = at(row, cols.achievement).text || mergedFrom.get(`${r}:${cols.achievement}`) || "";
      if (!section) {
        section = { title: "", rows: [] };
        sections.push(section);
      }
      section.rows.push({
        group: groupText && !BAR.test(groupText) ? groupText : null,
        metric: label,
        note: metricText && noteText && noteText !== metricText ? noteText : null,
        extras: cols.extras.map((i) => at(row, i).text),
        target: orNull(row, cols.target),
        daily: orNull(row, cols.daily),
        mtd: orNull(row, cols.mtd),
        pct: orNull(row, cols.pct),
        days: cols.days.map((i) => at(row, i)),
      });
    }

    // Show the days up to the last one with data.
    let last = -1;
    for (const s of sections)
      for (const row of s.rows)
        row.days.forEach((c, i) => {
          if (hasData(c) && i > last) last = i;
        });
    const count = last + 1;
    for (const s of sections) for (const row of s.rows) row.days = row.days.slice(0, count);

    blocks.push({
      days: cols.days.slice(0, count).map((i) => grid[h][i].text),
      totalDays: cols.days.length,
      noteLabel: cols.note >= 0 ? grid[h][cols.note].text : null,
      extraLabels: cols.extras.map((i) => grid[h][i].text),
      sections: sections.filter((s) => s.rows.length > 0),
    });
  });

  // Notes the team keeps beside the table (left of its first column), e.g. break-even ROAS per line.
  const side: string[][] = [];
  if (Number.isFinite(firstCol))
    for (const row of grid) {
      const cells = row.slice(0, firstCol).map((c) => c.text).filter(Boolean);
      if (cells.length) side.push(cells);
    }

  return { kind: "blocks", title, blocks, side: side.some((r) => r.length > 1) ? side : [] };
}

function plainTable(title: string, grid: Cell[][]): ParsedTab {
  const rows = grid.filter((row) => row.some((c) => c.text));
  const width = Math.max(0, ...rows.map((r) => r.findLastIndex((c) => c.text) + 1));
  const pad = (row: Cell[]) => Array.from({ length: width }, (_, i) => row[i] ?? EMPTY);
  const [header = [], ...body] = rows;
  return {
    kind: "table",
    title,
    header: pad(header),
    // A row with only its first cell filled is a month still to come.
    rows: body.filter((r) => r.slice(1).some((c) => c.text)).map(pad),
  };
}
