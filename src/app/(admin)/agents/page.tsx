import { UserCog } from "lucide-react";
import { EmptyState } from "@/components/states";

export default function AgentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Agents</h1>
        <p className="mt-1 text-sm text-ink-faint">EasyBills agents selling on behalf of customers</p>
      </div>
      <EmptyState
        icon={UserCog}
        title="Agents isn't wired up yet"
        description="This page is ready to go — connect it to your agents endpoint (e.g. GET /admin/agents) once it exists on the backend."
      />
    </div>
  );
}
