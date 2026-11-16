"use client";

import { useState } from "react";
import { serviceLabel, type Project } from "@/lib/portfolio";
import { ProjectCard } from "./ProjectCard";

const ALL = "__all";

export function PortfolioGrid({
  projects,
  filters,
}: {
  projects: Project[];
  filters: string[];
}) {
  const [filter, setFilter] = useState(ALL);
  const list = filter === ALL ? projects : projects.filter((p) => p.services.includes(filter));

  const chips = [{ key: ALL, label: "الكل" }, ...filters.map((f) => ({ key: f, label: serviceLabel(f)! }))];

  return (
    <>
      {filters.length > 0 && (
        <div
          role="group"
          aria-label="تصنيف المشاريع"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            paddingBottom: 20,
            borderBottom: "1px solid var(--line)",
            marginBottom: 24,
          }}
        >
          {chips.map(({ key, label }) => {
            const active = key === filter;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className="work-chip"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <section className="work-grid" aria-live="polite">
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </section>
    </>
  );
}
