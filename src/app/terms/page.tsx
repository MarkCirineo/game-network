// ============================================================
// ArcadeKit — Terms of Service Page
// Comprehensive ToS for AdSense compliance.
// ============================================================

import type { Metadata } from "next";
import {
  FileText,
  CheckCircle,
  Gamepad2,
  UserCheck,
  Scale,
  AlertTriangle,
  ShieldAlert,
  Link2,
  ExternalLink,
  RefreshCw,
  Mail,
  ShoppingBag,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for ArcadeKit. Read about acceptable use, intellectual property, disclaimers, and your rights when using our free multiplayer gaming platform.",
  openGraph: {
    title: "Terms of Service | ArcadeKit",
    description:
      "Terms governing your use of ArcadeKit's free multiplayer browser games.",
  },
};

const sections = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "description", label: "2. Description of Service" },
  { id: "purchases", label: "3. Purchases and Refunds" },
  { id: "user-conduct", label: "4. User Conduct" },
  { id: "intellectual-property", label: "5. Intellectual Property" },
  { id: "disclaimers", label: "6. Disclaimers" },
  { id: "limitation-of-liability", label: "7. Limitation of Liability" },
  { id: "affiliate-links", label: "8. Affiliate Links Disclosure" },
  { id: "external-links", label: "9. External Links" },
  { id: "termination", label: "10. Termination" },
  { id: "changes", label: "11. Changes to Terms" },
  { id: "governing-law", label: "12. Governing Law" },
  { id: "contact", label: "13. Contact Us" },
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

