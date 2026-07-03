// ============================================================
// ArcadeKit — Contact Page
// Clean contact page with email, FAQ, and links.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  ArrowRight,
  Gamepad2,
  Clock,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the ArcadeKit team. Questions, feedback, bug reports — we'd love to hear from you. Email us at support@arcadekit.games.",
  openGraph: {
    title: "Contact Us | ArcadeKit",
    description:
      "Questions or feedback? Reach out to the ArcadeKit team at support@arcadekit.games.",
  },
};

const faqs = [
  {
    question: "Is ArcadeKit free?",
    answer:
      "Yes, completely free! All games are free to play, and there are no hidden fees, subscriptions, or in-app purchases.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "Nope. No accounts, no sign-ups, no emails. Just pick a game, create a room, share the link, and play.",
  },
  {
    question: "What devices does ArcadeKit work on?",
    answer:
      "ArcadeKit works on any device with a modern web browser — desktop, laptop, tablet, or phone. No app downloads required.",
  },
  {
    question: "How do I invite friends to play?",
    answer:
      "When you start a game, you'll get a unique room link. Share that link with your friends via text, DM, email — whatever works. They click it and they're in.",
  },
  {
    question: "I found a bug. How do I report it?",
    answer:
      "Send us an email at support@arcadekit.games with a description of what happened, what device/browser you're using, and any screenshots if possible. We'll look into it!",
  },
  {
    question: "Can I suggest a new game?",
    answer:
      "Absolutely! We love hearing game ideas. Drop us an email and let us know what you'd like to see on ArcadeKit.",
  },
];

export default function ContactPage() {
  return (
    <div className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-sm text-text-secondary">
            <MessageCircle className="h-4 w-4 text-ember" />
            We&apos;d Love to Hear From You
          </div>
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 text-text-secondary">
            Questions, feedback, game ideas, or just saying hi — we&apos;re all
            ears.
          </p>
        </div>

        {/* Contact Card */}
        <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/10">
              <Mail className="h-7 w-7 text-ember" />
            </div>
            <h2 className="font-heading text-xl font-bold md:text-2xl">
              Email Us
            </h2>
            <a
              href="mailto:support@arcadekit.games"
              className="mt-2 text-lg font-medium text-ember transition-colors hover:text-ember/80"
            >
              support@arcadekit.games
            </a>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
              <Clock className="h-4 w-4" />
              <span>We typically respond within 24–48 hours</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-elevated p-4 text-center text-sm text-text-secondary">
            <p>
              Whether it&apos;s a bug report, a game suggestion, a partnership
              inquiry, or just a friendly message — don&apos;t hesitate to reach
              out. We read every email.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/games"
            className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-surface p-4 transition-all hover:border-white/10 hover:bg-elevated"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/10">
              <Gamepad2 className="h-5 w-5 text-ember" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold group-hover:text-ember transition-colors">
                Browse Games
              </h3>
              <p className="text-xs text-text-muted">
                Check out all available games
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
          </Link>
          <Link
            href="/about"
            className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-surface p-4 transition-all hover:border-white/10 hover:bg-elevated"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember/10">
              <HelpCircle className="h-5 w-5 text-ember" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold group-hover:text-ember transition-colors">
                About ArcadeKit
              </h3>
              <p className="text-xs text-text-muted">
                Learn more about the platform
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-white/5 bg-surface p-6 md:p-8">
          <h2 className="mb-6 font-heading text-xl font-bold md:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="border-b border-white/5 pb-5 last:border-0 last:pb-0"
              >
                <h3 className="font-heading text-sm font-bold text-text-primary md:text-base">
                  {faq.question}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
