"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { tokenStore } from "@/lib/api-client";
import { authApi, type LoginResult } from "@/lib/api/dashboard";
import type { User } from "@/lib/types";

type Session = { user: User; token: string; requiresPinSetup: boolean };
type Ctx = {
  user: User | null;
  requiresPinSetup: boolean;
  loading: boolean;
  login: (b: { email: string; password: string }) => Promise<LoginResult>;
  verifyOtp: (b: { email: string; code: string }) => Promise<void>;
  register: (b: Parameters<typeof authApi.register>[0]) => Promise<void>;
  logout: () => void;
  markPinSet: () => void;
  refreshUser: () => Promise<void>;
};
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requiresPinSetup, setNeedsPin] = useState(false);
  const [loading, setLoading] = useState(true);

  const start = useCallback((s: Session) => {
    tokenStore.setUserToken(s.token);
    setUser(s.user);
    setNeedsPin(s.requiresPinSetup);
  }, []);

  useEffect(() => {
    if (!tokenStore.getUserToken()) return setLoading(false);
    authApi.me()
      .then((r) => { setUser(r.user); setNeedsPin(r.requiresPinSetup); })
      .catch(() => tokenStore.clearUserToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (b: { email: string; password: string }) => {
    const r = await authApi.login(b);
    if (!r.requiresTwoFactor) start(r);
    return r;
  }, [start]);
  const verifyOtp = useCallback(async (b: { email: string; code: string }) => start(await authApi.verifyLoginOtp(b)), [start]);
  const register = useCallback(async (b: Parameters<typeof authApi.register>[0]) => start(await authApi.register(b)), [start]);
  const markPinSet = useCallback(() => setNeedsPin(false), []);
  const refreshUser = useCallback(async () => {
    try { const r = await authApi.me(); setUser(r.user); setNeedsPin(r.requiresPinSetup); } catch {}
  }, []);
  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    tokenStore.clearUserToken();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, requiresPinSetup, loading, login, verifyOtp, register, logout, markPinSet, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
