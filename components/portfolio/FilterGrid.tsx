"use client";

import { Fragment, useState, type ReactNode } from "react";

export type FilterChip = { key: string; label: string };
export type FilterItem = { id: string; keys: string[]; node: ReactNode };

/**
 * A grid of pre-rendered cards with optional filter chips. The cards are
 * rendered on the server and passed in, so any card type works here.
 */
export function FilterGrid({
  chips,
  items,
  label,
}: {
  chips: FilterChip[];
  items: FilterItem[];
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const list = active ? items.filter((i) => i.keys.includes(active)) : items;
  const all: { key: string | null; label: string }[] = [{ key: null, label: "الكل" }, ...chips];

  return (
    <>
      {chips.length > 0 && (
        <div role="group" aria-label={label} className="work-chips">
          {all.map((c) => (
            <button
              key={c.key ?? "all"}
              type="button"
              aria-pressed={c.key === active}
              onClick={() => setActive(c.key)}
              className="work-chip"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <section className="work-grid" aria-live="polite">
        {list.map((i) => (
          <Fragment key={i.id}>{i.node}</Fragment>
        ))}
      </section>
    </>
  );
}
