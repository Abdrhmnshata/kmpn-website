#!/usr/bin/env node
/**
 * Pulls the "أعمالنا" portfolio from Notion into the repo. One database per
 * Kampaign vertical, all under the Notion page "Kampaign Portfolio":
 *
 *   studio    "KMPN Studio - Branding Case Studies - [Public]"
 *             rows with Status = Done & Delivered that have a cover
 *   commerce  "Kampaign Commerce Shopify Portfolio"
 *             Project Status = Delivered and Status = Active & Running
 *   digital   "Digital Transformation Case Studies"
 *             every row whose Company Status is not Closed
 *
 * Output:
 *   lib/portfolio.json                  data for all three, in display order
 *   public/portfolio/<vertical>/*.webp  covers, logos, logo concepts
 *
 * Notion's file URLs expire within the hour, so every image is downloaded
 * and re-encoded here instead of being linked.
 *
 * Order: studio keeps the order already in lib/portfolio.json (reorder it by
 * hand if needed) with newly added projects first; commerce is newest
 * delivery year first; digital follows the "Priority" column.
 *
 * The site never runs this on its own: the build uses the committed files.
 * Updating "أعمالنا" is a deliberate step: run this, review what it prints
 * and the git diff, then commit and deploy once the change is agreed.
 *
 * Usage (NOTION_TOKEN in .env.local, which git ignores):
 *   npm run sync:portfolio
 *
 * The token's integration must be connected to the "Kampaign Portfolio" page
 * (••• → Connections), or every query returns 404.
 */

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(ROOT, "lib", "portfolio.json");
const IMG_DIR = join(ROOT, "public", "portfolio");
const IMG_URL = "/portfolio";
const NOTION_VERSION = "2025-09-03";

const DATA_SOURCES = {
  studio: process.env.NOTION_STUDIO_DATA_SOURCE ?? "2dac45aa-cc37-8139-9be2-000b01961f46",
  commerce: process.env.NOTION_COMMERCE_DATA_SOURCE ?? "2c5c45aa-cc37-81f1-b755-000b4f9898bb",
  digital: process.env.NOTION_DIGITAL_DATA_SOURCE ?? "2dac45aa-cc37-807c-aa15-000b2a1d8216",
};

const token = process.env.NOTION_TOKEN?.trim();

/* ------------------------------------------------------------ Notion ---- */

