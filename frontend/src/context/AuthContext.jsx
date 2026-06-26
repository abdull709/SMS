import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('smart_school_token'));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(token));

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const data = await api.get('/api/auth/me');
        if (mounted) setUser(data.user);
      } catch (_error) {
        localStorage.removeItem('smart_school_token');
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setBooting(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('smart_school_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('smart_school_token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    token,
    user,
    booting,
    isAuthenticated: Boolean(token && user),
    login,
    logout
  }), [token, user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
