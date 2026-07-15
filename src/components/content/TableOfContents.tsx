"use client";

// ============================================================
// ArcadeKit — Table of Contents (Client Component)
// Sticky sidebar on desktop, collapsible dropdown on mobile.
// Highlights the section currently in view.
// ============================================================

import { useEffect, useState } from "react";
import { List } from "lucide-react";

export interface TocItem {
  id: string;
  title: string;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      // Trigger when a section heading crosses the upper third of the viewport
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Keep the URL hash in sync without a jump
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const linkList = (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
              activeId === item.id
                ? "bg-ember/10 font-medium text-ember"
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
            }`}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible dropdown */}
      <details className="mb-6 rounded-2xl border border-white/5 bg-surface lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
          <List className="h-4 w-4 text-ember" />
          On this page
        </summary>
        <div className="border-t border-white/5 p-2">{linkList}</div>
      </details>

      {/* Desktop: sticky sidebar */}
      <nav
        aria-label="Table of contents"
        className="hidden lg:sticky lg:top-24 lg:block"
      >
        <p className="mb-3 px-3 font-heading text-xs font-bold uppercase tracking-wider text-text-muted">
          On this page
        </p>
        {linkList}
      </nav>
    </>
  );
}
