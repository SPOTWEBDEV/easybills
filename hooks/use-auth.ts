import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { tokenStore } from "@/lib/api-client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await authApi.me();
      return res.user;
    },
    enabled: typeof window !== "undefined" && !!tokenStore.getUserToken(),
    staleTime: 60_000,
    retry: false,
  });
}
