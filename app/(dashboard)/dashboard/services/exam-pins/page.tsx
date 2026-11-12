"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, GraduationCap, Minus, Plus } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { useApiData } from "@/hooks/use-api-data";
import { examPinsApi, type ExamPinResult } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { cn, formatNaira } from "@/lib/utils";

export default function BuyExamPinsPage() {
  const { requestPin } = usePinPrompt();
  const variations = useApiData(() => examPinsApi.variations("exams"));
  const all = variations.data ?? [];

  // Boards come from the variation code prefix (waecpin → waec); UTME is shown as JAMB.
  const boards = useMemo(() => {
    const seen = new Set<string>(); const out: { id: string; name: string }[] = [];
    for (const v of all) {
      let id = v.code.split(/[-_]/)[0].toLowerCase();
      if (id === "utme") id = "jamb";
      if (!seen.has(id)) { seen.add(id); out.push({ id, name: id.toUpperCase() }); }
    }
    return out;
  }, [all]);

  const [boardId, setBoardId] = useState<string | null>(null);
  const [variationCode, setVariationCode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState<ExamPinResult[] | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const plans = useMemo(() => !boardId ? [] : all.filter((v) => boardId === "jamb" ? v.code.toLowerCase().includes("utme") : v.code.toLowerCase().startsWith(boardId)), [all, boardId]);
  const selected = plans.find((v) => v.code === variationCode) ?? null;
  const total = selected ? Number(selected.price) * quantity : 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId) return setError("Select an exam board");
    if (!selected) return setError("Select a valid pin type");
    setError(undefined); setLoading(true);
    try {
      const providerId = selected.providerId && selected.providerId !== "exams" ? selected.providerId : selected.code;
      const r = await purchaseWithPinRetry((pin) => examPinsApi.purchase({ providerId, variationCode: selected.code, quantity, amount: total, transactionPin: pin }), requestPin);
      if (r === null) return;
      setPins(r.pins);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const onCopy = async (item: ExamPinResult, i: number) => {
    await navigator.clipboard.writeText("raw" in item ? item.raw : `Serial: ${item.serial}  PIN: ${item.pin}`);
    setCopied(i); setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
  };

  if (pins) {
    return (
      <div className="space-y-4">
        <SubPageHeader title="Pin purchase successful" subtitle={`${pins.length} pin${pins.length === 1 ? "" : "s"}. Copy and save them before leaving this page.`} back="/dashboard/services" />
        {pins.map((item, i) => (
          <div key={i} className="space-y-1 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4">
            {"raw" in item ? <p className="break-all text-sm">{item.raw}</p> : (<>
              <div className="flex justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">Serial</span><span className="font-bold">{item.serial}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">PIN</span><span className="font-bold">{item.pin}</span></div>
            </>)}
            <button onClick={() => onCopy(item, i)} className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-brand-500">
              {copied === i ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === i ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={() => { setPins(null); setQuantity(1); }} className="flex-1 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-sm font-bold text-white">Buy more pins</button>
          <Link href="/dashboard/history" className="flex-1 rounded-full border py-3.5 text-center text-sm font-semibold">View transactions</Link>
        </div>
      </div>
    );
  }

  const label = "text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]";
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <SubPageHeader title="Buy Exam Pins" subtitle="WAEC, NECO, JAMB & more" />
      <div className="space-y-3">
        <p className={label}>Exam board</p>
        {variations.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
          : boards.length === 0 ? <Box>No exam boards available right now</Box>
          : <div role="radiogroup" aria-label="Exam board" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {boards.map((b) => (
                <button key={b.id} type="button" role="radio" aria-checked={boardId === b.id} onClick={() => { setBoardId(b.id); setVariationCode(null); }}
                  className={cn("flex items-center gap-3 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-3", boardId === b.id && "border-brand-500 bg-brand-500/5")}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/5 dark:bg-white/5"><GraduationCap className={cn("h-[18px] w-[18px]", boardId === b.id ? "text-brand-500" : "text-[rgb(var(--fg-muted))]")} /></span>
                  <span className="text-sm font-bold">{b.name}</span>
                </button>))}
            </div>}
      </div>

      <div className="space-y-3">
        <p className={label}>Pin type</p>
        {!boardId ? <Box>Choose an exam board to see pin types</Box>
          : plans.length === 0 ? <Box>No pin types available for this board right now</Box>
          : <div role="radiogroup" aria-label="Pin type" className="grid grid-cols-2 gap-3">
              {plans.map((v) => (
                <button key={v.plancode || v.code} type="button" role="radio" aria-checked={variationCode === v.code} onClick={() => setVariationCode(v.code)}
                  className={cn("flex min-h-20 flex-col justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-3 text-left", variationCode === v.code && "border-brand-500 bg-brand-500/5")}>
                  <span className="text-sm font-bold">{v.name}</span>
                  <span className="mt-1 text-sm font-bold text-brand-500">{formatNaira(Number(v.price))}</span>
                </button>))}
            </div>}
      </div>

      <div className="space-y-3">
        <p className={label}>Quantity</p>
        <div className="inline-flex items-center gap-5 rounded-full border bg-[rgb(var(--bg-elevated))] px-4 py-2">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/5 dark:bg-white/5"><Minus className="h-4 w-4" /></button>
          <span aria-live="polite" className="min-w-5 text-center font-display text-base font-bold">{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(20, q + 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/5 dark:bg-white/5"><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      {selected && <div className="flex items-center justify-between border-t pt-4"><span className="text-sm text-[rgb(var(--fg-muted))]">Total</span><span className="font-display text-lg font-bold text-brand-500">{formatNaira(total)}</span></div>}
      {error && <p role="alert" className="text-center text-sm text-red-500">{error}</p>}
      <SubmitButton loading={loading}>Continue</SubmitButton>
    </form>
  );
}
function Box({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-[rgb(var(--fg-muted))]">{children}</div>;
}
