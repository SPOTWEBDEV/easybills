"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Table2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminPricingApi, AdminPricingRow } from "@/lib/api/admin/pricing";
import { formatDate } from "@/lib/utils";

// How the margin actually behaves per category, per the API reference —
// no fabricated numbers, just the documented mechanic so an admin knows
// what setting this margin will actually do.
const MARGIN_BEHAVIOR: Record<string, string> = {
  airtime: "Added on top of what the customer requests, as a separate visible fee. The provider still receives only the original amount.",
  electricity: "Added on top of what the customer requests, as a separate visible fee. The provider still receives only the original amount.",
  data: "Baked invisibly into the customer-facing price at catalog fetch time. Wholesale cost is never shown to the customer.",
  cable: "Baked invisibly into the customer-facing price at catalog fetch time. Wholesale cost is never shown to the customer.",
  "exam-pin": "Baked invisibly into the customer-facing price at catalog fetch time. Wholesale cost is never shown to the customer.",
  flight: "Baked invisibly into the customer-facing price at catalog fetch time. Wholesale cost is never shown to the customer.",
  "gift-card": "Works backwards from every other category — deducted as commission from the Sogo Africa sell payout, not added to a purchase.",
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
        subtitle="Set the margin EasyBills adds per category"
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800"
            >
              <Table2 className="h-4 w-4" />
              View as table
            </Link>
            <Button onClick={handleSave} loading={saving}>Save changes</Button>
          </div>
        }
      />

      {isLoading || !rules ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading pricing rules...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rules.map((rule) => {
            const draft = drafts[rule.id] ?? { marginType: rule.marginType, marginValue: rule.marginValue };
            return (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle className="capitalize">{rule.service.replace(/-/g, " ")}</CardTitle>
                  <CardDescription>Last updated {formatDate(rule.updatedAt)}</CardDescription>
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

                  <p className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500 dark:bg-ink-900 dark:text-paper-200/50">
                    {MARGIN_BEHAVIOR[rule.service] ?? "Applied per the pricing engine's rules for this category."}
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