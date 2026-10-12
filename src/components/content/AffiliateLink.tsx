"use client";

// ============================================================
// ArcadeKit — Affiliate Link (Client Component)
// Amazon Associates search link with proper rel attributes and
// Umami outbound tracking. Renders nothing until
// NEXT_PUBLIC_AMAZON_TAG is set, so pages are affiliate-free
// out of the box.
// ============================================================

import { ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG;

interface AffiliateLinkProps {
  /** Amazon search query — used instead of ASINs so links never go stale */
  searchQuery: string;
  /** Product name, used for the tracking event */
  productName: string;
  children: React.ReactNode;
  className?: string;
}

export function AffiliateLink({
  searchQuery,
  productName,
  children,
  className,
}: AffiliateLinkProps) {
  if (!AMAZON_TAG) return null;

  const href = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG}`;

  const handleClick = () => {
    trackEvent("affiliate-click", { product: productName });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 font-medium text-ember transition-colors hover:text-ember/80"
      }
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
