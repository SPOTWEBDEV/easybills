import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletApi.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
