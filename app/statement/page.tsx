"use client";

import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { useTransactions } from "@/hooks/use-transactions";
import { transactionsApi } from "@/lib/api/transactions";
import { formatNaira } from "@/lib/utils";

type PresetRange = "7d" | "30d" | "90d" | "all" | "custom";

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function StatementPage() {
  const { data: transactions, isLoading } = useTransactions();

  const [preset, setPreset] = useState<PresetRange>("30d");
  const [from, setFrom] = useState(toInputDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(toInputDate(new Date()));

  const applyPreset = (p: PresetRange) => {
    setPreset(p);
    if (p === "all") {
      setFrom(toInputDate(new Date(2020, 0, 1)));
      setTo(toInputDate(new Date()));
      return;
    }
    const days = p === "7d" ? 7 : p === "30d" ? 30 : p === "90d" ? 90 : null;
    if (days) {
      setFrom(toInputDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000)));
      setTo(toInputDate(new Date()));
    }
  };

  const filtered = useMemo(() => {
    if (!transactions) return [];
    const fromTime = new Date(from + "T00:00:00").getTime();
    const toTime = new Date(to + "T23:59:59").getTime();
    return transactions.filter((t) => {
      const time = new Date(t.date).getTime();
      return time >= fromTime && time <= toTime;
    });
  }, [transactions, from, to]);

  const summary = useMemo(() => {
    const debits = filtered.filter((t) => t.category !== "wallet-funding");
    const credits = filtered.filter((t) => t.category === "wallet-funding");
    const totalOut = debits.reduce((s, t) => s + t.amount + t.fee, 0);
    const totalIn = credits.reduce((s, t) => s + t.amount, 0);
    return { totalOut, totalIn, count: filtered.length };
  }, [filtered]);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadCsv = async () => {
    if (filtered.length === 0) {
      toast.error("No transactions in this date range.");
      return;
    }
    setDownloading(true);
    try {
      await transactionsApi.downloadStatement(from, to);
      toast.success("Statement downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download statement.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Statement of Account" subtitle="Download a record of your activity" />

      <div className="space-y-5 px-5 pt-2">
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "7d", label: "7 days" },
                { id: "30d", label: "30 days" },
                { id: "90d", label: "90 days" },
                { id: "all", label: "All time" },
              ] as { id: PresetRange; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  preset === p.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 dark:border-ink-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPreset("custom");
                }}
                className="h-11 w-full rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPreset("custom");
                }}
                className="h-11 w-full rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3.5 text-center">
            <p className="font-display text-base font-bold">{summary.count}</p>
            <p className="mt-0.5 text-[10px] text-ink-500 dark:text-paper-200/40">Transactions</p>
          </Card>
          <Card className="p-3.5 text-center">
            <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-500">
              {formatNaira(summary.totalIn, { compact: true })}
            </p>
            <p className="mt-0.5 text-[10px] text-ink-500 dark:text-paper-200/40">Money in</p>
          </Card>
          <Card className="p-3.5 text-center">
            <p className="font-display text-base font-bold text-coral-600 dark:text-coral-500">
              {formatNaira(summary.totalOut, { compact: true })}
            </p>
            <p className="mt-0.5 text-[10px] text-ink-500 dark:text-paper-200/40">Money out</p>
          </Card>
        </div>

        <Button size="lg" className="w-full" onClick={handleDownloadCsv} loading={downloading}>
          <Download className="h-4 w-4" /> Download statement (CSV)
        </Button>

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600 dark:text-paper-200/60">
            Preview
          </h2>
          <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-2 py-1 shadow-soft">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <FileText className="h-8 w-8 text-ink-300 dark:text-paper-200/20" />
                <p className="text-sm text-ink-500 dark:text-paper-200/40">
                  No transactions in this date range.
                </p>
              </div>
            ) : (
              filtered.map((txn) => <TransactionListItem key={txn.id} transaction={txn} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
