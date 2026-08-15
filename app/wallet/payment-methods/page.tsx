"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Landmark, Wallet2, Plus, Trash2, Copy } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { maskAccount } from "@/lib/utils";

interface SavedCard {
  id: string;
  brand: "Visa" | "Mastercard" | "Verve";
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const { data: wallet } = useWallet();
  const [cards, setCards] = useState<SavedCard[]>([
    { id: "card_1", brand: "Verve", last4: "4471", expiry: "09/28", isDefault: true },
    { id: "card_2", brand: "Mastercard", last4: "2210", expiry: "03/27", isDefault: false },
  ]);

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.success("Card removed");
  };

  const setDefault = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    toast.success("Default card updated");
  };

  const copyAccount = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.accountNumber);
    toast.success("Account number copied");
  };

  return (
    <AppShell>
      <PageHeader title="Payment Methods" subtitle="Cards, bank transfer, and your virtual account" />

      <div className="space-y-5 px-5 pt-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <CreditCard className="h-4 w-4" />
                </span>
                <CardTitle>Saved cards</CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast("Add card form would open here")}>
                <Plus className="h-3.5 w-3.5" /> Add card
              </Button>
            </div>
            <CardDescription>Used for quick wallet top-ups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {cards.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-500 dark:text-paper-200/40">No saved cards yet.</p>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-ink-900 dark:bg-ink-700 text-[10px] font-bold uppercase text-white">
                      {card.brand}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">•••• {card.last4}</p>
                      <p className="text-xs text-ink-500 dark:text-paper-200/40">Expires {card.expiry}</p>
                    </div>
                    {card.isDefault && <Badge variant="brand">Default</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    {!card.isDefault && (
                      <Button size="sm" variant="ghost" onClick={() => setDefault(card.id)}>
                        Set default
                      </Button>
                    )}
                    <button
                      onClick={() => removeCard(card.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10"
                      aria-label="Remove card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                <Wallet2 className="h-4 w-4" />
              </span>
              <CardTitle>Dedicated virtual account</CardTitle>
            </div>
            <CardDescription>Transfer here any time to fund your wallet instantly.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {wallet ? (
              <div className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4">
                <div>
                  <p className="font-display text-lg font-bold tabular-nums">{wallet.accountNumber}</p>
                  <p className="text-sm text-ink-600 dark:text-paper-200/60">
                    {wallet.bankName} &middot; {wallet.accountName}
                  </p>
                </div>
                <button
                  onClick={copyAccount}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800"
                  aria-label="Copy account number"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink-500 dark:text-paper-200/40">Loading...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-500">
                <Landmark className="h-4 w-4" />
              </span>
              <CardTitle>Linked withdrawal bank</CardTitle>
            </div>
            <CardDescription>Where your withdrawals are sent by default.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-4">
              <div>
                <p className="text-sm font-semibold">GTBank</p>
                <p className="text-xs text-ink-500 dark:text-paper-200/40">{maskAccount("0123456789")}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast("Bank change form would open here")}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
