import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      setUser(response.data.data.user);
      return { success: true };
    }
    return { success: false, error: response.data.error };
  };

  const register = async (name, email, password, selectedCharity = null) => {
    const response = await api.post('/api/auth/register', { name, email, password, selectedCharity });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      setUser(response.data.data.user);
      return { success: true };
    }
    return { success: false, error: response.data.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};