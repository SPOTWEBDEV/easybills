"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Lock, Save } from "lucide-react";
import { getFxRates, updateFxRate, ApiRequestError } from "@/lib/api";
import type { FxRate } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState } from "@/components/states";
import { formatDate } from "@/lib/utils";

export function FxRatesPanel() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [rates, setRates] = useState<FxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [savingCurrency, setSavingCurrency] = useState<string | null>(null);
  const [rateRowError, setRateRowError] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getFxRates();
      setRates(res.data);
      setRateDrafts(Object.fromEntries(res.data.map((r) => [r.currency, String(r.rateToNgn)])));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load FX rates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSaveRate(currency: string) {
    const value = Number(rateDrafts[currency]);
    if (Number.isNaN(value) || value <= 0) {
      setRateRowError((e) => ({ ...e, [currency]: "Enter a valid rate." }));
      return;
    }
    setRateRowError((e) => ({ ...e, [currency]: "" }));
    setSavingCurrency(currency);
    try {
      await updateFxRate(currency, value);
      await load();
    } catch (err) {
      setRateRowError((e) => ({
        ...e,
        [currency]: err instanceof ApiRequestError ? err.message : "Couldn't save this rate.",
      }));
    } finally {
      setSavingCurrency(null);
    }
  }

  if (loading) return <LoadingState label="Loading FX rates…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {!isSuperAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-xs text-ink-faint">
          <Lock className="h-3.5 w-3.5" />
          Only super admins can change FX rates — you can still view current values below.
        </div>
      )}

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2.5 text-xs text-warn">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Flight prices are converted to NGN using these rates before anything is shown or charged.
        Stale rates mean customers see the wrong price — keep these current (ideally daily).
      </div>

      <Link
        href="/pricing"
        className="mb-6 flex items-center justify-between rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors hover:border-brand-500/40"
      >
        <div>
          <p className="font-display text-sm font-semibold text-ink">Flight markup</p>
          <p className="text-xs text-ink-faint">
            The percentage added on top of the converted NGN price is set from the Pricing page,
            alongside every other service's margin.
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" />
      </Link>

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line p-4">
          <h2 className="font-display text-base font-semibold text-ink">FX rates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">Rate to NGN</th>
                <th className="px-4 py-3 font-medium">Last updated</th>
                {isSuperAdmin && <th className="px-4 py-3 font-medium text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.currency} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{r.currency}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      disabled={!isSuperAdmin}
                      value={rateDrafts[r.currency] ?? ""}
                      onChange={(e) =>
                        setRateDrafts((d) => ({ ...d, [r.currency]: e.target.value }))
                      }
                      className="w-32 rounded-lg border border-line bg-base px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(r.updatedAt)}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSaveRate(r.currency)}
                        disabled={savingCurrency === r.currency}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink disabled:opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingCurrency === r.currency ? "Saving…" : "Save"}
                      </button>
                      {rateRowError[r.currency] && (
                        <p className="mt-1 text-[11px] text-bad">{rateRowError[r.currency]}</p>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
