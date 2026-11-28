"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Box, Card, ConfirmSheet, CopyButton, ErrorText, GhostButton, Label, Loading } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { numbersApi, type NumberMessage } from "@/lib/api/extra-services";
import { friendlyError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatNaira } from "@/lib/utils";

export default function NumberDetailPage() {
  return (
    <FeatureGate enabled={FLAGS.numbers} title="Virtual number" subtitle="Your SMS inbox">
      <Detail />
    </FeatureGate>
  );
}

const codeIn = (body: string) => body.match(/\b\d{4,8}\b/)?.[0] ?? null;

function Detail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const nums = useApiData(() => numbersApi.list(), [id]);
  const num = nums.data?.find((n) => String(n.id) === id);

  const [msgs, setMsgs] = useState<NumberMessage[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(true);
  const [msgsError, setMsgsError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No websocket: poll every 7 s, only while this screen is mounted and the tab is visible.
  useEffect(() => {
    let off = false;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const m = await numbersApi.messages(id);
        if (!off) { setMsgs(m); setMsgsError(null); }
      } catch (e) { if (!off) setMsgsError(friendlyError(e)); }
      finally { if (!off) setMsgsLoading(false); }
    };
    tick();
    const t = setInterval(tick, 7000);
    return () => { off = true; clearInterval(t); };
  }, [id]);

  const release = async () => {
    setReleasing(true); setError(null);
    try { await numbersApi.release(id); router.replace("/dashboard/services/numbers"); }
    catch (e) { setError(friendlyError(e)); setConfirm(false); }
    finally { setReleasing(false); }
  };

  return (
    <div className="space-y-6">
      <SubPageHeader title={num?.phoneNumber ?? "Virtual number"} subtitle="Incoming SMS appear here" back="/dashboard/services/numbers" />

      {nums.loading ? <Loading /> : !num ? <Box>This number was not found. It may have been released.</Box> : (
        <Card className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold">{num.phoneNumber}</span>
            <CopyButton value={num.phoneNumber} label="Copy number" />
          </div>
          <p className="text-[rgb(var(--fg-muted))]">{num.country} · {num.type}</p>
          <p className="text-[rgb(var(--fg-muted))]">Renews on {formatDate(num.renewsAt)} · {formatNaira(num.monthlyPrice)}/month</p>
        </Card>
      )}

      <div className="space-y-3">
        <Label>Messages</Label>
        {msgsLoading ? <Loading text="Checking for messages…" />
          : msgsError ? <ErrorText>{msgsError}</ErrorText>
          : msgs.length === 0 ? <Box>No messages yet. This page refreshes automatically.</Box>
          : msgs.map((m) => {
              const code = codeIn(m.body);
              return (
                <Card key={m.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[rgb(var(--fg-muted))]">
                    <span>From {m.from}</span><span>{formatDateTime(m.receivedAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  {code && <CopyButton value={code} label={`Copy code ${code}`} />}
                </Card>
              );
            })}
      </div>

      <ErrorText>{error}</ErrorText>
      {num && <GhostButton onClick={() => setConfirm(true)} className="w-full border-red-500/40 text-red-500">Release this number</GhostButton>}

      <ConfirmSheet open={confirm} danger loading={releasing} title="Release this number?" confirmLabel="Release"
        message="This is permanent and not refunded. You will lose the number and any codes sent to it afterwards."
        onConfirm={release} onCancel={() => setConfirm(false)} />
    </div>
  );
}
