import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { type User } from '../data/users';
import { get, post, saveTokens, getAccessToken } from '../utils/apiUtils';
import { toImagePath } from '../utils/general';
import { collectDeviceInfo } from '../utils/deviceInfo';
import { SESSION_EXPIRED } from '../constants/events';
import { STORAGE_KEYS } from '../data/storageKeys';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mapApiResponseToUser = (raw: any): User => {
  return {
    id: raw.id ?? raw.userId ?? raw.Id ?? null,
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
  };
};

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

  const loggingOut = useRef(false);

  const forceLogout = useCallback(() => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    setUser(null);
    localStorage.removeItem('az-user');
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN_EXPIRY);
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    loggingOut.current = false;
  }, []);

  // Listen for SESSION_EXPIRED from apiUtils → force logout immediately
  useEffect(() => {
    const handler = () => forceLogout();
    window.addEventListener(SESSION_EXPIRED, handler);
    return () => window.removeEventListener(SESSION_EXPIRED, handler);
  }, [forceLogout]);

  // On mount: if user data exists but no token → logout immediately
  // If token exists → validate it against the backend
  useEffect(() => {
    const savedUser = localStorage.getItem('az-user');
    if (!savedUser) return;

    const token = getAccessToken();
    if (!token) {
      forceLogout();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await get<any>('Authentication/me');
        if (cancelled) return;
        if (res.success && res.data) {
          const freshUser = mapApiResponseToUser(res.data);
          localStorage.setItem('az-user', JSON.stringify(freshUser));
          setUser(freshUser);
        } else {
          forceLogout();
        }
      } catch {
        if (!cancelled) forceLogout();
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    try {
      const device = await collectDeviceInfo();
      const response = await post('Authentication/login', {
        login: email,
        password: password,
        ...device,
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
      forceLogout();
    }
  }, [forceLogout]);

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