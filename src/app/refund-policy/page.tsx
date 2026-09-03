import { SimplePage } from "@/components/shared/simple-page";

export default function RefundPolicyPage() {
  return (
    <SimplePage title="Refund Policy" subtitle="How we handle failed transactions">
      <p>
        If a transaction fails after your wallet has been debited, EasyBills automatically
        retries the request. If it still fails, the full amount — including any fees — is
        refunded to your wallet instantly, with no support ticket required.
      </p>
      <p>
        Successful transactions (airtime, data, bill payments delivered to the correct recipient)
        are final and not eligible for refund.
      </p>
    </SimplePage>
  );
}
