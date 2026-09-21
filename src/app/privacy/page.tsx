import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Privacy Policy — EasyBills" };

const SECTIONS = [
  {
    title: "1. What we collect",
    body: [
      "Account details you provide — full name, email, phone number, and password (stored securely, never in plain text).",
      "Transaction details for purchases you make — service type, amount, recipient (e.g. the phone or meter number), and status.",
      "Basic device information if you enable push notifications, limited to what's needed to deliver them to your device.",
    ],
  },
  {
    title: "2. What we never collect or store",
    body: [
      "We don't store your transaction PIN or password in plain text, or log them anywhere. We don't store your card details — wallet funding is handled entirely by Paystack's secure checkout.",
    ],
  },
  {
    title: "3. How we use your information",
    body: [
      "To process purchases and keep your wallet balance accurate.",
      "To send you transaction receipts and account-related notifications (in-app and, where enabled, push or email).",
      "To detect and prevent fraud, and to keep the platform secure.",
    ],
  },
  {
    title: "4. Sharing information",
    body: [
      "We share only what's necessary with the service providers involved in fulfilling a purchase (e.g. a network operator or a disco) and with Paystack for payment processing. We don't sell your personal information.",
    ],
  },
  {
    title: "5. Your choices",
    body: [
      "You can update your account details from Settings inside the app, and disable push notifications at any time from your device settings.",
    ],
  },
  {
    title: "6. Contact",
    body: ["Questions about this policy? Reach out from the Contact page."],
  },
];

export default function PrivacyPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="How EasyBills collects, uses, and protects your information."
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
