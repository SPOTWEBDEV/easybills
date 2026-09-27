"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminKycApi, KYCTierLimit } from "@/lib/api/admin/kyc";
import { formatNaira, formatDate } from "@/lib/utils";

type Draft = { maxWalletBalance: number; maxSingleTransaction: number; maxDailyTotal: number };

export default function AdminKycTierLimitsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: tiers, isLoading } = useQuery({ queryKey: ["admin-kyc-tier-limits"], queryFn: adminKycApi.listTierLimits });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tiers) return;
    const next: typeof drafts = {};
    for (const t of tiers) {
      next[t.tier] = {
        maxWalletBalance: t.maxWalletBalance,
        maxSingleTransaction: t.maxSingleTransaction,
        maxDailyTotal: t.maxDailyTotal,
      };
    }
    setDrafts(next);
  }, [tiers]);

  const updateDraft = (tier: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [tier]: { ...prev[tier], ...patch } }));
  };

  const handleSave = async () => {
    if (!tiers) return;
    setSaving(true);
    try {
      await Promise.all(
        tiers.map((t) => {
          const draft = drafts[t.tier];
          if (!draft) return Promise.resolve();
          return adminKycApi.updateTierLimit(t.tier, draft);
        })
      );
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-tier-limits"] });
      toast.success("Tier limits saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save tier limits.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <button
        onClick={() => router.push("/admin/kyc")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-paper-200/50 dark:hover:text-paper-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to KYC
      </button>

      <AdminPageHeading
        title="KYC Tier Limits"
        subtitle="Wallet and transaction caps per verification tier"
        action={<Button onClick={handleSave} loading={saving}>Save changes</Button>}
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/30">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Seed values are illustrative placeholders, not real compliance figures — confirm real numbers with
          compliance before relying on these.
        </p>
      </div>

      {isLoading || !tiers ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading tier limits...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {tiers.map((t) => {
            const draft = drafts[t.tier] ?? {
              maxWalletBalance: t.maxWalletBalance,
              maxSingleTransaction: t.maxSingleTransaction,
              maxDailyTotal: t.maxDailyTotal,
            };
            return (
              <Card key={t.tier}>
                <CardHeader>
                  <CardTitle className="capitalize">{t.tier.replace("tier", "Tier ")}</CardTitle>
                  <CardDescription>Last updated {formatDate(t.updatedAt)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Max wallet balance</Label>
                    <Input
                      type="number"
                      value={draft.maxWalletBalance}
                      onChange={(e) => updateDraft(t.tier, { maxWalletBalance: Number(e.target.value) })}
                      leftIcon={<span className="text-sm font-semibold">₦</span>}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max single transaction</Label>
                    <Input
                      type="number"
                      value={draft.maxSingleTransaction}
                      onChange={(e) => updateDraft(t.tier, { maxSingleTransaction: Number(e.target.value) })}
                      leftIcon={<span className="text-sm font-semibold">₦</span>}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max daily total</Label>
                    <Input
                      type="number"
                      value={draft.maxDailyTotal}
                      onChange={(e) => updateDraft(t.tier, { maxDailyTotal: Number(e.target.value) })}
                      leftIcon={<span className="text-sm font-semibold">₦</span>}
                    />
                  </div>
                  <p className="text-xs text-ink-400 dark:text-paper-200/40">
                    Currently: wallet cap {formatNaira(t.maxWalletBalance)}, per-tx cap{" "}
                    {formatNaira(t.maxSingleTransaction)}, daily cap {formatNaira(t.maxDailyTotal)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}