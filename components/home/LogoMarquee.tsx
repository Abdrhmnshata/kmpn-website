import { CLIENTS } from "@/lib/content";

/**
 * Section "02 Clients": the client logos in a rounded card, drifting left in
 * an endless loop. The set is rendered twice so the loop has no seam; the
 * copy is hidden from screen readers. Pauses on hover, and stands still as a
 * wrapped row for people who ask for reduced motion.
 *
 * Every logo gets the same visual area: --sq is the square root of its
 * aspect ratio, so a wide wordmark comes out wider and shorter and a square
 * mark taller and narrower, and they read as the same size.
 */
export function LogoMarquee({ title }: { title: string }) {
  const set = (copy: boolean) => (
    <div className="marquee-set" aria-hidden={copy || undefined}>
      {CLIENTS.map((c) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={c.name}
          src={c.src}
          width={c.w}
          height={c.h}
          alt={copy ? "" : c.name}
          className="marquee-logo"
          draggable={false}
          style={{ "--sq": Math.sqrt(c.w / c.h).toFixed(3) } as React.CSSProperties}
        />
      ))}
    </div>
  );

  return (
    <section className="logo-card" aria-labelledby="clients-title">
      <h2 id="clients-title" className="logo-card-title">
        {title}
      </h2>
      <div className="marquee">
        <div className="marquee-track">
          {set(false)}
          {set(true)}
        </div>
      </div>
    </section>
  );
}
