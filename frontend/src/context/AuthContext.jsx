import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

const ROLE_REDIRECTS = {
  student: '/student/dashboard',
  doctor: '/doctor/dashboard',
  shop_owner: '/shop/dashboard',
  delivery_person: '/delivery/dashboard',
  admin: '/admin/dashboard',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('authUser');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  /**
   * Login — store tokens and user.
   * @returns {string} role-based redirect path
   */
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);

    return ROLE_REDIRECTS[userData.role] || '/';
  }, []);

  /**
   * Register — store tokens and user.
   * @returns {string} role-based redirect path
   */
  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const { accessToken, user: userData } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);

    return ROLE_REDIRECTS[userData.role] || '/';
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
   * Update user in context (after profile update).
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, role, isAuthenticated, loading, login, register, logout, updateUser, ROLE_REDIRECTS }}
    >
      {children}
    </AuthContext.Provider>
  );
};
