import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type User } from '../data/users';
import { post } from '../utils/api.utils';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('az-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

const login = useCallback(async (email: string, password: string) => {
    try {
    const response = await post('Authentication/login', {
      login: email,
      password: password,
    });

    if (response.success) {
      const loggedInUser: User = response.data;
      setUser(loggedInUser);
      localStorage.setItem('az-user', JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    return null;
  } catch {
    return null;
  }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('az-user');
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('az-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoggedIn: !!user,
          login,
        logout,
        updateProfile,
      }}
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
