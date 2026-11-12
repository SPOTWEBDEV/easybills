"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, CheckCircle2, Clock, Copy, LifeBuoy, Printer, XCircle } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { ReceiptCard } from "@/components/dashboard/receipt-card";
import { useApiData } from "@/hooks/use-api-data";
import { transactionsApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { isCreditCategory } from "@/lib/tx";
import { cn, formatNaira } from "@/lib/utils";

const STATUS = {
  success: { icon: CheckCircle2, label: "Successful", cls: "text-emerald-500 bg-emerald-500/10" },
  pending: { icon: Clock, label: "Pending", cls: "text-amber-500 bg-amber-500/10" },
  failed: { icon: XCircle, label: "Failed", cls: "text-red-500 bg-red-500/10" },
} as const;

const fullDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "medium" }).format(new Date(iso));
const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tx, loading, error } = useApiData(() => transactionsApi.get(id), [id]);
  const [copied, setCopied] = useState(false);

  const header = <SubPageHeader title="Receipt" back="/dashboard/history" />;

  if (loading) return <div>{header}<p className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">Loading…</p></div>;
  if (error || !tx) {
    const notFound = (error as ApiError | null)?.status === 404;
    return (
      <div>
        {header}
        <p role="alert" className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">
          {notFound ? "We couldn't find this transaction." : "Couldn't load this receipt. Please try again."}
        </p>
        <div className="flex justify-center"><Link href="/dashboard/history" className="rounded-full border px-6 py-3 text-sm font-semibold">Back to transactions</Link></div>
      </div>
    );
  }

  const st = STATUS[tx.status];
  const StatusIcon = st.icon;
  const credit = isCreditCategory(tx.category);

  const rows: [string, React.ReactNode][] = [
    ["Reference", (
      <span className="flex items-center gap-2">
        <span className="break-all font-mono text-[13px]">{tx.reference}</span>
        <button
          onClick={async () => { await navigator.clipboard.writeText(tx.reference); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
          aria-label="Copy reference" className="shrink-0 text-brand-500 print:hidden">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </span>
    )],
    ["Category", titleCase(tx.category)],
    ...(tx.provider ? [["Provider", tx.provider] as [string, React.ReactNode]] : []),
    ...(tx.recipient ? [["Recipient", tx.recipient] as [string, React.ReactNode]] : []),
    ["Amount", formatNaira(tx.amount)],
    ["Fee", formatNaira(tx.fee ?? 0)],
    ...(tx.balanceAfter != null ? [["Balance after", formatNaira(tx.balanceAfter)] as [string, React.ReactNode]] : []),
    ["Date", fullDate(tx.date)],
  ];

  return (
    <div>
      <div className="print:hidden">{header}</div>

      <ReceiptCard
        top={
          <div className="flex flex-col items-center text-center">
            <span className={cn("flex h-14 w-14 items-center justify-center rounded-full", st.cls)}><StatusIcon className="h-7 w-7" /></span>
            <p className="mt-4 font-display text-4xl font-bold">{credit ? "+" : "-"}{formatNaira(tx.amount)}</p>
            <p className="mt-2 font-semibold">{tx.title}</p>
            {tx.subtitle && <p className="text-sm text-[rgb(var(--fg-muted))]">{tx.subtitle}</p>}
            <span className={cn("mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase", st.cls)}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {st.label}
            </span>
          </div>
        }
      >
        <dl className="space-y-3.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-6">
              <dt className="shrink-0 text-[rgb(var(--fg-muted))]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-center text-xs text-[rgb(var(--fg-muted))]">EasyBills · Keep this receipt for your records</p>
      </ReceiptCard>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row print:hidden">
        <button onClick={() => window.print()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-glow">
          <Printer className="h-4 w-4" /> Print or save as PDF
        </button>
        {tx.status !== "success" && (
          <Link href="/support" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-semibold">
            <LifeBuoy className="h-4 w-4" /> Contact support
          </Link>
        )}
      </div>
    </div>
  );
}
