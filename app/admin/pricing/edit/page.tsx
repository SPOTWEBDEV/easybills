"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Info, Table2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/hooks/use-admin-role";
import { adminPricingApi } from "@/lib/api/admin/pricing";
import { NOT_APPLIED_SERVICES, USD_PRICED_SERVICES, fmtDateTime, serviceLabel } from "@/lib/admin-format";

type Draft = { marginType: "fixed" | "percentage"; marginValue: number };

export default function AdminProfitSettingsPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminRole();
  const { data: rules, isLoading } = useQuery({ queryKey: ["admin-pricing"], queryFn: adminPricingApi.list });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!rules) return;
    const next: Record<string, Draft> = {};
    for (const rule of rules) next[rule.id] = { marginType: rule.marginType, marginValue: rule.marginValue };
    setDrafts(next);
  }, [rules]);

  const updateDraft = (id: string, patch: Partial<Draft>) => setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const changedRules = (rules ?? []).filter((r) => {
    const d = drafts[r.id];
    return d && !NOT_APPLIED_SERVICES.includes(r.service) && (d.marginType !== r.marginType || d.marginValue !== r.marginValue);
  });

  const handleSave = async () => {
    if (changedRules.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(changedRules.map((r) => adminPricingApi.update(r.id, drafts[r.id].marginType, drafts[r.id].marginValue)));
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success(`${changedRules.length} margin${changedRules.length === 1 ? "" : "s"} saved — applied to new prices immediately`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes.");
    } finally { setSaving(false); }
  };

  return (
    <AdminShell>
      <AdminPageHeading
        title="Profit Settings"
        subtitle="Set the margin EasyBills adds per category"
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/pricing" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800">
              <Table2 className="h-4 w-4" />
              View as table
            </Link>
            <Button onClick={handleSave} loading={saving} disabled={!isSuperAdmin || changedRules.length === 0}>
              Save changes{changedRules.length > 0 ? ` (${changedRules.length})` : ""}
            </Button>
          </div>
        }
      />

      {!isSuperAdmin && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> Only super admins can change margins. You can view the current values.
        </div>
      )}

      {isLoading || !rules ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading pricing rules...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rules.map((rule) => {
            const draft = drafts[rule.id] ?? { marginType: rule.marginType, marginValue: rule.marginValue };
            const notApplied = NOT_APPLIED_SERVICES.includes(rule.service);
            const locked = notApplied || !isSuperAdmin;
            return (
              <Card key={rule.id} className={notApplied ? "opacity-70" : ""}>
                <CardHeader>
                  <CardTitle>{serviceLabel(rule.service)}</CardTitle>
                  <CardDescription>Last updated {fmtDateTime(rule.updatedAt)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {notApplied && (
                    <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                      Not applied: for this service the customer currently pays exactly the amount they enter, so this margin has no effect.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {(["fixed", "percentage"] as const).map((mode) => (
                      <button key={mode} disabled={locked} onClick={() => updateDraft(rule.id, { marginType: mode })}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${draft.marginType === mode ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 dark:border-ink-700"}`}>
                        {mode === "fixed" ? "Fixed amount (₦)" : "Percentage (%)"}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Margin {draft.marginType === "fixed" ? "amount" : "percentage"}</Label>
                    <Input type="number" min={0} disabled={locked} value={draft.marginValue}
                      onChange={(e) => updateDraft(rule.id, { marginValue: Number(e.target.value) })}
                      leftIcon={<span className="text-sm font-semibold">{draft.marginType === "fixed" ? "₦" : "%"}</span>} />
                  </div>
                  <p className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500 dark:bg-ink-900 dark:text-paper-200/50">
                    Percentage adds that % on top of the provider&apos;s cost; fixed adds a flat ₦ amount. Changes apply immediately to new prices.
                    {USD_PRICED_SERVICES.includes(rule.service) && " This service is also priced from the USD rate on the FX Rates page."}
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
