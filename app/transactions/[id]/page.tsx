"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Receipt } from "@/components/shared/receipt";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransaction } from "@/hooks/use-transactions";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: transaction, isLoading } = useTransaction(params.id);

  return (
    <AppShell>
      <PageHeader title="Transaction Details" />
      <div className="px-5 pt-4">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-3xl" />
        ) : !transaction ? (
          <p className="pt-10 text-center text-sm text-ink-500 dark:text-paper-200/40">
            Transaction not found.
          </p>
        ) : (
          <Receipt transaction={transaction} />
        )}
      </div>
    </AppShell>
  );
}
