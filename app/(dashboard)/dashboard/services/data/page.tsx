"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { NetworkPicker } from "@/components/dashboard/network-picker";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { useApiData } from "@/hooks/use-api-data";
import { dataApi, type DataPlan } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { dataPurchaseSchema } from "@/lib/validators/schemas";
import { cn, formatNaira } from "@/lib/utils";

// The backend's own "category" is a best-effort guess, so plans are classified client-side (same as the app).
type Period = "daily" | "weekly" | "monthly" | "yearly" | "other";
function classifyPlan(p: DataPlan): { period: Period; isSocial: boolean } {
  const h = `${p.label ?? ""} ${p.validity ?? ""} ${p.datatype ?? ""}`.toLowerCase();
  const isSocial = /(social|youtube|whatsapp|facebook|instagram|tiktok|twitter|telegram)/.test(h);
  if (/\byear(ly)?\b/.test(h)) return { period: "yearly", isSocial };
  if (/\bmonth(ly)?\b/.test(h)) return { period: "monthly", isSocial };
  if (/\bweek(ly)?\b/.test(h)) return { period: "weekly", isSocial };
  const m = h.match(/(\d+)\s*day/);
  if (m) { const d = parseInt(m[1], 10); return { period: d >= 28 ? "monthly" : d >= 7 ? "weekly" : "daily", isSocial }; }
  if (/\bdaily\b/.test(h)) return { period: "daily", isSocial };
  return { period: "other", isSocial };
}
type TabId = "all" | "social" | "daily" | "weekly" | "monthly" | "yearly";
const TAB_ORDER: TabId[] = ["all", "social", "daily", "weekly", "monthly", "yearly"];
const TAB_LABELS: Record<TabId, string> = { all: "All", social: "Social", daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

export default function BuyDataPage() {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const providers = useApiData(() => dataApi.providers());
  const [network, setNetwork] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const plansQuery = useApiData(() => (network ? dataApi.plans(network) : Promise.resolve([] as DataPlan[])), [network]);
  const classified = useMemo(() => (plansQuery.data ?? []).map((plan) => ({ plan, ...classifyPlan(plan) })), [plansQuery.data]);
  const availableTabs = useMemo(() => TAB_ORDER.filter((t) =>
    t === "all" ? classified.some((c) => c.period === "other") : t === "social" ? classified.some((c) => c.isSocial) : classified.some((c) => c.period === t)), [classified]);
  const activeTab: TabId | null = tab && availableTabs.includes(tab) ? tab : availableTabs[0] ?? null;
  const shown = useMemo(() => {
    if (!activeTab) return [];
    return classified.filter((c) => activeTab === "all" ? c.period === "other" : activeTab === "social" ? c.isSocial : c.period === activeTab).map((c) => c.plan);
  }, [classified, activeTab]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = dataPurchaseSchema.safeParse({ providerId: network ?? "", planId: planId ?? "", phone: phone.trim() });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
      return setErrors(next);
    }
    setErrors({}); setLoading(true);
    try {
      const r = await purchaseWithPinRetry((pin) => dataApi.purchase({ ...parsed.data, transactionPin: pin }), requestPin);
      if (r === null) return;
      router.replace("/dashboard/payment-status?status=success");
    } catch (err) { setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Please try again." }); }
    finally { setLoading(false); }
  };

  const label = "text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]";
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <SubPageHeader title="Buy Data" subtitle="Affordable bundles for every network" />
      <div className="space-y-3">
        <p className={label}>Network</p>
        {providers.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading networks…</p>
          : <NetworkPicker providers={providers.data ?? []} value={network} onChange={(id) => { setNetwork(id); setPlanId(null); setTab(null); }} />}
        {errors.providerId && <p className="text-xs text-red-500">{errors.providerId}</p>}
      </div>
      <FormField label="Phone number" icon={Phone} type="tel" inputMode="numeric" maxLength={11} placeholder="08034567890" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />

      <div className="space-y-3">
        <p className={label}>Select a plan</p>
        {network && !plansQuery.loading && availableTabs.length > 0 && (
          <div role="tablist" className="no-scrollbar flex gap-2 overflow-x-auto">
            {availableTabs.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={activeTab === t} onClick={() => setTab(t)}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", activeTab === t ? "border-brand-500 bg-brand-500 text-white" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]")}>{TAB_LABELS[t]}</button>
            ))}
          </div>
        )}
        {!network ? <Box>Choose a network to see available plans</Box>
          : plansQuery.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading plans…</p>
          : (plansQuery.data ?? []).length === 0 ? <Box>No plans available for this network right now</Box>
          : shown.length === 0 ? <Box>No plans in this category</Box>
          : <div role="radiogroup" aria-label="Data plan" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shown.map((p) => (
                <button key={p.code} type="button" role="radio" aria-checked={planId === p.code} onClick={() => setPlanId(p.code)}
                  className={cn("rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-left", planId === p.code && "border-brand-500 bg-brand-500/5")}>
                  <p className="font-display text-base font-bold">{p.size}</p>
                  <p className="mb-2 mt-0.5 text-xs text-[rgb(var(--fg-muted))]">{p.validity}</p>
                  <p className="text-sm font-bold text-brand-500">{formatNaira(p.price)}</p>
                </button>
              ))}
            </div>}
        {errors.planId && <p className="text-xs text-red-500">{errors.planId}</p>}
      </div>
      {errors.form && <p className="text-center text-sm text-red-500">{errors.form}</p>}
      <SubmitButton loading={loading}>Continue</SubmitButton>
    </form>
  );
}
function Box({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed py-8 text-center text-sm text-[rgb(var(--fg-muted))]">{children}</div>;
}
