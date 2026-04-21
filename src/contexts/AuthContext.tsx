import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import { type User } from '../data/users';
import { post, saveTokens } from '../utils/api.utils';
import { toImagePath } from '../utils/general';
import { SESSION_EXPIRED } from '../constants/events';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mapApiResponseToUser = (raw: any): User => ({
  id: raw.id,
  firstName: raw.firstName,
  lastName: raw.lastName,
  email: raw.email,
  phoneNumber: raw.phoneNumber ?? '',
  username: raw.username ?? null,
  dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : null,
  role: raw.role
    ? {
      id: raw.role.id,
      name: raw.role.name ?? null,
      normalizedName: raw.role.normalizedName ?? null,
      concurrencyStamp: raw.role.concurrencyStamp ?? null,
    }
    : null,
  image: raw.image
    ? {
      id: raw.image.id,
      imageName: raw.image.imageName ?? null,
      imagePath: raw.image.imagePath ? toImagePath(raw.image.imagePath) : null,
    }
    : null,
  avatar: raw.avatar ?? null,
  location: raw.location ?? null,
  savedVehicles: raw.savedVehicles ?? [],
  customerStatus: raw.customerStatus ?? undefined,
});

// Derive admin status from the role object directly
const isAdminRole = (user: User | null): boolean =>
  user?.role?.normalizedName?.toLowerCase() === 'admin';

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
        const loggedInUser = mapApiResponseToUser(response.data.user);
        saveTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          accessTokenExpiresAt: response.data.accessTokenExpiresAt,
          refreshTokenExpiresAt: response.data.refreshTokenExpiresAt,
          user: response.data.user,
          role: response.data.role,
        });
        localStorage.setItem('az-user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return loggedInUser;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await post('Authentication/logout', {});
    } catch {
      // proceed with local logout regardless
    } finally {
      setUser(null);
      localStorage.removeItem('az-user');
    }
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('az-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem('az-user');
    };

    window.addEventListener(SESSION_EXPIRED, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, handleSessionExpired);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: isAdminRole(user),
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
