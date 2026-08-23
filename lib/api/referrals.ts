import { apiFetch, unwrapList } from "@/lib/api-client";

export interface ReferralSummary {
  referralCode: string;
  totalInvites: number;
  totalEarned: number;
  rewardPerReferral: number;
}

export interface ReferralHistoryRow {
  id: string;
  name: string;
  status: "pending" | "earned";
  amount: number;
  date: string;
}

export const referralsApi = {
  async summary(): Promise<ReferralSummary> {
    return apiFetch("/api/v1/referrals/summary");
  },
  async history(): Promise<ReferralHistoryRow[]> {
    const res = await apiFetch<{ data: ReferralHistoryRow[] }>("/api/v1/referrals/history");
    return unwrapList(res);
  },
};