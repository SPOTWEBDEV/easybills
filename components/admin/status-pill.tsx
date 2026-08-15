import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, "success" | "pending" | "failed" | "neutral" | "brand"> = {
  active: "success",
  connected: "success",
  published: "success",
  delivered: "success",
  paid: "success",
  success: "success",
  resolved: "success",
  verified: "success",

  pending: "pending",
  sending: "pending",
  scheduled: "pending",
  in_progress: "pending",
  degraded: "pending",
  draft: "neutral",

  suspended: "failed",
  offline: "failed",
  failed: "failed",
  revoked: "failed",
  expired: "failed",
  unverified: "failed",
  high: "failed",

  medium: "pending",
  low: "neutral",
  open: "brand",
  inactive: "neutral",
};

export function StatusPill({ status }: { status: string }) {
  const variant = STATUS_MAP[status] ?? "neutral";
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant={variant} dot className="capitalize">
      {label}
    </Badge>
  );
}
