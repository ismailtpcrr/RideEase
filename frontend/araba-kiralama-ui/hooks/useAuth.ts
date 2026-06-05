'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse } from '@/types';

const STAFF_ROLES = ['Admin', 'Moderator', 'CarManager'];

interface AuthContextValue {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  hasClaim: (type: string, value: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isStaff: false,
  hasClaim: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthState() {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5183/api'}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // sunucu cevabı gelmese bile yerel temizliği yap
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasClaim = (type: string, value: string) =>
    user?.claims?.[type] === value;

  return {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'Admin',
    isStaff: !!user && STAFF_ROLES.includes(user.role),
    hasClaim,
  };
}
