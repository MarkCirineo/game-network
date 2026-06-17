import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "ArcadeKit — Instant Multiplayer Games",
    template: "%s | ArcadeKit",
  },
  description:
    "Play instant multiplayer games with friends. No downloads, no accounts. Just create a room, share the link, and start playing.",
  keywords: [
    "multiplayer games",
    "online games",
    "browser games",
    "party games",
    "play with friends",
    "instant games",
  ],
  openGraph: {
    type: "website",
    siteName: "ArcadeKit",
    title: "ArcadeKit — Instant Multiplayer Games",
    description:
      "Play instant multiplayer games with friends. No downloads, no accounts.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcadeKit — Instant Multiplayer Games",
    description:
      "Play instant multiplayer games with friends. No downloads, no accounts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        <TooltipProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Toaster position="bottom-center" richColors />
        </TooltipProvider>
        <Script
          src="https://analytics.markcirineo.com/script.js"
          data-website-id="0a833a1c-b423-449c-bcc8-347bf484e0b8"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
