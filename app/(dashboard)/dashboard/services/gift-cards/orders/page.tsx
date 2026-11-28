"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Badge, Box, Card, ErrorText, GhostButton, Loading, SecretValue, statusTone } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { giftcardsApi, type GiftCode, type GiftOrder } from "@/lib/api/extra-services";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { friendlyError, handleActionError } from "@/lib/action-helpers";
import { ApiError } from "@/lib/api-client";
import { FLAGS } from "@/lib/feature-flags";
import { formatDateTime, formatMoney } from "@/lib/format";
import { formatNaira } from "@/lib/utils";

export default function GiftCardOrdersPage() {
  return (
    <FeatureGate enabled={FLAGS.giftCards} title="My gift cards" subtitle="Your gift card orders">
      <Orders />
    </FeatureGate>
  );
}

function Orders() {
  const orders = useApiData(() => giftcardsApi.orders());
  return (
    <div className="space-y-6">
      <SubPageHeader title="My gift cards" subtitle="Your gift card orders" back="/dashboard/services/gift-cards" />
      {orders.loading ? <Loading />
        : orders.error ? <ErrorText>{friendlyError(orders.error)}</ErrorText>
        : (orders.data ?? []).length === 0 ? <Box>You haven&apos;t bought any gift cards yet</Box>
        : <div className="space-y-3">{(orders.data ?? []).map((o) => <OrderCard key={o.id} order={o} />)}</div>}
    </div>
  );
}

function OrderCard({ order: o }: { order: GiftOrder }) {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const [codes, setCodes] = useState<GiftCode[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Codes are never cached: clear them when the card unmounts and after 60 s on screen.
  useEffect(() => {
    if (!codes) return;
    const t = setTimeout(() => setCodes(null), 60_000);
    return () => clearTimeout(t);
  }, [codes]);

  const reveal = async () => {
    setError(null); setBusy(true);
    try {
      const r = await purchaseWithPinRetry((pin) => giftcardsApi.reveal(o.id, pin), requestPin);
      if (r) setCodes(r.codes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) setError("Your code isn't available yet. Please retry in a moment.");
      else handleActionError(err, router, setError);
    } finally { setBusy(false); }
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{o.productName}</p>
          <p className="text-xs text-[rgb(var(--fg-muted))]">{formatMoney(o.amount, o.currency)} card · paid {formatNaira(o.pricePaid)}</p>
          <p className="text-xs text-[rgb(var(--fg-muted))]">{formatDateTime(o.createdAt)} · {o.reference}</p>
        </div>
        <Badge tone={statusTone(o.status)}>{o.status}</Badge>
      </div>
      {o.status === "pending" && <p className="text-xs text-amber-500">Processing. Please don&apos;t retry; we&apos;ll notify you when it&apos;s ready.</p>}
      {codes ? (
        <div className="space-y-2">
          {codes.map((c, i) => (
            <div key={i} className="space-y-2">
              {c.code && <SecretValue label="Code" value={c.code} />}
              {c.pin && <SecretValue label="PIN" value={c.pin} />}
              {c.redemptionUrl && <a href={c.redemptionUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-brand-500">Redeem online →</a>}
            </div>
          ))}
          <GhostButton onClick={() => setCodes(null)} className="w-full">Hide</GhostButton>
        </div>
      ) : o.codesAvailable ? (
        <GhostButton onClick={reveal} disabled={busy} className="w-full">{busy ? "Please wait…" : "View code"}</GhostButton>
      ) : null}
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}
