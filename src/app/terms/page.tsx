import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Terms of Service — EasyBills" };

const SECTIONS = [
  {
    title: "1. Using EasyBills",
    body: [
      "EasyBills lets you fund a wallet and use that balance to buy airtime, data, electricity tokens, cable TV subscriptions, and exam pins. You must be at least 18 years old, or have a parent/guardian's permission, to create an account.",
      "You're responsible for keeping your login details, password, and transaction PIN private. Any purchase authorized with your correct PIN is treated as a purchase you made.",
    ],
  },
  {
    title: "2. Wallet funding and purchases",
    body: [
      "Wallet funding is processed through Paystack. Once a funding transaction is confirmed, your balance updates and is available to spend immediately.",
      "Purchases are typically delivered within seconds. If a purchase fails due to an issue on the provider's side, the amount is automatically returned to your wallet — see our Refund Policy for details.",
      "It's your responsibility to double-check details like phone numbers, meter numbers, and smartcard numbers before confirming a purchase. Electricity and cable purchases include a lookup step to confirm the customer's name first — please review it before paying.",
    ],
  },
  {
    title: "3. Referrals and rewards",
    body: [
      "Referral and cashback rewards are credited according to the terms in effect at the time they're earned, and reward amounts may change over time. Rewards have no cash value outside your EasyBills wallet unless otherwise stated.",
    ],
  },
  {
    title: "4. Account suspension",
    body: [
      "We may suspend an account that we reasonably believe is being used fraudulently, to abuse referral or cashback programs, or in violation of these terms. We'll always try to resolve genuine mistakes rather than suspend an account outright.",
    ],
  },
  {
    title: "5. Changes to these terms",
    body: [
      "We may update these terms from time to time. Continuing to use EasyBills after an update means you accept the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="Last updated: this page reflects how EasyBills currently works. Please read it before using the app."
    >
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mb-2 text-sm leading-relaxed text-ink-muted last:mb-0">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}
