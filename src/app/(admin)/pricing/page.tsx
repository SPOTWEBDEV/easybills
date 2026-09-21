"use client";

import { useEffect, useState } from "react";
import { Lock, Percent, Save } from "lucide-react";
import { getPricing, updatePricing, ApiRequestError } from "@/lib/api";
import type { PricingRule } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, cx } from "@/lib/utils";

const SERVICE_LABEL: Record<string, string> = {
  airtime: "Airtime",
  data: "Data",
  electricity: "Electricity",
  cable: "Cable TV",
  "exam-pin": "Exam Pins",
  flight: "Flights",
  "gift-card": "Gift Cards",
};

// How each category's margin actually reaches the customer — worth showing
// inline since it's easy to assume they all work the same way (they don't).
const MECHANISM_NOTE: Record<string, string> = {
  airtime: "Added as a separate, visible fee on top of the requested amount.",
  electricity: "Added as a separate, visible fee on top of the requested amount.",
  data: "Baked invisibly into the all-inclusive price — shows fee: 0 by design.",
  cable: "Baked invisibly into the all-inclusive price — shows fee: 0 by design.",
  "exam-pin": "Baked invisibly into the all-inclusive price — shows fee: 0 by design.",
  flight: "Baked invisibly into the all-inclusive NGN price — shows fee: 0 by design.",
  "gift-card": "Works backwards: deducted as commission from the Sogo sell payout, not added to a purchase.",
};

export default function PricingPage() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<Record<number, { marginType: "fixed" | "percentage"; marginValue: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<Record<number, string>>({});
  const [rowSaved, setRowSaved] = useState<Record<number, boolean>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPricing();
      setRules(res.data);
      setDrafts(
        Object.fromEntries(
          res.data.map((r) => [r.id, { marginType: r.marginType, marginValue: String(r.marginValue) }])
        )
      );
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load pricing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(rule: PricingRule) {
    const draft = drafts[rule.id];
    const value = Number(draft.marginValue);
    if (Number.isNaN(value) || value < 0) {
      setRowError((e) => ({ ...e, [rule.id]: "Enter a valid, non-negative value." }));
      return;
    }
    setRowError((e) => ({ ...e, [rule.id]: "" }));
    setRowSaved((s) => ({ ...s, [rule.id]: false }));
    setSavingId(rule.id);
    try {
      await updatePricing(rule.id, { marginType: draft.marginType, marginValue: value });
      setRowSaved((s) => ({ ...s, [rule.id]: true }));
      await load();
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [rule.id]: err instanceof ApiRequestError ? err.message : "Couldn't save this margin.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Pricing</h1>
        <p className="mt-1 text-sm text-ink-faint">Profit margins per service category</p>
      </div>

      {loading && <LoadingState label="Loading pricing…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {!isSuperAdmin && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-xs text-ink-faint">
              <Lock className="h-3.5 w-3.5" />
              Only super admins can change margins — you can still view current values below.
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface shadow-card">
            {rules.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Percent}
                  title="No pricing rules found"
                  description="Category margins will show up here once they exist."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      {isSuperAdmin && <th className="px-4 py-3 font-medium text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => {
                      const draft = drafts[rule.id];
                      if (!draft) return null;
                      return (
                        <tr key={rule.id} className="border-b border-line-soft last:border-0 align-top">
                          <td className="px-4 py-3">
                            <span className="block font-medium text-ink">
                              {SERVICE_LABEL[rule.service] || rule.service}
                            </span>
                            <span className="mt-0.5 block max-w-xs text-[11px] text-ink-faint">
                              {MECHANISM_NOTE[rule.service]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              disabled={!isSuperAdmin}
                              value={draft.marginType}
                              onChange={(e) =>
                                setDrafts((d) => ({
                                  ...d,
                                  [rule.id]: { ...d[rule.id], marginType: e.target.value as "fixed" | "percentage" },
                                }))
                              }
                              className="rounded-lg border border-line bg-base px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                            >
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed (₦)</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              disabled={!isSuperAdmin}
                              value={draft.marginValue}
                              onChange={(e) =>
                                setDrafts((d) => ({
                                  ...d,
                                  [rule.id]: { ...d[rule.id], marginValue: e.target.value },
                                }))
                              }
                              className="w-28 rounded-lg border border-line bg-base px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                            />
                          </td>
                          <td className="px-4 py-3 text-ink-muted">{formatDate(rule.updatedAt)}</td>
                          {isSuperAdmin && (
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleSave(rule)}
                                disabled={savingId === rule.id}
                                className={cx(
                                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60",
                                  "border-line text-ink-muted hover:bg-surface-hover hover:text-ink"
                                )}
                              >
                                <Save className="h-3.5 w-3.5" />
                                {savingId === rule.id ? "Saving…" : "Save"}
                              </button>
                              {rowError[rule.id] && (
                                <p className="mt-1 text-[11px] text-bad">{rowError[rule.id]}</p>
                              )}
                              {rowSaved[rule.id] && !rowError[rule.id] && (
                                <p className="mt-1 text-[11px] text-good">Saved</p>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
