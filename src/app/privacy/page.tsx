// ============================================================
// ArcadeKit — Privacy Policy Page
// Comprehensive privacy policy for AdSense compliance.
// ============================================================

import type { Metadata } from "next";
import { Shield, Eye, Cookie, Server, Baby, Database, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ArcadeKit's privacy policy. Learn how we handle your data — spoiler: we collect almost nothing. No accounts, no personal data, privacy-friendly analytics.",
  openGraph: {
    title: "Privacy Policy | ArcadeKit",
    description:
      "Learn how ArcadeKit handles your data. We use privacy-friendly analytics and collect no personal information.",
  },
};

const sections = [
  { id: "introduction", label: "1. Introduction" },
  { id: "data-we-collect", label: "2. Data We Collect" },
  { id: "cookies", label: "3. Cookies" },
  { id: "third-party-services", label: "4. Third-Party Services" },
  { id: "childrens-privacy", label: "5. Children's Privacy" },
  { id: "data-retention", label: "6. Data Retention" },
  { id: "your-rights", label: "7. Your Rights" },
  { id: "changes", label: "8. Changes to This Policy" },
  { id: "contact", label: "9. Contact Us" },
];

function SectionCard({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 rounded-2xl border border-white/5 bg-surface p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember/10">
          <Icon className="h-4.5 w-4.5 text-ember" />
        </div>
        <h2 className="font-heading text-xl font-bold md:text-2xl">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-text-secondary md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            <Shield className="h-4 w-4 text-ember" />
            Your Privacy Matters
          </div>
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            Last updated: July 1, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="mb-8 rounded-2xl border border-white/5 bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Table of Contents
          </h2>
          <ol className="grid gap-1.5 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-text-secondary transition-colors hover:text-ember"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-6">
          {/* 1. Introduction */}
          <SectionCard id="introduction" icon={Shield} title="1. Introduction">
            <p>
              Welcome to ArcadeKit (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). ArcadeKit is a free, browser-based multiplayer
              gaming platform accessible at{" "}
              <a
                href="https://arcadekit.games"
                className="text-ember hover:text-ember/80"
              >
                arcadekit.games
              </a>
              .
            </p>
            <p>
              We take your privacy seriously. This Privacy Policy explains what
              information we collect, how we use it, and what choices you have.
              The short version: <strong className="text-text-primary">we collect almost nothing.</strong>{" "}
              There are no accounts, no personal data collection, and no
              tracking cookies from our side.
            </p>
          </SectionCard>

          {/* 2. Data We Collect */}
          <SectionCard id="data-we-collect" icon={Eye} title="2. Data We Collect">
            <p>
              <strong className="text-text-primary">We do not collect personal information.</strong>{" "}
              ArcadeKit does not require you to create an account, provide an
              email address, or share any personal details to use our platform.
            </p>
            <p>We collect the following anonymous, aggregated data:</p>
            <ul className="ml-4 list-disc space-y-1.5 text-text-secondary">
              <li>
                <strong className="text-text-primary">Anonymous analytics</strong>{" "}
                — We use Umami Analytics, a privacy-friendly, cookieless
                analytics tool. Umami collects aggregate data like page views,
                referrer sources, browser type, and country-level location. No
                personally identifiable information (PII) is ever collected or
                stored.
              </li>
              <li>
                <strong className="text-text-primary">Game state data</strong>{" "}
                — When you play a game, temporary game state (moves, scores) is
                held in memory on our servers for the duration of the session.
                This data is not stored permanently and is deleted when the game
                room closes.
              </li>
            </ul>
          </SectionCard>

          {/* 3. Cookies */}
          <SectionCard id="cookies" icon={Cookie} title="3. Cookies">
            <p>
              <strong className="text-text-primary">Umami Analytics is completely cookieless.</strong>{" "}
              We do not set any first-party tracking cookies.
            </p>
            <p>
              Third-party services on our platform may use cookies to serve
              personalized or contextual ads. Specifically:
            </p>
            <ul className="ml-4 list-disc space-y-1.5 text-text-secondary">
              <li>
                <strong className="text-text-primary">Google AdSense</strong>{" "}
                — Google uses cookies (including the DoubleClick cookie) to
                serve ads based on your visit to ArcadeKit and other websites.
                You can opt out of personalized advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ember hover:text-ember/80"
                >
                  Google Ads Settings
                </a>
                .
              </li>
            </ul>
            <p>
              You can also disable cookies in your browser settings at any time.
              ArcadeKit will continue to function normally without cookies.
            </p>
          </SectionCard>

          {/* 4. Third-Party Services */}
          <SectionCard id="third-party-services" icon={Server} title="4. Third-Party Services">
            <p>We use the following third-party services:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-2 pr-4 font-semibold text-text-primary">Service</th>
                    <th className="pb-2 pr-4 font-semibold text-text-primary">Purpose</th>
                    <th className="pb-2 font-semibold text-text-primary">Data Collected</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-white/5">
                    <td className="py-2.5 pr-4">Umami Analytics</td>
                    <td className="py-2.5 pr-4">Privacy-friendly website analytics</td>
                    <td className="py-2.5">Anonymous page views, no PII</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2.5 pr-4">Google AdSense</td>
                    <td className="py-2.5 pr-4">Advertising</td>
                    <td className="py-2.5">Cookies for ad personalization</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4">Amazon Associates</td>
                    <td className="py-2.5 pr-4">Affiliate product links</td>
                    <td className="py-2.5">Standard affiliate link tracking</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Each third-party service operates under its own privacy policy. We
              encourage you to review their policies for details on how they
              handle your data.
            </p>
          </SectionCard>

          {/* 5. Children's Privacy */}
          <SectionCard id="childrens-privacy" icon={Baby} title="5. Children's Privacy">
            <p>
              ArcadeKit does not knowingly collect personal information from
              children under the age of 13. Our platform does not require
              account creation or the submission of any personal data, so we do
              not intentionally collect information from any users, including
              children.
            </p>
            <p>
              If you believe that a child under 13 has somehow provided us with
              personal information, please contact us at{" "}
              <a
                href="mailto:support@arcadekit.games"
                className="text-ember hover:text-ember/80"
              >
                support@arcadekit.games
              </a>{" "}
              and we will take steps to remove that information.
            </p>
            <p>
              This policy is in compliance with the Children&apos;s Online Privacy
              Protection Act (COPPA).
            </p>
          </SectionCard>

          {/* 6. Data Retention */}
          <SectionCard id="data-retention" icon={Database} title="6. Data Retention">
            <p>
              <strong className="text-text-primary">We do not store personal data.</strong>{" "}
              Since we don&apos;t collect personal information, there is nothing
              to retain.
            </p>
            <p>
              Temporary game session data (moves, scores, room state) exists
              only in server memory during active game sessions and is
              automatically discarded when the session ends.
            </p>
            <p>
              Aggregate analytics data from Umami is retained for the purpose of
              understanding site usage trends. This data is anonymous and cannot
              be used to identify individual users.
            </p>
          </SectionCard>

          {/* 7. Your Rights */}
          <SectionCard id="your-rights" icon={Shield} title="7. Your Rights">
            <p>
              Because we do not collect or store personal data, traditional data
              rights requests (access, deletion, portability) are not applicable
              in most cases. There is simply no personal data to access or
              delete.
            </p>
            <p>
              If you have concerns about data collected by third-party services
              (such as Google AdSense), we recommend contacting those services
              directly or adjusting your browser&apos;s cookie and privacy
              settings.
            </p>
            <p>
              For any privacy-related questions, you can always reach us at{" "}
              <a
                href="mailto:support@arcadekit.games"
                className="text-ember hover:text-ember/80"
              >
                support@arcadekit.games
              </a>
              .
            </p>
          </SectionCard>

          {/* 8. Changes */}
          <SectionCard id="changes" icon={Eye} title="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or in applicable laws. When we make
              changes, we will update the &quot;Last updated&quot; date at the
              top of this page.
            </p>
            <p>
              We encourage you to review this policy periodically. Your
              continued use of ArcadeKit after changes are posted constitutes
              your acceptance of the updated policy.
            </p>
          </SectionCard>

          {/* 9. Contact */}
          <SectionCard id="contact" icon={Mail} title="9. Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact us:
            </p>
            <div className="mt-2 rounded-xl bg-elevated p-4">
              <p className="font-medium text-text-primary">ArcadeKit</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@arcadekit.games"
                  className="text-ember hover:text-ember/80"
                >
                  support@arcadekit.games
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://arcadekit.games"
                  className="text-ember hover:text-ember/80"
                >
                  arcadekit.games
                </a>
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
