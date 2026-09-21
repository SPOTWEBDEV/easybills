"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { CheckCircle2, Clock, XCircle, Share2, Download, Loader2 } from "lucide-react";
import { NotchCard } from "@/components/shared/notch-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/utils";
import { toast } from "sonner";

const statusMeta = {
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Successful" },
  pending: { icon: Clock, color: "text-gold-500", bg: "bg-gold-50 dark:bg-gold-500/10", label: "Pending" },
  failed: { icon: XCircle, color: "text-coral-500", bg: "bg-coral-50 dark:bg-coral-500/10", label: "Failed" },
};

export function Receipt({ transaction, extra }: { transaction: Transaction; extra?: React.ReactNode }) {
  const meta = statusMeta[transaction.status];
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /**
   * Renders the actual receipt card (NotchCard + branding, not a re-drawn
   * approximation) to a PNG data URL via html-to-image. We render at 2x
   * pixel density for a crisp image on high-DPI screens, and set
   * backgroundColor explicitly since transparent card backgrounds can
   * otherwise render as black in some browsers' canvas export.
   */
  const captureImage = async (): Promise<Blob> => {
    if (!cardRef.current) {
      throw new Error("Receipt is not ready yet.");
    }
    const isDark = document.documentElement.classList.contains("dark");
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: isDark ? "#181C27" : "#FFFFFF",
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await captureImage();
      const file = new File([blob], `receipt-${transaction.reference}.png`, { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: "EasyBills Receipt",
            text: `${transaction.title} — ${formatNaira(transaction.amount)}`,
            files: [file],
          });
          return;
        } catch {
          // user cancelled the share sheet — not an error, just stop here
          return;
        }
      }

      // Fallback: no Web Share API / can't share files — copy image to
      // clipboard if supported, otherwise fall through to a direct download.
      if (typeof navigator !== "undefined" && navigator.clipboard && "write" in navigator.clipboard && typeof ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          toast.success("Receipt image copied to clipboard");
          return;
        } catch {
          // clipboard image write not supported in this browser — fall back to download
        }
      }

      downloadBlob(blob, `receipt-${transaction.reference}.png`);
      toast.success("Receipt image downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't share this receipt on this device.");
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await captureImage();
      downloadBlob(blob, `receipt-${transaction.reference}.png`);
      toast.success("Receipt downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't generate the receipt image.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div ref={cardRef}>
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
        </div>
      </motion.div>

      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare} disabled={sharing || downloading}>
          {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Share
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={sharing || downloading}>
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
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