import { SimplePage } from "@/components/shared/simple-page";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BecomeAgentPage() {
  return (
    <SimplePage
      title="Become an Agent"
      subtitle="Set your own margins on every airtime, data, and bill payment you resell."
    >
      <p>
        Agents on EasyBills buy at wholesale rates and resell at a price they control — the
        markup is credited to their wallet the moment a customer completes a purchase.
      </p>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href="/register">Apply now</Link>
        </Button>
      </div>
    </SimplePage>
  );
}
