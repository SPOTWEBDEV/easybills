"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, Share2, Download } from "lucide-react";
import { NotchCard } from "@/components/shared/notch-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/utils";
import { toast } from "sonner";

const statusMeta = {
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Successful" },
  pending: { icon: Clock, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10", label: "Pending" },
  failed: { icon: XCircle, color: "text-coral-500", bg: "bg-coral-50 dark:bg-coral-500/10", label: "Failed" },
};

export function Receipt({ transaction, extra }: { transaction: Transaction; extra?: React.ReactNode }) {
  const meta = statusMeta[transaction.status];

  const buildReceiptText = () => {
    const lines = [
      "EasyBills — Transaction Receipt",
      "--------------------------------------",
      `Status: ${meta.label}`,
      `Title: ${transaction.title}`,
      `Amount: ${formatNaira(transaction.amount)}`,
      `Reference: ${transaction.reference}`,
      `Recipient: ${transaction.subtitle}`,
      transaction.provider ? `Provider: ${transaction.provider}` : null,
      `Date: ${formatDate(transaction.date)}`,
      transaction.fee > 0 ? `Fee: ${formatNaira(transaction.fee)}` : null,
      transaction.balanceAfter !== undefined
        ? `Balance after: ${formatNaira(transaction.balanceAfter)}`
        : null,
      "--------------------------------------",
      "Thank you for using EasyBills.",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = buildReceiptText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "EasyBills Receipt", text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Receipt copied to clipboard");
    } catch {
      toast.error("Couldn't share this receipt on this device.");
    }
  };

  const handleDownload = () => {
    const text = buildReceiptText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${transaction.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <NotchCard perforateAt="38%" className="border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 shadow-soft">
          <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
            <span className={`flex h-16 w-16 items-center justify-center rounded-full ${meta.bg}`}>
              <meta.icon className={`h-8 w-8 ${meta.color}`} />
            </span>
            <p className={`mt-3 text-sm font-semibold ${meta.color}`}>{meta.label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{formatNaira(transaction.amount)}</p>
            <p className="mt-1 text-sm text-ink-600 dark:text-paper-200/60">{transaction.title}</p>
          </div>

          <div className="space-y-3 px-6 pb-7 pt-6 text-sm">
            <Row label="Reference" value={transaction.reference} mono />
            <Row label="Recipient" value={transaction.subtitle} />
            {transaction.provider && <Row label="Provider" value={transaction.provider} />}
            <Row label="Date" value={formatDate(transaction.date)} />
            {transaction.fee > 0 && <Row label="Fee" value={formatNaira(transaction.fee)} />}
            {extra}
            {transaction.balanceAfter !== undefined && (
              <Row label="Balance after" value={formatNaira(transaction.balanceAfter)} />
            )}
          </div>
        </NotchCard>
      </motion.div>

      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleDownload}>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500 dark:text-paper-200/40">{label}</span>
      <span className={`font-semibold ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
