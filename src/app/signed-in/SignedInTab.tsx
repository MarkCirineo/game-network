"use client";

import { useEffect, useState } from "react";
import { announceSignIn } from "@/lib/signInTab";

/** Tells the lobby tab about the sign-in, then offers to close this tab */
export function SignedInTab() {
  const [closeBlocked, setCloseBlocked] = useState(false);

  useEffect(() => {
    announceSignIn();
  }, []);

  function close() {
    window.close();
    // Browsers only let a page close a tab a script opened
    setTimeout(() => setCloseBlocked(true), 300);
  }

  return (
    <>
      <button
        type="button"
        onClick={close}
        className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-ember px-6 text-sm font-semibold text-white hover:bg-ember/90"
      >
        Close this tab
      </button>
      {closeBlocked && (
        <p className="mt-3 text-xs text-text-muted">
          Your browser kept this tab open. You can close it yourself.
        </p>
      )}
    </>
  );
}
