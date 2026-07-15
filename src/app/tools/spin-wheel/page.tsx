// ============================================================
// ArcadeKit — Spin Wheel Tool (Server wrapper)
// SEO metadata + renders client component.
// ============================================================

import type { Metadata } from "next";
import SpinWheel from "./SpinWheel";

export const metadata: Metadata = {
  title: "Spin Wheel — Free Online Random Spinner",
  description:
    "Free online spinner wheel random picker. Customize options, spin the wheel, and let fate decide. Perfect for games, decisions, giveaways, and classroom activities. No sign-up required.",
  keywords: [
    "free online spinner wheel",
    "random picker",
    "spin the wheel",
    "wheel of fortune",
    "random decision maker",
    "spinner wheel game",
  ],
  openGraph: {
    title: "Spin Wheel — Free Online Random Spinner | ArcadeKit",
    description:
      "Customize your spinner wheel with any options and spin to decide. Free, instant, no sign-up.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spin Wheel — Free Online Random Spinner | ArcadeKit",
    description:
      "Customize your spinner wheel with any options and spin to decide. Free, instant, no sign-up.",
  },
};

export default function SpinWheelPage() {
  return <SpinWheel />;
}
