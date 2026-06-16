import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '@/services/auth';
import { removeToken, getUser, setUnauthorizedCallback } from '@/services/api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and register unauthorized handler
  useEffect(() => {
    setUnauthorizedCallback(() => {
      setUser(null);
    });

    (async () => {
      try {
        const hasToken = await authService.isAuthenticated();
        if (hasToken) {
          const storedUser = await getUser();
          setUser(storedUser || { id: 0, email: '', role: '' });
        }
      } catch {
        // Token invalid or missing
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      setUnauthorizedCallback(() => {});
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
