import Link from "next/link";
import { Receipt, Smartphone, Wifi, Zap, Tv, Droplets, GraduationCap, Wallet, Dices, type LucideIcon } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import type { Transaction, TransactionCategory } from "@/lib/types";
import { isCreditCategory } from "@/lib/tx";

const ICONS: Record<TransactionCategory, LucideIcon> = {
  airtime: Smartphone, data: Wifi, electricity: Zap, cable: Tv,
  water: Droplets, "exam-pin": GraduationCap, "wallet-funding": Wallet, betting: Dices,
};
const STATUS = {
  success: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  failed: "bg-red-500/10 text-red-500",
};

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));

export function TransactionRow({ tx }: { tx: Transaction }) {
  const Icon = ICONS[tx.category] ?? Receipt;
  const credit = isCreditCategory(tx.category);
  return (
    <Link href={`/dashboard/history/${tx.id}`} className="flex items-center gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 transition-colors hover:border-brand-500/50">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-[rgb(var(--fg-muted))] dark:bg-white/5">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{tx.title}</p>
        <p className="text-xs text-[rgb(var(--fg-muted))]">{formatDate(tx.date)}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className={cn("font-display font-bold", credit && tx.status === "success" && "text-emerald-500")}>
          {credit ? "+" : "-"}{formatNaira(tx.amount)}
        </p>
        <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", STATUS[tx.status])}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> {tx.status}
        </span>
      </div>
    </Link>
  );
}
