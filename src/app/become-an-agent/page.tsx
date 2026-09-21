import { Clock, UserCog } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Become an Agent — EasyBills" };

export default function BecomeAnAgentPage() {
  return (
    <StaticPageShell
      eyebrow="Agent Program"
      title="Become an EasyBills Agent"
      description="Sell airtime, data, electricity and cable subscriptions to your community and earn a tracked commission on every sale."
    >
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-600">
          <UserCog className="h-6 w-6" />
        </span>
        <p className="mb-1 font-display text-xl font-semibold text-ink">Agent registration is coming soon</p>
        <p className="max-w-sm text-sm text-ink-faint">
          We're putting the finishing touches on agent onboarding. Check back soon, or fund your
          wallet and get started as a regular customer in the meantime.
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted">
          <Clock className="h-3.5 w-3.5" />
          Launching soon
        </span>
      </div>
    </StaticPageShell>
  );
}
