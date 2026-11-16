#!/usr/bin/env node
/**
 * Pulls the portfolio from the Notion database
 * "KMPN Studio - Branding Case Studies - [Public]" into the repo:
 *
 *   lib/portfolio.json        project data, in display order
 *   public/portfolio/*.webp   covers and logo-concept images
 *
 * Only rows whose "Publish Status" is "Published" are taken. Notion's file
 * URLs expire within the hour, so every image is downloaded and re-encoded
 * here instead of being linked.
 *
 * Display order: projects already in lib/portfolio.json keep their place
 * (reorder that file by hand if needed); newly published ones go first,
 * newest first.
 *
 * Usage:
 *   NOTION_TOKEN=ntn_xxx node scripts/sync-portfolio.mjs
 *   node scripts/sync-portfolio.mjs --if-token
 *       Used by `prebuild`: without a token it does nothing, and if Notion
 *       fails it keeps the committed files, so a build never breaks on it.
 *   node scripts/sync-portfolio.mjs --raw records.json
 *       Builds from records exported by hand (same fields as toRecord()
 *       returns; image fields may be local paths).
 *
 * The integration behind NOTION_TOKEN must be added to the database
 * (••• → Connections) or the query returns 404.
 */

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = join(ROOT, "lib", "portfolio.json");
const IMG_DIR = join(ROOT, "public", "portfolio");
const IMG_URL = "/portfolio";

const DATA_SOURCE_ID =
  process.env.NOTION_PORTFOLIO_DATA_SOURCE ?? "2dac45aa-cc37-8139-9be2-000b01961f46";
const NOTION_VERSION = "2025-09-03";

const COVER_WIDTH = 1600;
const CONCEPT_WIDTH = 1600;

const args = process.argv.slice(2);
const ifToken = args.includes("--if-token");
const rawIndex = args.indexOf("--raw");
const rawFile = rawIndex >= 0 ? args[rawIndex + 1] : null;

/* ------------------------------------------------------------ Notion ---- */

