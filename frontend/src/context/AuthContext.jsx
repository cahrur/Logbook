import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { setAccessToken } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On load, try to restore the session via the httpOnly refresh cookie.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { accessToken, user: u } = await authService.refresh();
        if (!active) return;
        setAccessToken(accessToken);
        setUser(u);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { accessToken, user: u } = await authService.login(email, password);
    setAccessToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const role = user?.role;
  const value = {
    user,
    ready,
    isAuthenticated: !!user,
    isSuperAdmin: role === 'superadmin',
    isAdmin: role === 'superadmin' || role === 'admin',
    canWrite: role === 'superadmin' || role === 'admin' || role === 'member',
    // Only superadmin may delete anything.
    canDelete: role === 'superadmin',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
