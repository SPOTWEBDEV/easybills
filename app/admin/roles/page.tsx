"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminRoles } from "@/lib/mock-data/admin";
import { Plus, Users } from "lucide-react";

export default function AdminRolesPage() {
  return (
    <AdminShell>
      <AdminPageHeading
        title="Roles & Permissions"
        subtitle="Control what each admin team member can see and do"
        action={
          <Button onClick={() => toast("New role form would open here")}>
            <Plus className="h-4 w-4" /> New role
          </Button>
        }
      />
      <PreviewDataBanner feature="Roles & Permissions" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {adminRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{role.name}</CardTitle>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 dark:text-paper-200/40">
                  <Users className="h-3.5 w-3.5" /> {role.usersCount}
                </span>
              </div>
              <CardDescription>{role.usersCount} team member{role.usersCount !== 1 ? "s" : ""} assigned</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5 pt-2">
              {role.permissions.map((perm) => (
                <Badge key={perm} variant="neutral">
                  {perm}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
