"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, User, IdCard, Database } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/status-pill";
import { adminKycApi } from "@/lib/api/admin/kyc";
import { formatDate } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-3 last:border-0 dark:border-ink-800">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-paper-200/40">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function AdminKycApplicationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [revealed, setRevealed] = useState(false);
  const [decliningReason, setDecliningReason] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: app, isLoading } = useQuery({
    queryKey: ["admin-kyc-application", id],
    queryFn: () => adminKycApi.getApplication(id),
  });

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await adminKycApi.approveApplication(id);
      toast.success(`Approved — customer moved to ${res.tier}`);
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-application", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-applications"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (decliningReason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters — the customer sees this verbatim.");
      return;
    }
    setSubmitting(true);
    try {
      await adminKycApi.declineApplication(id, decliningReason.trim());
      toast.success("Application declined");
      setShowDeclineForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-application", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-applications"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not decline application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <button
        onClick={() => router.push("/admin/kyc")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-paper-200/50 dark:hover:text-paper-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to KYC
      </button>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading application...</p>
      ) : !app ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Application not found.</p>
      ) : (
        <>
          <AdminPageHeading
            title={`${app.type.toUpperCase()} verification — ${app.accountHolder.fullName}`}
            subtitle={`Submitted ${formatDate(app.createdAt)}`}
          />

          <Card className="mb-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <StatusPill status={app.status} />
              {app.status === "pending" && !showDeclineForm && (
                <div className="flex items-center gap-2">
                  <Button variant="danger" onClick={() => setShowDeclineForm(true)} disabled={submitting}>
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Decline
                  </Button>
                  <Button onClick={handleApprove} loading={submitting}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>

            {app.status === "declined" && app.declineReason && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/40 dark:bg-red-950/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Decline reason</p>
                <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">{app.declineReason}</p>
              </div>
            )}

            {showDeclineForm && (
              <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <label className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-paper-200/40">
                  Reason (shown verbatim to the customer, 3–255 characters)
                </label>
                <textarea
                  value={decliningReason}
                  onChange={(e) => setDecliningReason(e.target.value)}
                  maxLength={255}
                  rows={3}
                  className="w-full rounded-lg border border-ink-200 bg-transparent p-2.5 text-sm dark:border-ink-700"
                  placeholder="e.g. The submitted NIN does not match the name on file"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDeclineForm(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button variant="secondary" onClick={handleDecline} loading={submitting}>
                    Confirm decline
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4 text-ink-400" />
                Account holder
              </div>
              <DetailRow label="Full name" value={app.accountHolder.fullName} />
              <DetailRow label="Email" value={app.accountHolder.email} />
              <DetailRow label="Phone" value={app.accountHolder.phone} />
              <DetailRow label="Date of birth" value={formatDate(app.dateOfBirth)} />
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <IdCard className="h-4 w-4 text-ink-400" />
                Submitted ID
              </div>
              <DetailRow label="Type" value={<span className="uppercase">{app.type}</span>} />
              <DetailRow
                label={app.type.toUpperCase()}
                value={
                  <button
                    onClick={() => setRevealed((r) => !r)}
                    className="inline-flex items-center gap-1.5 font-mono text-sm"
                  >
                    {revealed ? app.idNumber : "•".repeat(app.idNumber.length)}
                    {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                }
              />
              <DetailRow label="Reviewed" value={app.reviewedAt ? formatDate(app.reviewedAt) : "Not yet reviewed"} />
              <p className="mt-3 text-xs text-ink-400 dark:text-paper-200/40">
                This decrypted ID number is only ever shown here. This view is audit-logged.
              </p>
            </Card>

            {app.bureauSnapshot != null && (
              <Card className="p-5 sm:col-span-2">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Database className="h-4 w-4 text-ink-400" />
                  Bureau snapshot
                </div>
                <pre className="overflow-x-auto rounded-lg bg-ink-50 p-3 text-xs dark:bg-ink-900">
                  {JSON.stringify(app.bureauSnapshot, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}