# KMPN Agency Website

Arabic (RTL) marketing site for KMPN, built from the Claude Design handoff in
`../Altawheed Elnour Rebranding (2)/design_handoff_kmpn_website/`.

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel.

## Pages

| Route | Design source |
| --- | --- |
| `/` | `Kmpn Home.dc.html` |
| `/services` | `Kmpn Services.dc.html` |
| `/company` | `Kmpn Company.dc.html` |
| `/values` | `Kmpn Values.dc.html` |
| `/contact` | `Kmpn Contact.dc.html` |
| `/success-stories` | `Success Stories.dc.html` |
| `/success-stories/tawheed` | `Tawheed Case Study v3.dc.html` |
| `/portfolio`, `/portfolio/[slug]` | No design file; built on the site's tokens, data from Notion (see below) |

## Local development

```bash
npm install
npm run dev
```

Do not run `npm run build` while `npm run dev` is running — both write to
`.next` and the dev server will start throwing `ENOENT` on its manifest.

## Design tokens

`app/globals.css` holds the `[data-tw="light"]` / `[data-tw="dark"]` variable
blocks copied from the design files. Theme is stored in `localStorage` under
`tw-theme` and applied to `<html data-tw>` by a bootstrap script in
`app/layout.tsx`, so there is no flash on load.

Breakpoints mirror the design's JS flags: `900px` for the header nav, `640px`
for the `narrow` layout switch.

## Content

Page copy lives in `lib/content.ts`, the case study's numbers in
`lib/tawheed.ts`, and the success stories in `lib/stories.ts`.

Client logos, icons and the large artwork are still served from the KMPN
LightFunnels CDN exactly as the design referenced them; `next.config.ts`
allow-lists that host. Everything under `public/assets/` came from the
handoff's `assets/` folder.

## Portfolio (Notion)

`/portfolio` lists the rows of the Notion database
**KMPN Studio - Branding Case Studies - [Public]** whose *Publish Status* is
*Published*, and each gets a page at `/portfolio/<slug>`. A project is its
cover plus its properties: *Type* (shown as Arabic service labels, mapped in
`lib/portfolio.ts`), *Market* or *Date - Client name - country* (year and
country), *Behance Link*, *Brand Book* and *Logo concept (anatomy)*. The
internal fields (*Status*, *Company Status*) are not shown.

`scripts/sync-portfolio.mjs` writes `lib/portfolio.json` and the images in
`public/portfolio/`. Notion's file links expire within the hour, so images
are copied and converted to WebP. It runs as `prebuild` when `NOTION_TOKEN`
is set, so every Vercel build picks up the latest Notion data; without a
token, or if Notion fails, the committed files are used. To refresh locally:

```bash
NOTION_TOKEN=ntn_xxx npm run sync:portfolio
```

The token's integration must be connected to the database (••• →
Connections). Projects keep the order they have in `lib/portfolio.json`;
newly published ones are added at the top.

## Supabase

Apply `supabase/migrations/0001_init.sql` then `supabase/seed.sql` in the
Supabase SQL editor. Tables: `success_stories`, `team_members`,
`contact_leads`. RLS lets anon read published rows and insert leads only.

Set in `.env.local` (and in Vercel's project settings):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Without them the site still works: `/success-stories` renders the seed list
and the contact form tells visitors to email instead.

## Deploy

Push to GitHub, import the repo in Vercel, set the two env vars above, deploy.
Root directory is `kmpn-web` if the repo contains the whole working folder.

## Known gaps (from the handoff's "Open items")

- Ottroja card content is placeholder; Kandil Tires and Cairo Insulation have
  no cover images.
- The 6M EGP/month hero figure is unverified (Shopify peak was 3.14M, Jan 2026).
- No GA4 / Meta Pixel yet.
- Only the Tawheed case study has a detail page; the rest show «قريباً».
