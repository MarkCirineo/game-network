// ============================================================
// ArcadeKit — Privacy Policy Page
// Comprehensive privacy policy for AdSense compliance.
// ============================================================

import type { Metadata } from "next";
import { Shield, Eye, Cookie, Server, Baby, Database, Mail, UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ArcadeKit's privacy policy. Accounts are optional: without one we collect no personal data. Here's exactly what we store if you make an account.",
  openGraph: {
    title: "Privacy Policy | ArcadeKit",
    description:
      "Learn how ArcadeKit handles your data. Accounts are optional, analytics are privacy-friendly, and we never store real names or photos.",
  },
};

const sections = [
  { id: "introduction", label: "1. Introduction" },
  { id: "data-we-collect", label: "2. Data We Collect" },
  { id: "accounts", label: "3. Accounts" },
  { id: "cookies", label: "4. Cookies" },
  { id: "third-party-services", label: "5. Third-Party Services" },
  { id: "childrens-privacy", label: "6. Children's Privacy" },
  { id: "data-retention", label: "7. Data Retention" },
  { id: "your-rights", label: "8. Your Rights" },
  { id: "changes", label: "9. Changes to This Policy" },
  { id: "contact", label: "10. Contact Us" },
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
            Last updated: October 13, 2026
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
              The short version: <strong className="text-text-primary">accounts are optional, and without one we collect no personal data.</strong>{" "}
              Every game works without an account. If you do make one, we store
              only what&apos;s needed to sign you in and show your username,
              and we never store your real name or photo. We don&apos;t use
              tracking cookies.
            </p>
          </SectionCard>

          {/* 2. Data We Collect */}
          <SectionCard id="data-we-collect" icon={Eye} title="2. Data We Collect">
            <p>
              <strong className="text-text-primary">Without an account, we don&apos;t collect personal information.</strong>{" "}
              ArcadeKit does not require you to create an account, provide an
              email address, or share any personal details to play. If you
              choose to make an account, see{" "}
              <a href="#accounts" className="text-ember hover:text-ember/80">Accounts</a>{" "}
              for exactly what we store.
            </p>
            <p>For everyone, we collect the following anonymous, aggregated data:</p>
            <ul className="ml-4 list-disc space-y-1.5 text-text-secondary">
              <li>
                <strong className="text-text-primary">Anonymous analytics</strong>{" "}
                — We use Umami Analytics, a privacy-friendly, cookieless
                analytics tool. Umami collects aggregate data like page views,
                referrer sources, browser type, and country-level location,
                plus anonymous usage counts such as which games are started
                and finished, how many players took part, the game settings
                chosen, and which buttons and tools are used. Player names,
                room codes, and anything you type are never sent. No
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
              <li>
                <strong className="text-text-primary">Feedback you choose to send</strong>{" "}
                — If you use the Feedback form, we receive your message, the
                type you picked (bug, idea, or other), the page you sent it
                from, the game and room code if you were in a game, your
                browser type, and your screen size. The form doesn&apos;t ask
                for your name, email, or an account, and it isn&apos;t linked
                to you. Please don&apos;t include personal information in your
                message.
              </li>
            </ul>
          </SectionCard>

          {/* 3. Accounts */}
          <SectionCard id="accounts" icon={UserRound} title="3. Accounts">
            <p>
              Accounts are optional and only for people 13 or older. You can
              sign in with Google, with a code we email you, or with an email
              and password. If you make an account, we store:
            </p>
            <ul className="ml-4 list-disc space-y-1.5 text-text-secondary">
              <li>
                <strong className="text-text-primary">Your email address</strong>{" "}
                — used only to sign you in and to send account emails (sign-in
                codes, password resets, and delete confirmations). It&apos;s
                never shown to other players.
              </li>
              <li>
                <strong className="text-text-primary">Your username</strong>{" "}
                — the name you pick. Other players can see it.
              </li>
              <li>
                <strong className="text-text-primary">How you sign in</strong>{" "}
                — if you use Google, the ID Google gives your account (we ask
                Google only for your email address, and we don&apos;t store your
                name, photo, or Google sign-in tokens). If you set a password,
                we store a hashed version, never the password itself.
              </li>
              <li>
                <strong className="text-text-primary">Sign-in sessions</strong>{" "}
                — for each device you&apos;re signed in on: when the session
                started and expires, the IP address, and the browser type. This
                is how we keep you signed in and spot misuse.
              </li>
              <li>
                <strong className="text-text-primary">Sign-in codes</strong>{" "}
                — kept until they&apos;re used or expire (5 minutes).
              </li>
              <li>
                <strong className="text-text-primary">When you confirmed you&apos;re 13 or older</strong>,
                and when your account was created and last changed.
              </li>
            </ul>
            <p>
              We don&apos;t sell this information or use it for advertising.
              It&apos;s stored in our own database on our server.
            </p>
          </SectionCard>

          {/* 4. Cookies */}
          <SectionCard id="cookies" icon={Cookie} title="4. Cookies">
            <p>
              <strong className="text-text-primary">Umami Analytics is completely cookieless.</strong>{" "}
              We do not set any tracking cookies.
            </p>
            <p>
              If you sign in, we set cookies that keep you signed in (they last
              up to 30 days). While you&apos;re on the sign-in page, ticking
              the &quot;13 or older&quot; box sets a short cookie (one hour)
              that records it. These are needed for accounts to work, and
              they&apos;re not used for tracking.
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

          {/* 5. Third-Party Services */}
          <SectionCard id="third-party-services" icon={Server} title="5. Third-Party Services">
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
                    <td className="py-2.5">Anonymous page views and usage counts, no PII</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2.5 pr-4">Google AdSense</td>
                    <td className="py-2.5 pr-4">Advertising</td>
                    <td className="py-2.5">Cookies for ad personalization</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2.5 pr-4">Google Sign-In</td>
                    <td className="py-2.5 pr-4">Optional way to sign in</td>
                    <td className="py-2.5">Your email address and Google account ID, only if you choose it</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2.5 pr-4">Resend</td>
                    <td className="py-2.5 pr-4">Sends account emails (sign-in codes, password resets)</td>
                    <td className="py-2.5">Your email address and the email we send, only if you have an account</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2.5 pr-4">Discord</td>
                    <td className="py-2.5 pr-4">Delivers Feedback form messages to a private channel</td>
                    <td className="py-2.5">Only what you send in the Feedback form</td>
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

          {/* 6. Children's Privacy */}
          <SectionCard id="childrens-privacy" icon={Baby} title="6. Children's Privacy">
            <p>
              ArcadeKit does not knowingly collect personal information from
              children under the age of 13. Anyone can play without an
              account, and playing without one collects no personal data.
              Accounts are only for people 13 or older, and everyone confirms
              their age before making one.
            </p>
            <p>
              If we learn that an account belongs to someone under 13, we
              delete it.
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

          {/* 7. Data Retention */}
          <SectionCard id="data-retention" icon={Database} title="7. Data Retention">
            <p>
              <strong className="text-text-primary">Without an account, we store no personal data.</strong>
            </p>
            <p>
              If you have an account, we keep its information until you delete
              the account. Deleting it removes your account, username, sign-in
              methods, and sessions right away. Sessions you stop using expire
              after 30 days.
            </p>
            <p>
              Temporary game session data (moves, scores, room state) exists
              only in server memory during active game sessions and is
              automatically discarded when the session ends.
            </p>
            <p>
              Feedback form messages are kept in a private Discord channel so
              we can follow up on bugs and ideas. If you&apos;d like a message
              you sent removed, email us with roughly when you sent it and
              what it said.
            </p>
            <p>
              Aggregate analytics data from Umami is retained for the purpose of
              understanding site usage trends. This data is anonymous and cannot
              be used to identify individual users.
            </p>
          </SectionCard>

          {/* 8. Your Rights */}
          <SectionCard id="your-rights" icon={Shield} title="8. Your Rights">
            <p>
              Without an account, there is no personal data to access or
              delete.
            </p>
            <p>
              If you have an account, your account page shows your username,
              email, and how you sign in, and you can delete the account there
              at any time. For a copy of your account data, or if you
              can&apos;t sign in and want your account deleted, email us from
              the address on the account.
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

          {/* 9. Changes */}
          <SectionCard id="changes" icon={Eye} title="9. Changes to This Policy">
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

          {/* 10. Contact */}
          <SectionCard id="contact" icon={Mail} title="10. Contact Us">
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
