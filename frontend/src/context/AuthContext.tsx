"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getMe } from "@/lib/api";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "standard";
  is_active: boolean;
  is_admitted: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fallback = setTimeout(() => setIsLoading(false), 5000);
    try {
      const t = localStorage.getItem("access_token");
      if (t) {
        setToken(t);
        // Re-set cookie so middleware can still gate /ai-tutor and /notes
        // after a page refresh (cookie is session-scoped in the browser).
        document.cookie = "aspire_auth=1; path=/; max-age=3600; SameSite=Lax";
        const raw = localStorage.getItem("user");
        if (raw) {
          try {
            setUser(JSON.parse(raw));
          } catch {
            localStorage.removeItem("user");
          }
        }
      }
    } finally {
      clearTimeout(fallback);
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    document.cookie = "aspire_auth=1; path=/; max-age=3600; SameSite=Lax";
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    document.cookie = "aspire_auth=; path=/; max-age=0; SameSite=Lax";
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  // Re-fetches /api/v1/auth/me to pick up server-side changes (e.g. is_admitted).
  // Call this on pages where access depends on admission status so the user
  // doesn't need to log out and back in after an admin approves them.
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const fresh = await getMe(token);
      const freshUser = fresh as AuthUser;
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
    } catch {
      // Token may have expired — silently ignore; user stays as-is
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!token, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
