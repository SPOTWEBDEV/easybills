"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { pushApi, urlBase64ToUint8Array } from "@/lib/api/push";

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSupported(false);
        return;
      }
      setSupported(true);
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setEnabled(!!existing);
    };
    check();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      if (checked) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission was not granted.");
          setEnabled(false);
          return;
        }

        const { publicKey } = await pushApi.getVapidPublicKey();
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await pushApi.subscribe(subscription.toJSON());
        setEnabled(true);
        toast.success("Push notifications enabled");
      } else {
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await pushApi.unsubscribe(existing.endpoint);
          await existing.unsubscribe();
        }
        setEnabled(false);
        toast.success("Push notifications disabled");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update push notification settings.");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-3.5 opacity-60">
        <div>
          <p className="text-sm font-semibold">Push notifications</p>
          <p className="text-xs text-ink-500 dark:text-paper-200/40">Not supported in this browser</p>
        </div>
        <Switch checked={false} disabled />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-3.5">
      <div>
        <p className="text-sm font-semibold">Push notifications</p>
        <p className="text-xs text-ink-500 dark:text-paper-200/40">Get alerted on this device, even when the app is closed</p>
      </div>
      <Switch checked={enabled} disabled={loading} onCheckedChange={handleToggle} />
    </div>
  );
}