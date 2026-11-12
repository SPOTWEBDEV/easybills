import { cn } from "@/lib/utils";

// Ticket-style card with a perforated divider and side notches, echoing the landing page's NotchCard.
// The notches sit on the divider itself, so the perforation stays aligned however many detail rows there are.
export function ReceiptCard({ top, children, className }: { top: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative rounded-3xl border bg-[rgb(var(--bg-elevated))] shadow-soft", className)}>
      <div className="px-6 pb-6 pt-8">{top}</div>
      <div aria-hidden="true" className="relative h-0">
        <span className="absolute -left-[11px] top-0 h-[22px] w-[22px] -translate-y-1/2 rounded-full border-r bg-[rgb(var(--card-notch))]" />
        <span className="absolute -right-[11px] top-0 h-[22px] w-[22px] -translate-y-1/2 rounded-full border-l bg-[rgb(var(--card-notch))]" />
        <div className="mx-4 border-t-2 border-dashed opacity-60" />
      </div>
      <div className="px-6 pb-6 pt-6">{children}</div>
    </div>
  );
}
