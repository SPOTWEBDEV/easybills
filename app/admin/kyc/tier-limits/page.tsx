"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/hooks/use-admin-role";
import { adminKycApi } from "@/lib/api/admin/kyc";
import { fmtDateTime } from "@/lib/admin-format";
import { formatNaira } from "@/lib/utils";

type Draft = { maxWalletBalance: number; maxSingleTransaction: number; maxDailyTotal: number };

export default function AdminKycTierLimitsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminRole();
  const { data: tiers, isLoading } = useQuery({ queryKey: ["admin-kyc-tier-limits"], queryFn: adminKycApi.listTierLimits });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tiers) return;
    const next: Record<string, Draft> = {};
    for (const t of tiers) next[t.tier] = { maxWalletBalance: t.maxWalletBalance, maxSingleTransaction: t.maxSingleTransaction, maxDailyTotal: t.maxDailyTotal };
    setDrafts(next);
  }, [tiers]);

  const updateDraft = (tier: string, patch: Partial<Draft>) => setDrafts((prev) => ({ ...prev, [tier]: { ...prev[tier], ...patch } }));

  const changed = (tiers ?? []).filter((t) => {
    const d = drafts[t.tier];
    return d && (d.maxWalletBalance !== t.maxWalletBalance || d.maxSingleTransaction !== t.maxSingleTransaction || d.maxDailyTotal !== t.maxDailyTotal);
  });

  const handleSave = async () => {
    if (changed.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(changed.map((t) => adminKycApi.updateTierLimit(t.tier, drafts[t.tier])));
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-tier-limits"] });
      toast.success("Tier limits saved — they take effect immediately");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save tier limits.");
    } finally { setSaving(false); }
  };

  return (
    <AdminShell>
      <button onClick={() => router.push("/admin/kyc")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-paper-200/50 dark:hover:text-paper-200">
        <ArrowLeft className="h-4 w-4" />
        Back to KYC
      </button>

      <AdminPageHeading
        title="KYC Tier Limits"
        subtitle="Wallet and transaction caps per verification tier"
        action={<Button onClick={handleSave} loading={saving} disabled={!isSuperAdmin || changed.length === 0}>Save changes</Button>}
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/30">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Limits take effect immediately: the wallet cap blocks funding, the per-transaction and daily caps block purchases.
          Confirm real numbers with compliance before relying on them.{!isSuperAdmin && " Only super admins can change them."}
        </p>
      </div>

      {isLoading || !tiers ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading tier limits...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {tiers.map((t) => {
            const draft = drafts[t.tier] ?? { maxWalletBalance: t.maxWalletBalance, maxSingleTransaction: t.maxSingleTransaction, maxDailyTotal: t.maxDailyTotal };
            const fields: [keyof Draft, string][] = [["maxWalletBalance", "Max wallet balance"], ["maxSingleTransaction", "Max single transaction"], ["maxDailyTotal", "Max daily total"]];
            return (
              <Card key={t.tier}>
                <CardHeader>
                  <CardTitle className="capitalize">{t.tier.replace("tier", "Tier ")}</CardTitle>
                  <CardDescription>Last updated {fmtDateTime(t.updatedAt)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {fields.map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                      <Label>{label}</Label>
                      <Input type="number" min={0} disabled={!isSuperAdmin} value={draft[key]} onChange={(e) => updateDraft(t.tier, { [key]: Number(e.target.value) })} leftIcon={<span className="text-sm font-semibold">₦</span>} />
                    </div>
                  ))}
                  <p className="text-xs text-ink-400 dark:text-paper-200/40">
                    Currently: wallet cap {formatNaira(t.maxWalletBalance)}, per-tx cap {formatNaira(t.maxSingleTransaction)}, daily cap {formatNaira(t.maxDailyTotal)}
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