export default function TermsPage() {
  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            <FileText className="h-4 w-4 text-ember" />
            Legal
          </div>
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-text-muted text-sm">
            Last updated: October 21, 2026
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
          {/* 1. Acceptance */}
          <SectionCard id="acceptance" icon={CheckCircle} title="1. Acceptance of Terms">
            <p>
              By accessing or using ArcadeKit (&quot;the Service&quot;), available at{" "}
              <a
                href="https://arcadekit.games"
                className="text-ember hover:text-ember/80"
              >
                arcadekit.games
              </a>
              , you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to these Terms, please do
              not use the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or
              use ArcadeKit. You do not need to create an account to use the
              Service — by simply visiting the site and playing games, you agree
              to these Terms. If you create an optional account, these Terms
              also cover your account and username.
            </p>
          </SectionCard>

          {/* 2. Description of Service */}
          <SectionCard id="description" icon={Gamepad2} title="2. Description of Service">
            <p>
              ArcadeKit is a free, browser-based multiplayer gaming platform.
              The Service allows users to:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Play multiplayer games directly in their web browser</li>
              <li>Create game rooms and invite others via shareable links</li>
              <li>Play every game without creating an account or paying</li>
              <li>
                Optionally buy extras, such as board packs for Rule Out (see{" "}
                <a href="#purchases" className="text-ember hover:text-ember/80">
                  Purchases and Refunds
                </a>
                )
              </li>
              <li>
                Optionally create an account (13 or older only) with a public
                username
              </li>
            </ul>
            <p>
              <strong className="text-text-primary">Accounts.</strong> You must
              be 13 or older to create an account. Keep your sign-in methods
              secure, and use one account per person. You can delete your
              account at any time from your account page. Your username is
              public: other players can see it.
            </p>
            <p>
              Every game is free to play. Some optional extras cost money.
              We reserve the right to modify, suspend, or discontinue any part
              of the Service at any time without prior notice.
            </p>
          </SectionCard>

          {/* 3. Purchases and Refunds */}
          <SectionCard id="purchases" icon={ShoppingBag} title="3. Purchases and Refunds">
            <p>
              <strong className="text-text-primary">What you can buy.</strong>{" "}
              Some extras, such as themed board packs for Rule Out, can be
              bought with an account. A purchase unlocks the content on your
              account, on any device you sign in on. It&apos;s a one-time
              payment, not a subscription. Only the person hosting a game
              needs a pack: everyone who joins their room plays it with them.
            </p>
            <p>
              <strong className="text-text-primary">Who sells it.</strong>{" "}
              Purchases are sold through Link, Stripe&apos;s merchant of record
              service. Link is the seller for the transaction: it takes the
              payment, adds sales tax or VAT where it applies, and sends your
              receipt. Its terms, shown at checkout, apply to the payment.
              Prices are shown in US dollars before tax.
            </p>
            <p>
              <strong className="text-text-primary">Ages.</strong> If
              you&apos;re under 18, ask a parent or guardian before buying
              anything.
            </p>
            <p>
              <strong className="text-text-primary">Refunds.</strong> If
              you&apos;re not happy with a purchase, email{" "}
              <a
                href="mailto:support@arcadekit.games"
                className="text-ember hover:text-ember/80"
              >
                support@arcadekit.games
              </a>{" "}
              within 14 days of buying it and we&apos;ll refund it. You can
              also ask through the support link on your Link receipt. A
              refunded purchase is removed from your account. This doesn&apos;t
              limit any rights you have under the consumer laws where you live.
            </p>
            <p>
              <strong className="text-text-primary">If your account goes.</strong>{" "}
              Purchases belong to the account that made them and can&apos;t be
              moved to another account. Deleting your account removes them,
              and so does a payment that&apos;s charged back.
            </p>
          </SectionCard>

          {/* 4. User Conduct */}
          <SectionCard id="user-conduct" icon={UserCheck} title="4. User Conduct">
            <p>When using ArcadeKit, you agree not to:</p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>
                <strong className="text-text-primary">Cheat or exploit</strong>{" "}
                — Use bots, scripts, hacks, or any automated means to gain an
                unfair advantage in games
              </li>
              <li>
                <strong className="text-text-primary">Harass others</strong>{" "}
                — Engage in abusive, threatening, or harassing behavior toward
                other players
              </li>
              <li>
                <strong className="text-text-primary">Use the Service illegally</strong>{" "}
                — Use ArcadeKit for any purpose that is unlawful or prohibited
                by these Terms
              </li>
              <li>
                <strong className="text-text-primary">Interfere with the Service</strong>{" "}
                — Attempt to disrupt, overload, or impair the functioning of our
                servers, network, or infrastructure
              </li>
              <li>
                <strong className="text-text-primary">Use an inappropriate username</strong>{" "}
                — Pick a username that is offensive, hateful, or sexual,
                pretends to be someone else (including ArcadeKit staff), or
                contains another person&apos;s real name or personal
                information
              </li>
              <li>
                <strong className="text-text-primary">Reverse engineer</strong>{" "}
                — Attempt to decompile, reverse engineer, or extract the source
                code of the Service for commercial purposes
              </li>
            </ul>
            <p>
              We reserve the right to restrict access to anyone who violates
              these guidelines, and to change any username that breaks them.
            </p>
          </SectionCard>

          {/* 5. Intellectual Property */}
          <SectionCard id="intellectual-property" icon={Scale} title="5. Intellectual Property">
            <p>
              The ArcadeKit platform, including its design, code, graphics,
              game implementations, logos, and branding, is owned by ArcadeKit
              and protected by applicable intellectual property laws.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable license
              to access and use the Service for personal, non-commercial
              entertainment purposes. This license does not include the right
              to:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Copy, modify, or distribute any part of the Service</li>
              <li>Use ArcadeKit&apos;s branding or content for commercial purposes</li>
              <li>Create derivative works based on the Service</li>
            </ul>
          </SectionCard>

          {/* 6. Disclaimers */}
          <SectionCard id="disclaimers" icon={AlertTriangle} title="6. Disclaimers">
            <p>
              <strong className="text-text-primary">
                The Service is provided &quot;as is&quot; and &quot;as
                available&quot;
              </strong>{" "}
              without warranties of any kind, either express or implied,
              including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
            <p>ArcadeKit does not warrant that:</p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from the Service will be accurate or reliable</li>
              <li>Any defects in the Service will be corrected</li>
            </ul>
            <p>
              You use ArcadeKit at your own risk. We make
              no guarantees about uptime or availability.
            </p>
          </SectionCard>

          {/* 7. Limitation of Liability */}
          <SectionCard id="limitation-of-liability" icon={ShieldAlert} title="7. Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, ArcadeKit and
              its operators shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of
              profits or revenues, whether incurred directly or indirectly, or
              any loss of data, use, goodwill, or other intangible losses
              resulting from:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Your use of or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of the Service</li>
              <li>Any bugs, viruses, or similar issues transmitted through the Service</li>
            </ul>
            <p>
              Our total liability to you for any claims is limited to the
              amount you paid for purchases in the 12 months before the claim,
              or zero dollars ($0) if you haven&apos;t bought anything.
            </p>
          </SectionCard>

          {/* 8. Affiliate Links */}
          <SectionCard id="affiliate-links" icon={Link2} title="8. Affiliate Links Disclosure">
            <p>
              ArcadeKit may contain affiliate links to third-party products or
              services. This means that if you click on a link and make a
              purchase, we may receive a small commission at no additional cost
              to you.
            </p>
            <p>
              Affiliate links will always be clearly disclosed. We only link to
              products and services that we believe may be genuinely useful or
              interesting to our users. Affiliate relationships do not influence
              our game content or recommendations.
            </p>
            <p>
              We may participate in affiliate programs including, but not
              limited to, the Amazon Associates Program.
            </p>
          </SectionCard>

          {/* 9. External Links */}
          <SectionCard id="external-links" icon={ExternalLink} title="9. External Links">
            <p>
              ArcadeKit may contain links to third-party websites or services
              that are not owned or controlled by ArcadeKit. This includes
              partner games, affiliate links, and other external resources.
            </p>
            <p>
              We have no control over and assume no responsibility for the
              content, privacy policies, or practices of any third-party
              websites or services. We encourage you to review the terms and
              privacy policies of any third-party sites you visit.
            </p>
          </SectionCard>

          {/* 10. Termination */}
          <SectionCard id="termination" icon={AlertTriangle} title="10. Termination">
            <p>
              We reserve the right to restrict or terminate your access to the
              Service at any time, without prior notice, for any reason,
              including but not limited to a breach of these Terms.
            </p>
            <p>
              For players without an account, this typically means blocking
              access from a specific IP address or network. For accounts, it
              can mean suspending or deleting the account. All
              provisions of these Terms that by their nature should survive
              termination shall survive, including intellectual property
              provisions, disclaimers, and limitations of liability.
            </p>
          </SectionCard>

          {/* 11. Changes */}
          <SectionCard id="changes" icon={RefreshCw} title="11. Changes to Terms">
            <p>
              We reserve the right to modify or replace these Terms at any time.
              When we make changes, we will update the &quot;Last updated&quot;
              date at the top of this page.
            </p>
            <p>
              Your continued use of the Service after any changes constitutes
              acceptance of the new Terms. We encourage you to review these
              Terms periodically.
            </p>
          </SectionCard>

          {/* 12. Governing Law */}
          <SectionCard id="governing-law" icon={Scale} title="12. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the United States, without regard to conflict of law
              principles.
            </p>
            <p>
              Any disputes arising from these Terms or your use of the Service
              shall be resolved through good-faith negotiation first. If
              negotiation fails, disputes shall be subject to the exclusive
              jurisdiction of the courts in the applicable jurisdiction.
            </p>
          </SectionCard>

          {/* 13. Contact */}
          <SectionCard id="contact" icon={Mail} title="13. Contact Us">
            <p>
              If you have any questions about these Terms of Service, please
              contact us:
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
