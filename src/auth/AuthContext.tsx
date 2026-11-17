import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { tokenStore } from "../api/client";
import { authApi } from "../api/endpoints";

interface AuthState {
  username: string | null;
  ready: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>(null as unknown as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    authApi
      .me()
      .then((r) => setUsername(r.username))
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUsername(null);
    window.addEventListener("nailroom:unauthorized", onUnauthorized);
    return () => window.removeEventListener("nailroom:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(async (u: string, p: string) => {
    const res = await authApi.login(u, p);
    tokenStore.set(res.token);
    setUsername(res.username);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUsername(null);
  }, []);

  return <AuthContext.Provider value={{ username, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
