import { cn } from "@/lib/utils";

/**
 * The signature visual device for EasyBills: a card styled after the
 * physical recharge / scratch cards the platform sells (WAEC, NECO, airtime
 * top-up cards). Two round notches + a dashed perforation line split the
 * card into a "stub" and a "body", exactly like a real ticket or card.
 */
export function NotchCard({
  className,
  perforateAt = "50%",
  children,
}: {
  className?: string;
  perforateAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("notch-card overflow-hidden rounded-3xl", className)} style={{ ["--notch-y" as string]: perforateAt }}>
      <div
        className="notch-perf"
        style={{ top: perforateAt }}
      />
      {children}
    </div>
  );
}
