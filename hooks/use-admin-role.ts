"use client";
import { useQuery } from "@tanstack/react-query";
import { adminAuthApi } from "@/lib/api/admin/auth";

/** Reads the signed-in admin's role. Endpoints marked "super admin" in the API doc answer 403 to every other role,
 * so controls for them are hidden or disabled unless isSuperAdmin is true. */
export function useAdminRole() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-me"], queryFn: adminAuthApi.me, staleTime: 5 * 60_000 });
  const role = data?.admin.role;
  return { role, isSuperAdmin: role === "super_admin", loading: isLoading };
}
