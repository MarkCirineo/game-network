// ============================================================
// ArcadeKit — Breadcrumbs (Server Component)
// Visual breadcrumb trail. Pair with BreadcrumbList JSON-LD
// emitted by the page itself.
// ============================================================

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  /** Omit href for the current page (rendered as plain text) */
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-text-secondary transition-colors hover:text-text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
