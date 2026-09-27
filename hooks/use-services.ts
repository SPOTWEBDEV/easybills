import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { airtimeApi } from "@/lib/api/airtime";
import { dataApi } from "@/lib/api/data";
import { electricityApi } from "@/lib/api/electricity";

export function useNetworkProviders() {
  return useQuery({ queryKey: ["network-providers"], queryFn: airtimeApi.getProviders });
}

export function usePurchaseAirtime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: airtimeApi.purchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDataPlans(providerId: string) {
  return useQuery({
    queryKey: ["data-plans", providerId],
    queryFn: () => dataApi.getPlans(providerId),
    enabled: !!providerId,
  });
}

export function usePurchaseData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dataApi.purchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useElectricityProviders() {
  return useQuery({ queryKey: ["electricity-providers"], queryFn: electricityApi.getProviders });
}

export function useMeterLookup() {
  return useMutation({ mutationFn: electricityApi.lookupMeter });
}

export function usePurchaseElectricity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electricityApi.purchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
