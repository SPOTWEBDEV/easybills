"use client";

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
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

interface TopReferrer {
  id: string;
  name: string;
  invites: number;
  earned: number;
  lastReferral: string;
}

const topReferrers: TopReferrer[] = [
  { id: "t1", name: "Ngozi Adeyemi", invites: 24, earned: 12000, lastReferral: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "t2", name: "Tunde Bakare", invites: 19, earned: 9500, lastReferral: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "t3", name: "Blessing Eze", invites: 15, earned: 7500, lastReferral: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "t4", name: "Emeka Nwosu", invites: 11, earned: 5500, lastReferral: new Date(Date.now() - 8 * 86400000).toISOString() },
];

const columns: Column<TopReferrer>[] = [
  { key: "name", header: "User", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "invites", header: "Successful invites", render: (r) => r.invites.toString() },
  { key: "earned", header: "Total earned", render: (r) => formatNaira(r.earned) },
  { key: "lastReferral", header: "Last referral", render: (r) => formatDate(r.lastReferral) },
];

export default function AdminReferralProgramPage() {
  const handleSave = () => toast.success("Referral program settings saved");

  return (
    <AdminShell>
      <AdminPageHeading title="Referral Program" subtitle="Configure and monitor the user referral program" action={<Button onClick={handleSave}>Save changes</Button>} />

      <PreviewDataBanner feature="Referral Program" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total referrals" value="4,812" change={14.2} icon={Users} />
        <AdminStatCard label="Rewards paid out" value={formatNaira(2_406_000, { compact: true })} change={9.8} icon={Gift} />
        <AdminStatCard label="Conversion rate" value="38%" change={2.1} icon={TrendingUp} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Program settings</CardTitle>
          <CardDescription>Reward given to both the referrer and the new user.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Referrer reward</Label>
            <Input type="number" defaultValue={500} leftIcon={<span className="text-sm font-semibold">₦</span>} />
          </div>
          <div className="space-y-1.5">
            <Label>New user reward</Label>
            <Input type="number" defaultValue={200} leftIcon={<span className="text-sm font-semibold">₦</span>} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Reward trigger</Label>
            <Input defaultValue="After referred user's first successful purchase" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-600 dark:text-paper-200/60">Top referrers</h2>
        <AdminDataTable columns={columns} data={topReferrers} searchKeys={["name"]} searchPlaceholder="Search referrers..." />
      </div>
    </AdminShell>
  );
}
