import { apiFetch } from "@/lib/api-client";

export interface ReferralProgramOverview {
  stats: { totalReferrals: number; rewardsPaidOut: number; conversionRate: number };
  settings: { referrerReward: number; referredReward: number; rewardTrigger: string };
  topReferrers: { name: string; email: string; invites: number; conversions: number; earned: number }[];
}

export const adminReferralProgramApi = {
  async overview(): Promise<ReferralProgramOverview> {
    return apiFetch("/api/v1/admin/referral-program", { auth: "admin" });
  },
  /** super admin only. 0 disables that side. Applies immediately to future payouts. */
  async updateSettings(payload: { referrerReward: number; referredReward: number }): Promise<{ success: boolean }> {
    return apiFetch("/api/v1/admin/referral-program/settings", { method: "PUT", auth: "admin", body: payload });
  },
};
