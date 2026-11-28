"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Info } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminRole } from "@/hooks/use-admin-role";
import { adminFxRatesApi, type FxRateRow } from "@/lib/api/admin/fx-rates";
import { ageInDays, fmtDateTime } from "@/lib/admin-format";
import { formatNaira } from "@/lib/utils";

const STALE_DAYS = 7; // warn when a rate hasn't been updated for this long

export default function AdminFxRatesPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminRole();
  const { data, isLoading } = useQuery({ queryKey: ["admin-fx-rates"], queryFn: adminFxRatesApi.list });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setDrafts(Object.fromEntries(data.map((r) => [r.currency, String(r.rateToNgn)])));
  }, [data]);

  const save = async (row: FxRateRow) => {
    const rate = Number(drafts[row.currency]);
    if (!Number.isFinite(rate) || rate <= 0) return toast.error("Enter a rate greater than zero.");
    setSaving(row.currency);
    try {
      await adminFxRatesApi.update(row.currency, rate);
      queryClient.invalidateQueries({ queryKey: ["admin-fx-rates"] });
      toast.success(`${row.currency} rate saved — new prices use it immediately`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save this rate."); }
    finally { setSaving(null); }
  };

  return (
    <AdminShell>
      <AdminPageHeading title="FX Rates" subtitle="Exchange rates used to price USD-based services in naira" />

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          The <strong>USD</strong> rate is critical: flights, gift cards, virtual numbers and virtual USD cards are all priced from it.
          A wrong or outdated rate means wrong prices on every one of them as soon as you save.
          {!isSuperAdmin && " Only super admins can change rates."}
        </p>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading rates...</p>
      ) : !data || data.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">No exchange rates configured.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {data.map((row) => {
            const age = ageInDays(row.updatedAt);
            const stale = age !== null && age > STALE_DAYS;
            const changed = drafts[row.currency] !== String(row.rateToNgn);
            return (
              <Card key={row.currency}>
                <CardHeader>
                  <CardTitle>{row.currency}</CardTitle>
                  <CardDescription>Last updated {fmtDateTime(row.updatedAt)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-3">
                  {stale && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      This rate is {Math.floor(age!)} days old. Check the market rate and update it.
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label>1 {row.currency} equals (₦)</Label>
                    <Input type="number" min={0} step="0.01" value={drafts[row.currency] ?? ""} disabled={!isSuperAdmin}
                      onChange={(e) => setDrafts((d) => ({ ...d, [row.currency]: e.target.value }))}
                      leftIcon={<span className="text-sm font-semibold">₦</span>} />
                  </div>
                  <p className="text-xs text-ink-500 dark:text-paper-200/40">Currently {formatNaira(row.rateToNgn)} per {row.currency}</p>
                  <Button onClick={() => save(row)} loading={saving === row.currency} disabled={!isSuperAdmin || !changed} className="w-full">
                    Save {row.currency} rate
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
