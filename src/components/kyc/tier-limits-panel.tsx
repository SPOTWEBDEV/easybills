"use client";

import { useEffect, useState } from "react";
import { Lock, Save, ShieldCheck } from "lucide-react";
import { getKycTierLimits, updateKycTierLimit, ApiRequestError } from "@/lib/api";
import type { KycTierLimit } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState } from "@/components/states";
import { formatDate } from "@/lib/utils";

const TIER_LABEL: Record<string, string> = {
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "Tier 3",
};

type Draft = { maxWalletBalance: string; maxSingleTransaction: string; maxDailyTotal: string };

export function TierLimitsPanel() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [limits, setLimits] = useState<KycTierLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingTier, setSavingTier] = useState<string | null>(null);
  const [tierError, setTierError] = useState<Record<string, string>>({});
  const [tierSaved, setTierSaved] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getKycTierLimits();
      setLimits(res.data);
      setDrafts(
        Object.fromEntries(
          res.data.map((l) => [
            l.tier,
            {
              maxWalletBalance: String(l.maxWalletBalance),
              maxSingleTransaction: String(l.maxSingleTransaction),
              maxDailyTotal: String(l.maxDailyTotal),
            },
          ])
        )
      );
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load KYC tier limits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateDraft(tier: string, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [tier]: { ...d[tier], ...patch } }));
  }

  async function handleSave(tier: string) {
    const draft = drafts[tier];
    const wallet = Number(draft.maxWalletBalance);
    const single = Number(draft.maxSingleTransaction);
    const daily = Number(draft.maxDailyTotal);
    if ([wallet, single, daily].some((v) => Number.isNaN(v) || v < 0)) {
      setTierError((e) => ({ ...e, [tier]: "All three values must be valid, non-negative numbers." }));
      return;
    }
    setTierError((e) => ({ ...e, [tier]: "" }));
    setTierSaved((s) => ({ ...s, [tier]: false }));
    setSavingTier(tier);
    try {
      await updateKycTierLimit(tier, {
        maxWalletBalance: wallet,
        maxSingleTransaction: single,
        maxDailyTotal: daily,
      });
      setTierSaved((s) => ({ ...s, [tier]: true }));
      await load();
    } catch (err) {
      setTierError((e) => ({
        ...e,
        [tier]: err instanceof ApiRequestError ? err.message : "Couldn't save this tier.",
      }));
    } finally {
      setSavingTier(null);
    }
  }

  if (loading) return <LoadingState label="Loading tier limits…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {!isSuperAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-xs text-ink-faint">
          <Lock className="h-3.5 w-3.5" />
          Only super admins can change tier limits — you can still view current values below.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {limits.map((limit) => {
          const draft = drafts[limit.tier];
          if (!draft) return null;
          return (
            <div key={limit.tier} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <h2 className="font-display text-base font-semibold text-ink">
                  {TIER_LABEL[limit.tier] || limit.tier}
                </h2>
              </div>

              <label className="mb-3 block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">Max wallet balance</span>
                <input
                  type="number"
                  disabled={!isSuperAdmin}
                  value={draft.maxWalletBalance}
                  onChange={(e) => updateDraft(limit.tier, { maxWalletBalance: e.target.value })}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                />
              </label>

              <label className="mb-3 block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">Max single transaction</span>
                <input
                  type="number"
                  disabled={!isSuperAdmin}
                  value={draft.maxSingleTransaction}
                  onChange={(e) => updateDraft(limit.tier, { maxSingleTransaction: e.target.value })}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                />
              </label>

              <label className="mb-4 block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">Max daily total</span>
                <input
                  type="number"
                  disabled={!isSuperAdmin}
                  value={draft.maxDailyTotal}
                  onChange={(e) => updateDraft(limit.tier, { maxDailyTotal: e.target.value })}
                  className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none disabled:opacity-60"
                />
              </label>

              <p className="mb-3 text-[11px] text-ink-faint">Last updated {formatDate(limit.updatedAt)}</p>

              {tierError[limit.tier] && <p className="mb-2 text-xs text-bad">{tierError[limit.tier]}</p>}
              {tierSaved[limit.tier] && !tierError[limit.tier] && (
                <p className="mb-2 text-xs text-good">Saved.</p>
              )}

              {isSuperAdmin && (
                <button
                  onClick={() => handleSave(limit.tier)}
                  disabled={savingTier === limit.tier}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-brand-600 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingTier === limit.tier ? "Saving…" : "Save"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
