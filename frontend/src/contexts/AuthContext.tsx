import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser, LoginResponse } from '../types/auth';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(response: LoginResponse): void;
  logout(): void;
  refreshUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = storage.getToken();
    if (!savedToken) {
      setIsLoading(false);
      return;
    }
    authService
      .getMe()
      .then((u) => setUser(u))
      .catch(() => {
        storage.removeToken();
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(response: LoginResponse) {
    storage.setToken(response.token);
    setToken(response.token);
    setUser(response.user);

    const role = response.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'provider') navigate('/prestador/dashboard');
    else navigate('/cliente');
  }

  function logout() {
    storage.removeToken();
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  async function refreshUser() {
    const updated = await authService.getMe();
    setUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
