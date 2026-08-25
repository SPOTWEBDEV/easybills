import { apiFetch } from "@/lib/api-client";

export const pushApi = {
  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    return apiFetch("/api/v1/push/vapid-public-key", { auth: "none" });
  },
  async subscribe(subscription: PushSubscriptionJSON): Promise<{ success: boolean }> {
    return apiFetch("/api/v1/push/subscribe", {
      method: "POST",
      body: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      },
    });
  },
  async unsubscribe(endpoint: string): Promise<{ success: boolean }> {
    return apiFetch("/api/v1/push/unsubscribe", { method: "POST", body: { endpoint } });
  },
};

/** Converts a VAPID base64url public key into the Uint8Array format PushManager.subscribe() expects. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}