async function notion(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Notion ${res.status} on ${path}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

async function queryAll(dataSourceId, filter) {
  const pages = [];
  let cursor;
  do {
    const data = await notion(`data_sources/${dataSourceId}/query`, {
      filter,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

/** Some property names in these databases end in a space; match on trimmed names. */
function prop(props, name) {
  const key = Object.keys(props).find((k) => k.trim() === name);
  return key ? props[key] : undefined;
}

const plain = (p) =>
  (p?.title ?? p?.rich_text ?? [])
    .map((t) => t.plain_text)
    .join("")
    .trim();

const names = (p) => p?.multi_select?.map((o) => o.name) ?? [];
const selectName = (p) => p?.select?.name ?? p?.status?.name ?? null;

const fileOf = (f) =>
  f ? { url: f.external?.url ?? f.file?.url, uploaded: f.type === "file" } : null;

const firstFile = (p) => fileOf(p?.files?.[0]);

function placeName(p) {
  const v = p?.[p?.type];
  if (!v) return null;
  if (typeof v === "string") return v.trim() || null;
  return String(v.name ?? v.address ?? "").trim() || null;
}

/** Image URL of a page icon: uploaded file, external link or custom emoji. */
function iconUrl(icon) {
  if (!icon) return null;
  return icon.file?.url ?? icon.external?.url ?? icon.custom_emoji?.url ?? null;
}

const toUrl = (s) => (!s ? null : /^https?:\/\//i.test(s) ? s : `https://${s.replace(/^\/+/, "")}`);

/* ------------------------------------------------------------ images ---- */

async function load(src) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`Download failed (${res.status}): ${src.split("?")[0]}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** Colour of the top-left corner, so a page can extend the image's background. */
async function cornerColor(buf) {
  const { data, info } = await sharp(buf)
    .extract({ left: 2, top: 2, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels === 4 && data[3] < 200) return null;
  return "#" + [data[0], data[1], data[2]].map((n) => n.toString(16).padStart(2, "0")).join("");
}

/**
 * For an image on a transparent background: whether what is drawn is light
 * or dark, so the page can put it on a background it shows up against.
 */
async function inkTone(buf) {
  const { data } = await sharp(buf)
    .ensureAlpha()
    .resize(48, 48, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    n++;
  }
  return n && sum / n > 190 ? "light" : "dark";
}

/**
 * Downloads `url`, writes it as WebP at `public/portfolio/<path>` (queued in
 * `files`) and returns the entry the pages use.
 */
async function image(files, url, path, maxWidth) {
  const buf = await load(url);
  const { data, info } = await sharp(buf)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  files.push({ path, data });
  const color = await cornerColor(buf);
  return {
    src: `${IMG_URL}/${path}`,
    width: info.width,
    height: info.height,
    color,
    ...(color ? {} : { ink: await inkTone(buf) }),
  };
}

/* ----------------------------------------------------------- mapping ---- */

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(name, id, used) {
  let slug = slugify(name) || id.replace(/-/g, "").slice(0, 8);
  if (used.has(slug)) slug = `${slug}-${id.replace(/-/g, "").slice(0, 4)}`;
  used.add(slug);
  return slug;
}

/** "2023 - Halley International Schools - Saudi Arabia" → year + country. */
function parseDateText(text) {
  const parts = text.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  const year = parts.length && /^\d{4}$/.test(parts[0]) ? parts[0] : null;
  const country = parts.length >= 3 ? parts[parts.length - 1] : null;
  return { year, country };
}

async function mapStudio(page, files, used) {
  const p = page.properties;
  const name = plain(prop(p, "Name"));
  const cover = fileOf(page.cover);
  if (!name || !cover?.url) return null; // a project without a cover has nothing to show

  const slug = uniqueSlug(name, page.id, used);
  const { year, country } = parseDateText(plain(prop(p, "Date")));

  const concept = firstFile(prop(p, "Logo concept (anatomy)"));

  // An uploaded brand book expires like any Notion file, so keep a copy;
  // a link (Drive, Behance…) is used as it is.
  let brandBook = null;
  const book = firstFile(prop(p, "Brand Book"));
  if (book?.url) {
    if (book.uploaded) {
      const ext = extname(new URL(book.url).pathname) || ".pdf";
      const path = `studio/${slug}-brand-book${ext}`;
      files.push({ path, data: await load(book.url) });
      brandBook = `${IMG_URL}/${path}`;
    } else {
      brandBook = book.url;
    }
  }

  return {
    id: page.id,
    slug,
    name,
    services: names(prop(p, "Type")),
    year,
    country: placeName(prop(p, "Market")) ?? country,
    behance: firstFile(prop(p, "Behance Link"))?.url ?? null,
    brandBook,
    cover: await image(files, cover.url, `studio/${slug}.webp`, 1600),
    concept: concept?.url ? await image(files, concept.url, `studio/${slug}-concept.webp`, 1600) : null,
  };
}

async function mapCommerce(page, files, used) {
  const p = page.properties;
  const name = plain(prop(p, "Project name"));
  if (!name) return null;
  const slug = uniqueSlug(name, page.id, used);

  const shot = fileOf(page.cover) ?? firstFile(prop(p, "Files & media"));
  const logo = iconUrl(page.icon);

  return {
    id: page.id,
    slug,
    name,
    url: toUrl(prop(p, "Store Link")?.url),
    year: selectName(prop(p, "Delivery year")),
    country: placeName(prop(p, "Place")),
    migratedFrom: selectName(prop(p, "Migration Source")),
    image: shot?.url ? await image(files, shot.url, `commerce/${slug}.webp`, 1200) : null,
    logo: logo ? await image(files, logo, `commerce/${slug}-logo.webp`, 400) : null,
  };
}

async function mapDigital(page, files, used) {
  const p = page.properties;
  const brand = plain(prop(p, "Brand"));
  if (!brand) return null;
  const slug = uniqueSlug(brand, page.id, used);
  const logo = iconUrl(page.icon);

  return {
    id: page.id,
    slug,
    brand,
    solution: selectName(prop(p, "Solution")),
    services: names(prop(p, "Services")),
    industries: names(prop(p, "Industry")),
    country: placeName(prop(p, "Market")),
    performance: plain(prop(p, "Performance")) || null,
    monthly: plain(prop(p, "Monthly record")) || null,
    roi: plain(prop(p, "ROI (90% accuracy)")) || null,
    store: toUrl(plain(prop(p, "Shopify"))),
    priority: prop(p, "Priority")?.number ?? null,
    logo: logo ? await image(files, logo, `digital/${slug}-logo.webp`, 400) : null,
  };
}

const VERTICALS = {
  studio: {
    filter: { property: "Status", status: { equals: "Done & Delivered" } },
    map: mapStudio,
  },
  commerce: {
    filter: {
      and: [
        { property: "Project Status", status: { equals: "Delivered" } },
        { property: "Status", select: { equals: "Active & Running" } },
      ],
    },
    map: mapCommerce,
  },
  digital: {
    filter: { property: "Company Status", status: { does_not_equal: "Closed" } },
    map: mapDigital,
  },
};

/* ------------------------------------------------------------- order ---- */

/** Keep the previous order for known ids; new ones go first. */
function keepOrder(items, previous = []) {
  const index = new Map(previous.map((p, i) => [p.id, i]));
  const fresh = items.filter((i) => !index.has(i.id));
  const known = items.filter((i) => index.has(i.id)).sort((a, b) => index.get(a.id) - index.get(b.id));
  return [...fresh, ...known];
}

const byYearDesc = (a, b) => (b.year ?? "0").localeCompare(a.year ?? "0") || a.name.localeCompare(b.name);
const byPriority = (a, b) =>
  (a.priority ?? Infinity) - (b.priority ?? Infinity) || a.brand.localeCompare(b.brand);

/* -------------------------------------------------------------- main ---- */

async function readPrevious() {
  try {
    return JSON.parse(await readFile(JSON_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full)));
    else out.push(full);
  }
  return out;
}

/** What a sync adds to or removes from each vertical, for review before committing. */
function describeChanges(previous, next) {
  const title = (item) => item.name ?? item.brand ?? item.id;
  const lines = [];
  for (const key of ["studio", "commerce", "digital"]) {
    const before = new Map((previous[key] ?? []).map((i) => [i.id, i]));
    const after = new Map(next[key].map((i) => [i.id, i]));
    const added = next[key].filter((i) => !before.has(i.id)).map(title);
    const removed = [...before.values()].filter((i) => !after.has(i.id)).map(title);
    lines.push(
      `  ${key}: ${next[key].length}` +
        (added.length ? `\n    + ${added.join("\n    + ")}` : "") +
        (removed.length ? `\n    - ${removed.join("\n    - ")}` : "") +
        (added.length || removed.length ? "" : " (no projects added or removed)"),
    );
  }
  return lines.join("\n");
}

async function main() {
  if (!token) {
    throw new Error("NOTION_TOKEN is not set. Put it in .env.local and run `npm run sync:portfolio`.");
  }

  // Build everything in memory first, so a failure leaves the repo untouched.
  const files = [];
  const result = {};
  for (const [key, { filter, map }] of Object.entries(VERTICALS)) {
    const pages = await queryAll(DATA_SOURCES[key], filter);
    const used = new Set();
    const items = [];
    for (const page of pages) {
      const item = await map(page, files, used);
      if (item) items.push(item);
    }
    result[key] = items;
  }

  const previous = await readPrevious();
  result.studio = keepOrder(result.studio, previous.studio ?? previous.projects);
  result.commerce.sort(byYearDesc);
  result.digital.sort(byPriority);

  const keep = new Set();
  for (const f of files) {
    const full = join(IMG_DIR, ...f.path.split("/"));
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, f.data);
    keep.add(full);
  }
  for (const full of await listFiles(IMG_DIR)) {
    if (!keep.has(full)) await rm(full);
  }

  const out = {
    syncedAt: new Date().toISOString(),
    studio: result.studio,
    commerce: result.commerce,
    digital: result.digital,
  };
  await writeFile(JSON_PATH, JSON.stringify(out, null, 2) + "\n");

  const rel = relative(ROOT, IMG_DIR).split(sep).join("/");
  console.log(`[portfolio] Synced from Notion; ${files.length} files in ${rel}/`);
  console.log(describeChanges(previous, out));
  console.log("Review with `git status` and `git diff lib/portfolio.json`, then commit to publish.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
