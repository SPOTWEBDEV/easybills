import { SimplePage } from "@/components/shared/simple-page";

export default function TermsPage() {
  return (
    <SimplePage title="Terms of Service" subtitle="Last updated August 2026">
      <p>
        By creating a EasyBills account, you agree to use the platform only for lawful bill
        payments and purchases. Wallet funds are held for the purpose of making purchases through
        the platform and are non-transferable to other users.
      </p>
      <p>
        We reserve the right to suspend accounts involved in fraudulent activity, and to update
        pricing or available services at any time. Continued use of EasyBills after changes to
        these terms constitutes acceptance of the updated terms.
      </p>
    </SimplePage>
  );
}
