import { Newspaper } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Blog — EasyBills" };

const TOPICS = [
  "Product updates & new services",
  "Money-saving tips for airtime and data",
  "How the referral and agent programs work",
  "Behind the scenes on reliability and uptime",
];

export default function BlogPage() {
  return (
    <StaticPageShell
      eyebrow="Blog"
      title="Stories, tips, and updates from EasyBills"
      description="We're just getting the blog set up. Here's what we're planning to write about first."
    >
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <Newspaper className="h-5 w-5" />
          </span>
          <p className="font-display text-base font-semibold text-ink">Coming soon</p>
        </div>
        <ul className="space-y-3">
          {TOPICS.map((topic) => (
            <li key={topic} className="flex items-start gap-2.5 text-sm text-ink-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {topic}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-ink-faint">
          In the meantime, the fastest way to hear about new services is inside the app — we send
          an in-app notification (and optionally an email) for anything worth knowing.
        </p>
      </div>
    </StaticPageShell>
  );
}