async function notion(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
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

async function fetchPublishedPages() {
  const pages = [];
  let cursor;
  do {
    const data = await notion(`data_sources/${DATA_SOURCE_ID}/query`, {
      filter: { property: "Publish Status", status: { equals: "Published" } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

/** Some property names in the database end in a space; match on trimmed names. */
function prop(props, name) {
  const key = Object.keys(props).find((k) => k.trim() === name);
  return key ? props[key] : undefined;
}

const plain = (p) =>
  (p?.title ?? p?.rich_text ?? [])
    .map((t) => t.plain_text)
    .join("")
    .trim();

const fileOf = (f) =>
  f ? { url: f.external?.url ?? f.file?.url, uploaded: f.type === "file", name: f.name } : null;

const firstFile = (p) => fileOf(p?.files?.[0]);

/** "Market" is a place property; read whatever label it carries. */
function placeName(p) {
  const v = p?.[p?.type];
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  return String(v.name ?? v.address ?? "").trim();
}

function toRecord(page) {
  const p = page.properties;
  return {
    id: page.id,
    name: plain(prop(p, "Name")),
    types: prop(p, "Type")?.multi_select?.map((o) => o.name) ?? [],
    dateText: plain(prop(p, "Date - Client name - country")),
    market: placeName(prop(p, "Market")),
    behance: firstFile(prop(p, "Behance Link")),
    brandBook: firstFile(prop(p, "Brand Book")),
    concept: firstFile(prop(p, "Logo concept (anatomy)")),
    cover: fileOf(page.cover),
  };
}

/* ------------------------------------------------------------ images ---- */

async function load(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Download failed (${res.status}): ${src.split("?")[0]}`);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(src);
}

/** Colour of the top-left corner, so the page can extend the cover's background. */
async function cornerColor(buf) {
  const { data, info } = await sharp(buf)
    .extract({ left: 2, top: 2, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels === 4 && data[3] < 200) return null;
  return "#" + [data[0], data[1], data[2]].map((n) => n.toString(16).padStart(2, "0")).join("");
}

async function encode(src, maxWidth, withColor) {
  const buf = await load(src);
  const { data, info } = await sharp(buf)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return {
    data,
    width: info.width,
    height: info.height,
    color: withColor ? await cornerColor(buf) : undefined,
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

/** "2023 - Halley International Schools - Saudi Arabia" → year + country. */
function parseDateText(text) {
  const parts = text.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  const year = parts.length && /^\d{4}$/.test(parts[0]) ? parts[0] : null;
  const country = parts.length >= 3 ? parts[parts.length - 1] : null;
  return { year, country };
}

const asFile = (v) => (typeof v === "string" ? { url: v, uploaded: true } : v ?? null);

/** Returns the project entry plus the files it needs written. */
async function build(rec, usedSlugs) {
  let slug = slugify(rec.name) || rec.id.replace(/-/g, "").slice(0, 8);
  if (usedSlugs.has(slug)) slug = `${slug}-${rec.id.replace(/-/g, "").slice(0, 4)}`;
  usedSlugs.add(slug);

  const files = [];
  const { year, country } = parseDateText(rec.dateText ?? "");

  let cover = null;
  const coverSrc = asFile(rec.cover);
  if (coverSrc?.url) {
    const img = await encode(coverSrc.url, COVER_WIDTH, true);
    const file = `${slug}.webp`;
    files.push({ file, data: img.data });
    cover = { src: `${IMG_URL}/${file}`, width: img.width, height: img.height, color: img.color };
  }

  let concept = null;
  const conceptSrc = asFile(rec.concept);
  if (conceptSrc?.url) {
    const img = await encode(conceptSrc.url, CONCEPT_WIDTH, false);
    const file = `${slug}-concept.webp`;
    files.push({ file, data: img.data });
    concept = { src: `${IMG_URL}/${file}`, width: img.width, height: img.height };
  }

  // An uploaded brand book expires like any Notion file, so keep a copy;
  // a link (Drive, Behance…) is used as it is.
  let brandBook = null;
  const book = asFile(rec.brandBook);
  if (book?.url) {
    if (book.uploaded) {
      const ext = extname(new URL(book.url, "file:///").pathname) || ".pdf";
      const file = `${slug}-brand-book${ext}`;
      files.push({ file, data: await load(book.url) });
      brandBook = `${IMG_URL}/${file}`;
    } else {
      brandBook = book.url;
    }
  }

  const behance = asFile(rec.behance)?.url ?? null;

  return {
    project: {
      id: rec.id,
      slug,
      name: rec.name,
      services: rec.types ?? [],
      year,
      country: rec.market || country || null,
      behance,
      brandBook,
      cover,
      concept,
    },
    files,
  };
}

/* -------------------------------------------------------------- main ---- */

async function readPrevious() {
  try {
    return JSON.parse(await readFile(JSON_PATH, "utf8"));
  } catch {
    return { projects: [] };
  }
}

async function main() {
  let records;
  if (rawFile) {
    records = JSON.parse(await readFile(resolve(rawFile), "utf8"));
  } else {
    if (!process.env.NOTION_TOKEN) {
      if (ifToken) {
        console.log("[portfolio] NOTION_TOKEN not set; using the committed lib/portfolio.json.");
        return;
      }
      throw new Error("NOTION_TOKEN is not set.");
    }
    records = (await fetchPublishedPages()).map(toRecord);
  }

  // Build everything in memory first, so a failure leaves the repo untouched.
  const usedSlugs = new Set();
  const built = [];
  for (const rec of records) {
    if (!rec.name) continue;
    built.push(await build(rec, usedSlugs));
  }

  const previous = await readPrevious();
  const prevIndex = new Map(previous.projects.map((p, i) => [p.id, i]));
  const fresh = built.filter((b) => !prevIndex.has(b.project.id));
  const known = built
    .filter((b) => prevIndex.has(b.project.id))
    .sort((a, b) => prevIndex.get(a.project.id) - prevIndex.get(b.project.id));
  const ordered = [...fresh, ...known];

  await mkdir(IMG_DIR, { recursive: true });
  const keep = new Set();
  for (const { files } of ordered) {
    for (const f of files) {
      await writeFile(join(IMG_DIR, f.file), f.data);
      keep.add(f.file);
    }
  }
  for (const name of await readdir(IMG_DIR)) {
    if (!keep.has(name)) await rm(join(IMG_DIR, name));
  }

  const out = {
    source: `notion data source ${DATA_SOURCE_ID} (Publish Status = Published)`,
    syncedAt: new Date().toISOString(),
    projects: ordered.map((b) => b.project),
  };
  await writeFile(JSON_PATH, JSON.stringify(out, null, 2) + "\n");

  console.log(
    `[portfolio] ${out.projects.length} projects: ${out.projects.map((p) => p.slug).join(", ")}`,
  );
}

main().catch((err) => {
  if (ifToken) {
    console.warn(`[portfolio] Sync skipped, keeping committed files: ${err.message}`);
    return;
  }
  console.error(err);
  process.exit(1);
});
