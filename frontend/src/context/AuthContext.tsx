import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, getToken, setToken, removeToken, type AuthUser } from '@/lib/api';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { token, user } = await api.auth.login({ email, password });
    setToken(token);
    setUser(user);
  }

  async function register(name: string, email: string, password: string) {
    const { token, user } = await api.auth.register({ name, email, password });
    setToken(token);
    setUser(user);
  }

  function logout() {
    removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
