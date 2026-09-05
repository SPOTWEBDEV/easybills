import { CheckCircle2 } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Refund Policy — EasyBills" };

const AUTO_REFUND_CASES = [
  "Airtime, data, electricity, or cable purchase fails on the provider's end",
  "A purchase can't be completed after your wallet has already been debited",
];

const NOT_REFUNDABLE = [
  "A successfully delivered purchase (e.g. airtime that was sent to the correct number)",
  "A purchase sent to the wrong number, meter, or smartcard because the details were entered incorrectly — this is why we show a name/address confirmation before electricity and cable purchases; please check it carefully",
];

export default function RefundPolicyPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Refund Policy"
      description="Most refund situations are handled automatically — here's exactly how it works."
    >
      <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-3 font-display text-base font-semibold text-ink">Automatic refunds</h2>
        <p className="mb-4 text-sm text-ink-muted">
          If a purchase fails because of an issue on the provider's side, your wallet is refunded
          automatically — there's no need to open a support ticket or wait for manual review.
          This covers:
        </p>
        <ul className="space-y-2.5">
          {AUTO_REFUND_CASES.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-sm text-ink-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 font-display text-base font-semibold text-ink">What isn't refundable</h2>
        <ul className="space-y-2.5">
          {NOT_REFUNDABLE.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-sm text-ink-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 font-display text-base font-semibold text-ink">Wallet funding</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          Wallet funding is processed by Paystack. If you're charged but your wallet balance
          doesn't reflect it after a few minutes, contact us with your payment reference and
          we'll look into it — this is usually a delayed confirmation rather than a lost payment.
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-display text-base font-semibold text-ink">Something not covered here?</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          Reach out from the Contact page with your transaction reference — we review edge cases
          individually.
        </p>
      </div>
    </StaticPageShell>
  );
}
