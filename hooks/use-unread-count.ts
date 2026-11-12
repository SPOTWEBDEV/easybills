"use client";
import { useApiData } from "@/hooks/use-api-data";
import { notificationsApi } from "@/lib/api/dashboard";

export function useUnreadCount() {
  const { data } = useApiData(() => notificationsApi.unreadCount());
  return data?.count ?? 0;
}
