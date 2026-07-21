"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "1859-auth";

const AuthContext = createContext<AuthState | null>(null);

function loadStored(): { user: AuthUser; session: Session } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { user: AuthUser; session: Session };
  } catch {
    return null;
  }
}

function persist(user: AuthUser, session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, session }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadStored();
    if (stored?.user) setUser(stored.user);
    setLoading(false);
  }, []);

  const applyAuth = useCallback((payload: {
    user: AuthUser;
    session: Session;
  }) => {
    persist(payload.user, payload.session);
    setUser(payload.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.hint || data.error || "Error de login");
      applyAuth(data);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de registro");
      if (!data.session) {
        throw new Error(
          "Cuenta creada. Intenta iniciar sesión (si pide confirmación, usa Entrar como demo)."
        );
      }
      applyAuth(data);
    },
    [applyAuth]
  );

  const loginDemo = useCallback(async () => {
    const res = await fetch("/api/auth/demo", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error demo");
    applyAuth(data);
  }, [applyAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, loginDemo, logout }),
    [user, loading, login, register, loginDemo, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
