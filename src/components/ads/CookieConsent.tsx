// ============================================================
// ArcadeKit — Cookie Consent Banner
// Only shown when AdSense is enabled (Umami is cookieless).
// Persists consent in localStorage so it only appears once.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "arcadekit-cookie-consent";
const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No AdSense → no ad cookies → no banner needed
    if (!adsenseId) return;

    // Already consented
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Small delay so the banner doesn't flash immediately on load
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  // Never render anything when AdSense isn't configured
  if (!adsenseId) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-surface/80 px-5 py-3.5 shadow-xl backdrop-blur-lg">
            <p className="text-sm text-text-secondary">
              We use cookies to show relevant ads and improve your experience.{" "}
              <Link
                href="/privacy"
                className="text-ember underline-offset-2 hover:text-ember/80 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            <button
              type="button"
              onClick={handleAccept}
              className="shrink-0 rounded-lg bg-ember px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-ember/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
