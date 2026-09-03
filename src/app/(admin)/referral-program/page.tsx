"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Gift, Users, Wallet, TrendingUp, Lock, Save } from "lucide-react";
import { getReferralProgram, updateReferralSettings, ApiRequestError } from "@/lib/api";
import type { ReferralProgram } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { StatCard } from "@/components/stat-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatNaira } from "@/lib/utils";

export default function ReferralProgramPage() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [referrerReward, setReferrerReward] = useState("");
  const [referredReward, setReferredReward] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getReferralProgram();
      setProgram(res);
      setReferrerReward(String(res.settings.referrerReward));
      setReferredReward(String(res.settings.referredReward));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load the referral program.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);

    const referrer = Number(referrerReward);
    const referred = Number(referredReward);
    if (Number.isNaN(referrer) || Number.isNaN(referred) || referrer < 0 || referred < 0) {
      setSaveError("Enter valid, non-negative amounts for both rewards.");
      return;
    }

    setSaving(true);
    try {
      await updateReferralSettings({ referrerReward: referrer, referredReward: referred });
      setSaved(true);
      await load();
    } catch (err) {
      setSaveError(err instanceof ApiRequestError ? err.message : "Couldn't save these settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Referral Program</h1>
        <p className="mt-1 text-sm text-ink-faint">
          See who&apos;s referring new customers, and set reward amounts
        </p>
      </div>

      {loading && <LoadingState label="Loading referral program…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && program && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total referrals" value={program.stats.totalReferrals} icon={Users} />
            <StatCard
              label="Rewards paid out"
              value={formatNaira(program.stats.rewardsPaidOut)}
              icon={Wallet}
              tone="brand"
            />
            <StatCard
              label="Conversion rate"
              value={`${program.stats.conversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              tone="good"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:col-span-1"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-ink">Reward settings</h2>
                {!isSuperAdmin && <Lock className="h-4 w-4 text-ink-faint" />}
              </div>

              <p className="mb-5 text-xs text-ink-faint">{program.settings.rewardTrigger}</p>

              {!isSuperAdmin && (
                <div className="mb-4 rounded-lg border border-line bg-base px-3 py-2 text-xs text-ink-faint">
                  Only super admins can change reward amounts. You can view the current settings below.
                </div>
              )}

              <label className="mb-4 block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                  Referrer reward (₦)
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={!isSuperAdmin}
                  value={referrerReward}
                  onChange={(e) => setReferrerReward(e.target.value)}
                  className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none disabled:opacity-60"
                />
                <span className="mt-1 block text-[11px] text-ink-faint">
                  Paid to the person who shared their code.
                </span>
              </label>

              <label className="mb-5 block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                  Referred / welcome reward (₦)
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={!isSuperAdmin}
                  value={referredReward}
                  onChange={(e) => setReferredReward(e.target.value)}
                  className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none disabled:opacity-60"
                />
                <span className="mt-1 block text-[11px] text-ink-faint">
                  Paid to the new signup on their first successful purchase.
                </span>
              </label>

              {saveError && (
                <div className="mb-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
                  {saveError}
                </div>
              )}
              {saved && !saveError && (
                <div className="mb-4 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-xs text-good">
                  Reward settings updated — this applies to every payout from now on.
                </div>
              )}

              {isSuperAdmin && (
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving…" : "Save changes"}
                </button>
              )}
            </form>

            <div className="rounded-2xl border border-line bg-surface shadow-card lg:col-span-2">
              <div className="border-b border-line p-4">
                <h2 className="font-display text-base font-semibold text-ink">Top referrers</h2>
              </div>

              {program.topReferrers.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={Gift}
                    title="No referrals yet"
                    description="Once customers start sharing their referral codes, your top performers will show up here."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                        <th className="px-4 py-3 font-medium">Referrer</th>
                        <th className="px-4 py-3 font-medium">Invites</th>
                        <th className="px-4 py-3 font-medium">Conversions</th>
                        <th className="px-4 py-3 font-medium">Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.topReferrers.map((r) => (
                        <tr
                          key={r.email}
                          className="border-b border-line-soft last:border-0 hover:bg-surface-hover"
                        >
                          <td className="px-4 py-3">
                            <span className="block font-medium text-ink">{r.name}</span>
                            <span className="block text-xs text-ink-faint">{r.email}</span>
                          </td>
                          <td className="px-4 py-3 text-ink-muted">{r.invites}</td>
                          <td className="px-4 py-3 text-ink-muted">{r.conversions}</td>
                          <td className="px-4 py-3 text-ink-muted">{formatNaira(r.earned)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
