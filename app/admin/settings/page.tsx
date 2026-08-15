"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const handleSave = () => toast.success("Settings saved");

  return (
    <AdminShell>
      <AdminPageHeading title="Settings" subtitle="Configure how EasyBills runs" action={<Button onClick={handleSave}>Save changes</Button>} />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="sms">SMS Templates</TabsTrigger>
          <TabsTrigger value="push">Push Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Site information</CardTitle>
              <CardDescription>Basic details shown across the platform</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Platform name</Label>
                <Input defaultValue="EasyBills" />
              </div>
              <div className="space-y-1.5">
                <Label>Support email</Label>
                <Input defaultValue="support@easybills.example" />
              </div>
              <div className="space-y-1.5">
                <Label>Default currency</Label>
                <Input defaultValue="NGN (₦)" />
              </div>
              <div className="space-y-1.5">
                <Label>Support phone</Label>
                <Input defaultValue="+234 800 000 0000" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4 sm:col-span-2">
                <div>
                  <p className="text-sm font-semibold">Maintenance mode</p>
                  <p className="text-xs text-ink-500 dark:text-paper-200/40">Temporarily disable purchases platform-wide</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email templates</CardTitle>
              <CardDescription>Sent for OTPs, receipts, and account alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {["Welcome email", "OTP verification", "Transaction receipt", "Password reset"].map((tpl) => (
                <div key={tpl} className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4">
                  <p className="text-sm font-semibold">{tpl}</p>
                  <Button size="sm" variant="outline" onClick={() => toast(`${tpl} editor would open here`)}>
                    Edit template
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS templates</CardTitle>
              <CardDescription>Sent for OTPs and critical account alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {["OTP code", "Successful transaction", "Suspicious login alert"].map((tpl) => (
                <div key={tpl} className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4">
                  <p className="text-sm font-semibold">{tpl}</p>
                  <Button size="sm" variant="outline" onClick={() => toast(`${tpl} editor would open here`)}>
                    Edit template
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle>Push notification defaults</CardTitle>
              <CardDescription>Control which push categories are enabled by default</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {["Transaction alerts", "Promotions & cashback", "Product announcements"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4">
                  <p className="text-sm font-semibold">{item}</p>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
