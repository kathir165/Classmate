import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiClientError } from "../lib/api";
import type { User } from "../lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = localStorage.getItem("classmate_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await api.get<{ user: User }>("/auth/me");
      setUser(user);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        localStorage.removeItem("classmate_token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("classmate_token", token);
    setUser(user);
  }

  async function signup(name: string, email: string, password: string) {
    const { token, user } = await api.post<{ token: string; user: User }>("/auth/signup", {
      name,
      email,
      password,
    });
    localStorage.setItem("classmate_token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("classmate_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
