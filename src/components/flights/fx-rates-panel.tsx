"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Lock, Save } from "lucide-react";
import { getFxRates, getPricing, updateFxRate, updatePricing, ApiRequestError } from "@/lib/api";
import type { FxRate, PricingRule } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState } from "@/components/states";
import { formatDate } from "@/lib/utils";

export function FxRatesPanel() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [rates, setRates] = useState<FxRate[]>([]);
  const [flightRule, setFlightRule] = useState<PricingRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [savingCurrency, setSavingCurrency] = useState<string | null>(null);
  const [rateRowError, setRateRowError] = useState<Record<string, string>>({});

  const [markupDraft, setMarkupDraft] = useState("");
  const [savingMarkup, setSavingMarkup] = useState(false);
  const [markupError, setMarkupError] = useState<string | null>(null);
  const [markupSaved, setMarkupSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ratesRes, pricingRes] = await Promise.all([getFxRates(), getPricing()]);
      setRates(ratesRes.data);
      setRateDrafts(
        Object.fromEntries(ratesRes.data.map((r) => [r.currency, String(r.rateToNgn)]))
      );
      const flight = pricingRes.data.find((p) => p.name.toLowerCase() === "flight") || null;
      setFlightRule(flight);
      if (flight) setMarkupDraft(String(flight.marginValue));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load FX rates and markup.");
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

  async function handleSaveMarkup() {
    if (!flightRule) return;
    setMarkupError(null);
    setMarkupSaved(false);
    const value = Number(markupDraft);
    if (Number.isNaN(value) || value < 0) {
      setMarkupError("Enter a valid percentage.");
      return;
    }
    setSavingMarkup(true);
    try {
      await updatePricing(flightRule.id, { marginType: "percentage", marginValue: value });
      setMarkupSaved(true);
      await load();
    } catch (err) {
      setMarkupError(err instanceof ApiRequestError ? err.message : "Couldn't save the markup.");
    } finally {
      setSavingMarkup(false);
    }
  }

  if (loading) return <LoadingState label="Loading FX rates…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {!isSuperAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-xs text-ink-faint">
          <Lock className="h-3.5 w-3.5" />
          Only super admins can change FX rates or flight markup — you can still view current
          values below.
        </div>
      )}

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2.5 text-xs text-warn">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Flight prices are converted to NGN using these rates before anything is shown or charged.
        Stale rates mean customers see the wrong price — keep these current (ideally daily).
      </div>

      {flightRule && (
        <div className="mb-6 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 className="mb-1 font-display text-base font-semibold text-ink">Flight markup</h2>
          <p className="mb-4 text-xs text-ink-faint">
            Percentage added on top of the converted NGN price for every flight offer.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Margin (%)</span>
              <input
                type="number"
                disabled={!isSuperAdmin}
                value={markupDraft}
                onChange={(e) => setMarkupDraft(e.target.value)}
                className="w-28 rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
              />
            </label>
            {isSuperAdmin && (
              <button
                onClick={handleSaveMarkup}
                disabled={savingMarkup}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-brand-600 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {savingMarkup ? "Saving…" : "Save"}
              </button>
            )}
          </div>
          {markupError && <p className="mt-2 text-xs text-bad">{markupError}</p>}
          {markupSaved && !markupError && (
            <p className="mt-2 text-xs text-good">Markup updated — applies to new offers from now on.</p>
          )}
        </div>
      )}

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
