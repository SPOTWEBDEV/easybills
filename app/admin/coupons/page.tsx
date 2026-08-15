"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { adminCouponsApi, AdminCouponRow } from "@/lib/api/admin/coupons";
import { formatDate } from "@/lib/utils";
import { Ticket, CheckCircle2, Clock, Plus } from "lucide-react";

const columns: Column<AdminCouponRow>[] = [
  { key: "code", header: "Code", render: (c) => <span className="font-mono font-semibold">{c.code}</span> },
  { key: "discountType", header: "Discount", render: (c) => (c.discountType === "percentage" ? `${c.value}%` : `₦${c.value}`) },
  {
    key: "used",
    header: "Usage",
    render: (c) => (
      <div className="w-32">
        <div className="mb-1 flex justify-between text-[11px] text-ink-500 dark:text-paper-200/40">
          <span>{c.used}</span>
          <span>{c.usageLimit}</span>
        </div>
        <Progress value={c.usageLimit > 0 ? (c.used / c.usageLimit) * 100 : 0} />
      </div>
    ),
  },
  { key: "expiresAt", header: "Expires", render: (c) => formatDate(c.expiresAt) },
  { key: "status", header: "Status", render: (c) => <StatusPill status={c.status} /> },
];

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const { data: coupons, isLoading } = useQuery({ queryKey: ["admin-coupons"], queryFn: adminCouponsApi.list });
  const list = coupons ?? [];

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "fixed" as "fixed" | "percentage",
    value: 500,
    usageLimit: 100,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  const active = list.filter((c) => c.status === "active").length;
  const totalUses = list.reduce((s, c) => s + c.used, 0);

  const handleCreate = async () => {
    if (!form.code.trim()) {
      toast.error("Enter a coupon code.");
      return;
    }
    setSaving(true);
    try {
      await adminCouponsApi.create(form);
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created");
      setOpen(false);
      setForm({ code: "", discountType: "fixed", value: 500, usageLimit: 100, expiresAt: form.expiresAt });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <AdminPageHeading
        title="Coupons"
        subtitle="Promo codes and discounts"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Create coupon
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total coupons" value={list.length.toString()} icon={Ticket} />
        <AdminStatCard label="Active" value={active.toString()} icon={CheckCircle2} />
        <AdminStatCard label="Total redemptions" value={totalUses.toLocaleString()} icon={Clock} />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading coupons...</p>
        ) : (
          <AdminDataTable columns={columns} data={list} searchKeys={["code"]} searchPlaceholder="Search coupon codes..." />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
            <DialogDescription>This saves directly to the live coupons table.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                placeholder="WELCOME500"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="flex items-center gap-2">
              {(["fixed", "percentage"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, discountType: t }))}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    form.discountType === t ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 dark:border-ink-700"
                  }`}
                >
                  {t === "fixed" ? "Fixed (₦)" : "Percentage (%)"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Usage limit</Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expires</Label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="h-11 w-full rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleCreate}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
