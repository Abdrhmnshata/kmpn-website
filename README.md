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
| `/portfolio` (أعمالنا) and `/portfolio/studio`, `/portfolio/studio/[slug]`, `/portfolio/commerce`, `/portfolio/digital` | No design file; built on the site's tokens, data from Notion (see below) |

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

`/portfolio` (أعمالنا) is the work of Kampaign's three verticals, with a
page each. Every vertical reads its own database under the Notion page
**Kampaign Portfolio**:

| Vertical | Route | Notion database | Shown |
| --- | --- | --- | --- |
| كامبين استوديو | `/portfolio/studio`, `/portfolio/studio/<slug>` | KMPN Studio - Branding Case Studies - [Public] | *Status* = Done & Delivered, with a cover |
| كامبين كومرس | `/portfolio/commerce` | Kampaign Commerce Shopify Portfolio | *Project Status* = Delivered and *Status* = Active & Running (live stores) |
| كامبين ديجيتال | `/portfolio/digital` | Digital Transformation Case Studies | *Company Status* ≠ Closed |

Studio projects are a cover plus *Type*, *Market* / *Date*, *Behance Link*,
*Brand Book* and *Logo concept (anatomy)*; *Behance Publish Status* is about
Behance only and does not affect the site. Stores link to the live store;
digital cases show *Solution*, *Industry*, *Market*, *Performance*,
*Monthly record*, *ROI* and *Services*, with the page icon as the logo.
Arabic labels for Notion's options live in `lib/portfolio.ts`.

`scripts/sync-portfolio.mjs` writes `lib/portfolio.json` and the images in
`public/portfolio/<vertical>/`. Notion's file links expire within the hour,
so images are copied and converted to WebP.

**Updates are manual, by agreement.** The build never talks to Notion; the
site shows whatever is committed. To update "أعمالنا", with `NOTION_TOKEN`
in `.env.local`:

```bash
npm run sync:portfolio
```

It prints what each vertical gained or lost. Review that and the git diff,
then commit and deploy once the change is approved. Do not add
`NOTION_TOKEN` to Vercel; nothing there uses it.

The token's integration must be connected to the **Kampaign Portfolio** page
(••• → Connections). Order: studio keeps the order in `lib/portfolio.json`
with new projects on top, commerce is newest delivery year first, digital
follows the *Priority* column.

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

## Client portal (بوابة العملاء)

`/signup`, `/login` (password or a one-time code by email),
`/forgot-password`, and behind them `/portal`: اللوحة, المشاريع, الفواتير,
الدعم الفني, حسابي.

- **Accounts** are Supabase Auth users (same project as above; name,
  company and phone sit in `user_metadata`, no extra tables). Sessions are
  cookies via `@supabase/ssr`; `middleware.ts` refreshes them and guards
  `/portal`, and only runs on the portal and auth routes so the marketing
  pages stay static.
- **Data** comes live from Notion (`lib/portal/notion.ts`), with its own
  token `NOTION_PORTAL_TOKEN` (see `.env.example`):
  - a client sees a row of *KC - Master Customers* when their **confirmed**
    email is in its *Portal Emails* field; its *Active Projects* are the
    projects shown;
  - invoices: *Portal - Invoices* rows related to that customer, except
    *Draft*;
  - tickets: *Portal - Support Tickets*, matched on email; the support form
    creates a row with status *New*. The team answers in *Reply*.
  *Portal - Invoices* lives on the Notion page *Client Portal - بوابة
  العملاء*, private to the agency director (invoices and amounts), which
  also explains the workflow. *Portal - Support Tickets* sits on *Operation
  Master Page* in Account Management so the team can answer.
- The public header shows "دخول العملاء", or "أهلاً، …" from the `kp_name`
  cookie the middleware sets — no Supabase SDK on the public pages.

Supabase settings the portal relies on (Authentication in the dashboard):
email sign-ups on and *Confirm email* required; **URL Configuration** with
Site URL `https://kmpn.agency` and redirect URLs for `https://kmpn.agency/**`,
`http://localhost:3000/**` and `https://*-abdrhmnshatas-projects.vercel.app/**`
(all set on 2026-11-17).

Emails go through **Resend** SMTP (`smtp.resend.com:465`, user `resend`,
sender `KMPN Sign in <noreply@kmpn.agency>`; kmpn.agency is verified in
Resend with DNS records in GoDaddy). The templates load the Arabic logo from
`https://kmpn.agency/assets/email/kmpn-logo-ar.png` (`public/assets/email/`;
email clients do not render SVG), so it only shows once that file is live. Supabase only allows editing templates with custom
SMTP. The Arabic templates are versioned in `supabase/templates/`
(confirm sign-up, magic link / OTP, reset password) and pasted into the
dashboard; their links use `{{ .RedirectTo }}&token_hash=…&type=…` so they
sign in from any browser, and the magic-link one carries `{{ .Token }}` for
the code login. Edit the file first, then paste it into Supabase.

## Deploy

Push to GitHub, import the repo in Vercel, set the two env vars above, deploy.
Root directory is `kmpn-web` if the repo contains the whole working folder.

## Known gaps (from the handoff's "Open items")

- Ottroja card content is placeholder; Kandil Tires and Cairo Insulation have
  no cover images.
- The 6M EGP/month hero figure is unverified (Shopify peak was 3.14M, Jan 2026).
- No GA4 / Meta Pixel yet.
- Only the Tawheed case study has a detail page; the rest show «قريباً».
