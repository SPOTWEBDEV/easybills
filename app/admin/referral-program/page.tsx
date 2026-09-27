"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Gift, TrendingUp } from "lucide-react";
import { formatDate, formatNaira } from "@/lib/utils";
import { adminReferralProgramApi } from "@/lib/api/admin/referral-program";

interface TopReferrer {
  id: string;
  name: string;
  invites: number;
  earned: number;
  lastReferral: string;
}

const columns: Column<TopReferrer>[] = [
  { key: "name", header: "User", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "invites", header: "Successful invites", render: (r) => r.invites.toString() },
  { key: "earned", header: "Total earned", render: (r) => formatNaira(r.earned) },
  { key: "lastReferral", header: "Last referral", render: (r) => formatDate(r.lastReferral) },
];

export default function AdminReferralProgramPage() {
  const queryClient = useQueryClient();
  const { data: overview, isLoading } = useQuery({
    queryKey: ["admin-referral-program"],
    queryFn: adminReferralProgramApi.overview,
  });

  const [referrerReward, setReferrerReward] = useState(0);
  const [referredReward, setReferredReward] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (overview) {
      setReferrerReward(overview.settings.referrerReward);
      setReferredReward(overview.settings.referredReward);
    }
  }, [overview]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminReferralProgramApi.updateSettings({ referrerReward, referredReward });
      queryClient.invalidateQueries({ queryKey: ["admin-referral-program"] });
      toast.success("Referral program settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <AdminPageHeading title="Referral Program" subtitle="Configure and monitor the user referral program" action={<Button onClick={handleSave} loading={saving}>Save changes</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total referrals" value={overview ? overview.stats.totalReferrals.toString() : "—"} icon={Users} />
        <AdminStatCard label="Rewards paid out" value={overview ? formatNaira(overview.stats.rewardsPaidOut, { compact: true }) : "—"} icon={Gift} />
        <AdminStatCard label="Conversion rate" value={overview ? `${overview.stats.conversionRate}%` : "—"} icon={TrendingUp} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Program settings</CardTitle>
          <CardDescription>Reward given to both the referrer and the new user. This is live — it affects real payouts immediately.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Referrer reward</Label>
            <Input
              type="number"
              value={referrerReward}
              onChange={(e) => setReferrerReward(Number(e.target.value))}
              leftIcon={<span className="text-sm font-semibold">₦</span>}
            />
          </div>
          <div className="space-y-1.5">
            <Label>New user reward</Label>
            <Input
              type="number"
              value={referredReward}
              onChange={(e) => setReferredReward(Number(e.target.value))}
              leftIcon={<span className="text-sm font-semibold">₦</span>}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Reward trigger</Label>
            <Input value={overview?.settings.rewardTrigger ?? ""} disabled />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-600 dark:text-paper-200/60">Top referrers</h2>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading...</p>
        ) : !overview || overview.topReferrers.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">No referrals yet.</p>
        ) : (
          <AdminDataTable columns={columns} data={overview.topReferrers} searchKeys={["name"]} searchPlaceholder="Search referrers..." />
        )}
      </div>
    </AdminShell>
  );
}