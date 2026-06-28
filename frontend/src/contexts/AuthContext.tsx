import { createContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import type { RegisterClientData, RegisterProviderData, User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerClient: (data: RegisterClientData) => Promise<void>;
  registerProvider: (data: RegisterProviderData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .me({ timeout: 8_000 })
      .then((me) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Cookie clearing still happens even if request fails
    }
    setUser(null);
  }, []);

  const registerClient = useCallback(async (data: RegisterClientData) => {
    const user = await authService.registerClient(data);
    setUser(user);
  }, []);

  const registerProvider = useCallback(async (data: RegisterProviderData) => {
    const user = await authService.registerProvider(data);
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, registerClient, registerProvider }),
    [user, isLoading, login, logout, registerClient, registerProvider]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
