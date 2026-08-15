"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminPricingApi, AdminPricingRow } from "@/lib/api/admin/pricing";
import { formatNaira } from "@/lib/utils";

// Illustrative wholesale cost per category, used only to render the live
// "customer pays" preview below — the real margin type/value IS the live
// data from the backend's pricing_rules table.
const EXAMPLE_COST: Record<string, number> = {
  airtime: 980,
  data: 1380,
  electricity: 10000,
  cable: 18950,
  "exam-pin": 3400,
};

export default function AdminProfitSettingsPage() {
  const queryClient = useQueryClient();
  const { data: rules, isLoading } = useQuery({ queryKey: ["admin-pricing"], queryFn: adminPricingApi.list });
  const [drafts, setDrafts] = useState<Record<string, { marginType: "fixed" | "percentage"; marginValue: number }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!rules) return;
    const next: typeof drafts = {};
    for (const rule of rules) {
      next[rule.id] = { marginType: rule.marginType, marginValue: rule.marginValue };
    }
    setDrafts(next);
  }, [rules]);

  const updateDraft = (id: string, patch: Partial<{ marginType: "fixed" | "percentage"; marginValue: number }>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const computeSellPrice = (category: string, draft: { marginType: string; marginValue: number }) => {
    const cost = EXAMPLE_COST[category] ?? 1000;
    return draft.marginType === "fixed" ? cost + draft.marginValue : cost * (1 + draft.marginValue / 100);
  };

  const handleSave = async () => {
    if (!rules) return;
    setSaving(true);
    try {
      await Promise.all(
        rules.map((rule) => {
          const draft = drafts[rule.id];
          if (!draft) return Promise.resolve();
          return adminPricingApi.update(rule.id, draft.marginType, draft.marginValue);
        })
      );
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success("Profit margins saved — applied to all future purchases");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <AdminPageHeading
        title="Profit Settings"
        subtitle="Set the margin EasyBills adds on top of wholesale provider cost, per category"
        action={<Button onClick={handleSave} loading={saving}>Save changes</Button>}
      />

      {isLoading || !rules ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading pricing rules...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rules.map((rule) => {
            const draft = drafts[rule.id] ?? { marginType: rule.marginType, marginValue: rule.marginValue };
            const exampleCost = EXAMPLE_COST[rule.service] ?? 1000;
            const sellPrice = computeSellPrice(rule.service, draft);
            return (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle className="capitalize">{rule.service.replace(/-/g, " ")}</CardTitle>
                  <CardDescription>Wholesale cost example: {formatNaira(exampleCost)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    {(["fixed", "percentage"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateDraft(rule.id, { marginType: mode })}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          draft.marginType === mode
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-ink-200 dark:border-ink-700"
                        }`}
                      >
                        {mode === "fixed" ? "Fixed amount (₦)" : "Percentage (%)"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Margin {draft.marginType === "fixed" ? "amount" : "percentage"}</Label>
                    <Input
                      type="number"
                      value={draft.marginValue}
                      onChange={(e) => updateDraft(rule.id, { marginValue: Number(e.target.value) })}
                      leftIcon={<span className="text-sm font-semibold">{draft.marginType === "fixed" ? "₦" : "%"}</span>}
                    />
                  </div>

                  <div className="rounded-2xl bg-ink-50 dark:bg-ink-900 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-600 dark:text-paper-200/60">Wholesale cost</span>
                      <span className="font-mono font-semibold">{formatNaira(exampleCost)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-sm">
                      <span className="text-ink-600 dark:text-paper-200/60">Your margin</span>
                      <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                        + {formatNaira(sellPrice - exampleCost)}
                      </span>
                    </div>
                    <div className="mt-2 border-t border-ink-200 dark:border-ink-700 pt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">Customer pays</span>
                      <span className="font-mono text-base font-bold">{formatNaira(sellPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
