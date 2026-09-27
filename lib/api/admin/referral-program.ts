import { apiFetch } from "@/lib/api-client";

export interface ReferralProgramOverview {
  stats: { totalReferrals: number; rewardsPaidOut: number; conversionRate: number };
  settings: { referrerReward: number; referredReward: number; rewardTrigger: string };
  topReferrers: { id: string; name: string; invites: number; earned: number; lastReferral: string }[];
}

export const adminReferralProgramApi = {
  async overview(): Promise<ReferralProgramOverview> {
    return apiFetch("/api/v1/admin/referral-program", { auth: "admin" });
  },
  async updateSettings(payload: { referrerReward: number; referredReward: number; rewardTrigger?: string }): Promise<{ success: boolean }> {
    return apiFetch("/api/v1/admin/referral-program/settings", { method: "PUT", auth: "admin", body: payload });
  },
};