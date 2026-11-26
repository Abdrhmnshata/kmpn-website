"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A report page shown as is (/api/report-page/<id>). The page arrives with a
 * Content-Security-Policy sandbox header, so its scripts run in an opaque
 * origin, apart from the portal (no cookies, no access to this page). The
 * header does it rather than a sandbox attribute: some embedded browsers
 * refuse attribute-sandboxed frames outright. The page reports its height,
 * so the frame grows with it and the portal page does the scrolling.
 */
export function ReportFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      const h = Number((e.data as { kmpnReportHeight?: unknown } | null)?.kmpnReportHeight);
      if (Number.isFinite(h) && h > 100 && h < 100_000) setHeight(h);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      key={src}
      src={src}
      title={title}
      className="ops-frame"
      style={{ height }}
    />
  );
}
