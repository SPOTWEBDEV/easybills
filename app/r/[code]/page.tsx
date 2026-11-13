import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Shared referral links look like https://easybills-app.top/r/JANE1234.
// Send visitors to the sign-up form with the code pre-filled (/register reads ?ref=).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ReferralRedirect({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = decodeURIComponent(code ?? "").trim().toUpperCase();
  // Only pass through plausible codes; anything else just lands on a normal sign-up.
  redirect(/^[A-Z0-9_-]{3,32}$/.test(clean) ? `/register?ref=${encodeURIComponent(clean)}` : "/register");
}
