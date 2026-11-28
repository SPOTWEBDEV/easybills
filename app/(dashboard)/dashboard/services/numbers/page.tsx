"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Hash, Search } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FormField } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Box, Card, ErrorText, Loading, PillSelect, PillTabs, PrimaryButton } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { numbersApi, isPending, type AvailableNumber } from "@/lib/api/extra-services";
import { walletApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { friendlyError, goPending, handleActionError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { daysUntil, formatDate } from "@/lib/format";
import { cn, formatNaira } from "@/lib/utils";

export default function NumbersPage() {
  return (
    <FeatureGate enabled={FLAGS.numbers} title="Virtual Numbers" subtitle="Receive SMS and verification codes">
      <Numbers />
    </FeatureGate>
  );
}

function Numbers() {
  const [tab, setTab] = useState<"get" | "mine">("get");
  return (
    <div className="space-y-6">
      <SubPageHeader title="Virtual Numbers" subtitle="Receive SMS and verification codes" back="/dashboard/services" />
      <PillTabs items={[{ id: "get", label: "Get a number" }, { id: "mine", label: "My numbers" }]} value={tab} onChange={setTab} />
      {tab === "get" ? <GetNumber /> : <MyNumbers />}
    </div>
  );
}

function GetNumber() {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const countries = useApiData(() => numbersApi.countries());
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [contains, setContains] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ monthlyPrice: number; data: AvailableNumber[] } | null>(null);
  const [chosen, setChosen] = useState<AvailableNumber | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pick sensible defaults once the countries load (never hard-coded: the list comes from the API).
  useEffect(() => {
    const d = countries.data;
    if (!d) return;
    if (!country && d.data.length) setCountry(d.data.includes("US") ? "US" : d.data[0]);
    if (!type && d.types.length) setType(d.types[0]);
  }, [countries.data, country, type]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !type) return;
    setError(null); setSearching(true); setChosen(null); setResults(null);
    try {
      const r = await numbersApi.search({ country, type, areaCode: areaCode.trim() || undefined, contains: contains.trim() || undefined });
      setResults({ monthlyPrice: r.monthlyPrice, data: r.data });
    } catch (err) { setError(friendlyError(err)); }
    finally { setSearching(false); }
  };

  const onBuy = async () => {
    if (!chosen) return;
    setError(null); setBuying(true);
    try {
      const r = await purchaseWithPinRetry((pin) => numbersApi.buy({ phoneNumber: chosen.phoneNumber, country, type, transactionPin: pin }), requestPin);
      if (r === null) return;
      if (isPending(r)) return goPending(router, { message: r.message ?? "Setting up your number. It will appear in My numbers shortly." }, "Setting up your number");
      router.replace(`/dashboard/services/numbers/${r.number.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 502) {
        setChosen(null);
        setError("We couldn't get this number. It may have just been taken. Your wallet has been refunded, so please pick another.");
      } else handleActionError(err, router, setError, { purchase: true });
    } finally { setBuying(false); }
  };

  if (countries.loading) return <Loading />;
  if (countries.error || !countries.data) return <ErrorText>{friendlyError(countries.error)}</ErrorText>;

  return (
    <div className="space-y-6">
      <form onSubmit={onSearch} className="space-y-4" noValidate>
        <PillSelect label="Country" value={country} onChange={setCountry} options={countries.data.data.map((c) => ({ value: c, label: c }))} />
        <PillSelect label="Number type" value={type} onChange={setType} options={countries.data.types.map((t) => ({ value: t, label: t }))} />
        <FormField label="Area code (optional)" icon={Hash} inputMode="numeric" placeholder="415" maxLength={5} value={areaCode} onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ""))} />
        <FormField label="Contains digits (optional)" icon={Search} inputMode="numeric" placeholder="777" maxLength={7} value={contains} onChange={(e) => setContains(e.target.value.replace(/\D/g, ""))} />
        <PrimaryButton type="submit" loading={searching}>Search numbers</PrimaryButton>
      </form>

      <ErrorText>{error}</ErrorText>

      {results && (
        results.data.length === 0 ? <Box>No numbers found. Try different options.</Box> : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-brand-500">{formatNaira(results.monthlyPrice)} / month</p>
            <div role="radiogroup" aria-label="Available numbers" className="space-y-2">
              {results.data.map((n) => (
                <button key={n.phoneNumber} type="button" role="radio" aria-checked={chosen?.phoneNumber === n.phoneNumber} onClick={() => setChosen(n)}
                  className={cn("flex w-full items-center justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-left", chosen?.phoneNumber === n.phoneNumber && "border-brand-500 bg-brand-500/5")}>
                  <div>
                    <p className="font-bold">{n.friendlyName || n.phoneNumber}</p>
                    <p className="text-xs text-[rgb(var(--fg-muted))]">{[n.locality, n.region].filter(Boolean).join(", ") || country}</p>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--fg-muted))]">{n.capabilities?.SMS ? "SMS" : ""}</span>
                </button>
              ))}
            </div>
            {chosen && (
              <Card className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <p className="text-[rgb(var(--fg-muted))]">
                    The first month ({formatNaira(results.monthlyPrice)}) is charged now. After that your wallet is charged automatically every 30 days.
                    If the wallet is short, <b>the number is released and lost after 3 days overdue</b>. This number can receive SMS only (no calls).
                  </p>
                </div>
                <PrimaryButton onClick={onBuy} loading={buying}>Buy {chosen.friendlyName || chosen.phoneNumber}</PrimaryButton>
              </Card>
            )}
          </div>
        )
      )}
    </div>
  );
}

function MyNumbers() {
  const nums = useApiData(() => numbersApi.list());
  const wallet = useApiData(() => walletApi.get());
  if (nums.loading) return <Loading />;
  if (nums.error) return <ErrorText>{friendlyError(nums.error)}</ErrorText>;
  const list = nums.data ?? [];
  if (list.length === 0) return <Box>You don&apos;t have any numbers yet</Box>;
  return (
    <div className="space-y-3">
      {list.map((n) => {
        const left = daysUntil(n.renewsAt);
        const atRisk = left !== null && left <= 3 && (wallet.data?.balance ?? Infinity) < n.monthlyPrice;
        return (
          <Link key={n.id} href={`/dashboard/services/numbers/${n.id}`} className="block rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 transition-colors hover:border-brand-500/50">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold">{n.phoneNumber}</p>
              <span className="text-xs font-semibold text-[rgb(var(--fg-muted))]">{n.country} · {n.type}</span>
            </div>
            <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">Renews on {formatDate(n.renewsAt)} · {formatNaira(n.monthlyPrice)}/month</p>
            {atRisk && <p className="mt-2 text-xs font-semibold text-red-500">Renews soon and your wallet is too low. Fund it to keep this number.</p>}
          </Link>
        );
      })}
    </div>
  );
}
