import { mayViewCustomers } from "@/lib/portal/viewer";
import { reportClient } from "@/lib/reports/clients";
import { MEDIA_PATH, artifactFileUrl } from "@/lib/reports/creative";

/**
 * Covers and videos of a client's creative report (lib/reports/creative.ts),
 * for that client's signed-in account and the director only, so the
 * artifact's address never reaches the browser.
 *
 * The artifact host ignores Range requests, and Safari plays a video only
 * from 206 answers, so videos go out here in slices (each well under
 * Vercel's 4.5 MB response limit).
 */

const CHUNK = 2 * 1024 * 1024;
const notFound = () => new Response("Not found", { status: 404 });

const mayView = (slug: string) => mayViewCustomers(reportClient(slug)?.customerIds ?? []);

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; path: string[] }> }) {
  const { slug, path } = await params;
  const file = path.join("/");
  if (!MEDIA_PATH.test(file) || !(await mayView(slug))) return notFound();
  const url = artifactFileUrl(slug, file);
  if (!url) return notFound();

  const video = file.startsWith("media/v/");
  const upstream = await fetch(url, video ? { cache: "no-store" } : { next: { revalidate: 86400 } });
  if (!upstream.ok) return upstream.status === 404 ? notFound() : new Response("Bad gateway", { status: 502 });

  if (!video) {
    return new Response(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "private, max-age=86400",
      },
    });
  }

  const body = new Uint8Array(await upstream.arrayBuffer());
  const size = body.length;
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "bytes=0-");
  let start = 0;
  let end = size - 1;
  if (m?.[1]) {
    start = Number(m[1]);
    if (m[2]) end = Number(m[2]);
  } else if (m?.[2]) {
    start = Math.max(0, size - Number(m[2])); // "bytes=-500": the last 500 bytes
  }
  end = Math.min(end, start + CHUNK - 1, size - 1);
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
  }
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      "content-type": "video/mp4",
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-length": String(end - start + 1),
      "accept-ranges": "bytes",
      "cache-control": "private, max-age=86400",
    },
  });
}
