/**
 * Generates app/opengraph-image.png — the card shown when a kmpn.agency link
 * is pasted into WhatsApp, Slack, X, Facebook and the like.
 *
 * Those platforms will not render SVG, so the brand wordmark is rasterised
 * onto a 1200x630 canvas in the footer's dark treatment.
 *
 *   node scripts/make-og.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

const W = 1200;
const H = 630;
const INK = "#0b0b0b";
const CREAM = "#faf7f2";
const ACCENT = "#ee4037";

const LOGO_W = 640; // wordmark aspect is 3192.5 x 1200
const BAR_H = 10;

const logoSvg = readFileSync(
  join(ROOT, "public/assets/kmpn-logo-ar.svg"),
  "utf8",
).replace('fill="#000"', `fill="${CREAM}"`);

const logo = await sharp(Buffer.from(logoSvg))
  .resize({ width: LOGO_W })
  .png()
  .toBuffer();

const { height: logoH } = await sharp(logo).metadata();

const png = await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: INK,
  },
})
  .composite([
    {
      input: logo,
      left: Math.round((W - LOGO_W) / 2),
      top: Math.round((H - logoH) / 2) - 18,
    },
    {
      input: {
        create: {
          width: W,
          height: BAR_H,
          channels: 4,
          background: ACCENT,
        },
      },
      left: 0,
      top: H - BAR_H,
    },
  ])
  .png()
  .toBuffer();

// X reads twitter:image and does not fall back to og:image reliably, so the
// same card is written under both file conventions.
for (const name of ["opengraph-image.png", "twitter-image.png"]) {
  const out = join(ROOT, "app", name);
  writeFileSync(out, png);
  console.log(`wrote ${out} (${W}x${H}, ${(png.length / 1024).toFixed(1)} KB)`);
}

const ALT = "كامبين · حلول التحول الرقمي للمتاجر";
for (const name of ["opengraph-image.alt.txt", "twitter-image.alt.txt"]) {
  writeFileSync(join(ROOT, "app", name), ALT);
}
