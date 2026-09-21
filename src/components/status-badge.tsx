import { cx } from "@/lib/utils";

type Tone = "good" | "bad" | "warn" | "neutral";

const TONE_STYLES: Record<Tone, string> = {
  good: "bg-good/15 text-good",
  bad: "bg-bad/15 text-bad",
  warn: "bg-warn/15 text-warn",
  neutral: "bg-surface-hover text-ink-muted",
};

const KYC_TONE: Record<string, Tone> = {
  verified: "good",
  pending: "warn",
  unverified: "bad",
};

const ACCOUNT_TONE: Record<string, Tone> = {
  active: "good",
  suspended: "bad",
};

const TXN_TONE: Record<string, Tone> = {
  success: "good",
  pending: "warn",
  failed: "bad",
};

function Dot({ tone }: { tone: Tone }) {
  const dotColor =
    tone === "good" ? "bg-good" : tone === "bad" ? "bg-bad" : tone === "warn" ? "bg-warn" : "bg-ink-faint";
  return <span className={cx("h-1.5 w-1.5 rounded-full", dotColor)} />;
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        TONE_STYLES[tone]
      )}
    >
      <Dot tone={tone} />
      {children}
    </span>
  );
}

export function KycBadge({ status }: { status: string }) {
  return <Badge tone={KYC_TONE[status] || "neutral"}>{status}</Badge>;
}

export function AccountStatusBadge({ status }: { status: string }) {
  return <Badge tone={ACCOUNT_TONE[status] || "neutral"}>{status}</Badge>;
}

export function TransactionStatusBadge({ status }: { status: string }) {
  return <Badge tone={TXN_TONE[status] || "neutral"}>{status}</Badge>;
}
