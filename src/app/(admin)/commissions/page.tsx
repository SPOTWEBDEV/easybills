import { Percent } from "lucide-react";
import { EmptyState } from "@/components/states";

export default function CommissionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Commissions</h1>
        <p className="mt-1 text-sm text-ink-faint">Track what agents and referrers have earned</p>
      </div>
      <EmptyState
        icon={Percent}
        title="Commissions isn't wired up yet"
        description="This page is ready to go — connect it to your commissions endpoint (e.g. GET /admin/commissions) once it exists on the backend."
      />
    </div>
  );
}
