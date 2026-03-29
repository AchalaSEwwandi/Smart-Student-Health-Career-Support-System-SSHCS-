import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

const ROLE_REDIRECTS = {
  student:         '/',
  doctor:          '/doctor/dashboard',
  shop_owner:      '/shop/dashboard',
  delivery_person: '/delivery/dashboard',
  admin:           '/admin/dashboard',
};

const getRedirectPath = (userData) => {
  if (userData?.role === 'shop_owner') {
    if (userData.businessType === 'grocery') return '/grocery/dashboard';
    if (userData.businessType === 'pharmacy') return '/pharmacy/dashboard';
  }
  return ROLE_REDIRECTS[userData?.role] || '/';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;
  const role            = user?.role   || null;
  const status          = user?.status || null;

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser  = localStorage.getItem('authUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login — store tokens and user.
   * @returns {{ redirectPath: string, user: object }}
   */
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);

    return {
      redirectPath: getRedirectPath(userData),
      user: userData,
    };
  }, []);

  /**
   * Register — supports both plain JSON (student) and FormData (doctor/vendor).
   * @param {object|FormData} formData
   * @returns {{ pending: boolean, redirectPath?: string }}
   */
  const register = useCallback(async (formData) => {
    const isFormData = formData instanceof FormData;

    const { data } = await api.post('/auth/register', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });

    // Pending user (doctor/vendor) — no tokens issued by backend
    if (data.pending) {
      return { pending: true };
    }

    const { accessToken, user: userData } = data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);

    return {
      pending: false,
      redirectPath: getRedirectPath(userData),
    };
  }, []);

  /**
   * Logout — clear tokens and redirect to login.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Update user in context (e.g. after profile update).
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, role, status, isAuthenticated, loading, login, register, logout, updateUser, ROLE_REDIRECTS }}
    >
      {children}
    </AuthContext.Provider>
  );
};
