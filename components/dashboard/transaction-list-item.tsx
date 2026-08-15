import Link from "next/link";
import { Smartphone, Wifi, Zap, Tv, Droplets, ArrowDownToLine, ArrowUpFromLine, GraduationCap, Dices } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionCategory, TransactionStatus } from "@/lib/types";
import { cn, formatDate, formatNaira } from "@/lib/utils";

const categoryIcons: Record<TransactionCategory, React.ElementType> = {
  airtime: Smartphone,
  data: Wifi,
  electricity: Zap,
  cable: Tv,
  water: Droplets,
  "exam-pin": GraduationCap,
  "wallet-funding": ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  betting: Dices,
};

const statusVariant: Record<TransactionStatus, "success" | "pending" | "failed"> = {
  success: "success",
  pending: "pending",
  failed: "failed",
};

export function TransactionListItem({ transaction }: { transaction: Transaction }) {
  const Icon = categoryIcons[transaction.category];
  const isCredit = transaction.category === "wallet-funding";

  return (
    <Link
      href={`/transactions/${transaction.id}`}
      className="flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-paper-200">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{transaction.title}</p>
        <p className="truncate text-xs text-ink-600 dark:text-paper-200/50">{formatDate(transaction.date)}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={cn("text-sm font-semibold tabular-nums", isCredit ? "text-emerald-600 dark:text-emerald-500" : "")}>
          {isCredit ? "+" : "-"}
          {formatNaira(transaction.amount)}
        </span>
        <Badge variant={statusVariant[transaction.status]} dot>
          {transaction.status}
        </Badge>
      </div>
    </Link>
  );
}
