import { useMutation, useQuery } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: walletApi.getWallet,
    staleTime: 30_000,
  });
}

export function useInitializeFunding() {
  return useMutation({
    mutationFn: walletApi.initializeFunding,
  });
}