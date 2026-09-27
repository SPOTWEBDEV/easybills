import { SimplePage } from "@/components/shared/simple-page";

export default function PrivacyPage() {
  return (
    <SimplePage title="Privacy Policy" subtitle="Last updated August 2026">
      <p>
        EasyBills collects the information necessary to process your transactions: name, email,
        phone number, and payment details. We never sell personal data to third parties.
      </p>
      <p>
        Transaction data is retained for regulatory and support purposes. You can request a copy
        or deletion of your data at any time by contacting support.
      </p>
    </SimplePage>
  );
}
