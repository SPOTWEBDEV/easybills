import { CheckCircle2, Code2, KeyRound, Zap } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Developer API — EasyBills" };

const CAPABILITIES = [
  "Airtime & data top-ups across MTN, Airtel, Glo and 9mobile",
  "Electricity token purchases (prepaid & postpaid) for every major disco",
  "Cable TV subscription renewals (DStv, GOtv, StarTimes)",
  "WAEC & JAMB result checker and registration pins",
  "Real-time transaction status and webhooks",
];

const STEPS = [
  { title: "Request access", desc: "Tell us a bit about your business and expected volume — we'll set up a sandbox key." },
  { title: "Integrate in sandbox", desc: "Test every service against sandbox providers with no real money moving." },
  { title: "Go live", desc: "Swap in your live key once you're ready. Same endpoints, real transactions." },
];

export default function DeveloperApiPage() {
  return (
    <StaticPageShell
      eyebrow="Developer API"
      title="Bring EasyBills into your own product"
      description="A single REST API for airtime, data, electricity, cable, and exam pins — built for platforms that want to offer bill payments without becoming a VTU provider themselves."
      narrow={false}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">What you get</h2>
          <ul className="space-y-3">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {c}
              </li>
            ))}
          </ul>

          <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-ink">Getting started</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-500/40 font-display text-xs font-bold text-brand-600">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  <p className="text-sm text-ink-faint">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 shadow-card">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Code2 className="h-4 w-4 text-white/40" />
              <span className="font-mono text-xs text-white/60">purchase-airtime.sh</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-white/80">
{`curl -X POST https://api.easybills-app.top/api/v1/services/airtime/purchase \\
  -H "Authorization: Bearer $EASYBILLS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "providerId": "mtn",
    "phone": "08012345678",
    "amount": 1000
  }'`}
            </pre>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
            <div className="mb-2 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand-600" />
              <p className="font-display text-sm font-semibold text-ink">Authentication</p>
            </div>
            <p className="text-sm text-ink-faint">
              Every request is authenticated with a bearer API key over HTTPS. Sandbox and live
              keys are issued separately, so you can build and test safely before going live.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">Access is by request</p>
              <p className="text-sm text-ink-faint">
                We're onboarding integration partners individually right now.{" "}
                <a href="/contact" className="font-medium text-brand-600 hover:underline">
                  Get in touch
                </a>{" "}
                to request sandbox access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
