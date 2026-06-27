import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { RegisterClientData, RegisterProviderData, User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerClient: (data: RegisterClientData) => Promise<void>;
  registerProvider: (data: RegisterProviderData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
    authService
      .me({ timeout: 8_000 })
      .then((me) => setUser(me))
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));
  }, [clearAuth]);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    persistAuth(result.token, result.user);
  };

  const logout = () => {
    clearAuth();
  };

  const registerClient = async (data: RegisterClientData) => {
    const result = await authService.registerClient(data);
    persistAuth(result.token, result.user);
  };

  const registerProvider = async (data: RegisterProviderData) => {
    const result = await authService.registerProvider(data);
    persistAuth(result.token, result.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, registerClient, registerProvider }}
    >
      {children}
    </AuthContext.Provider>
  );
}
