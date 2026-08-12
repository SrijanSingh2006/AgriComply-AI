import React, { createContext, useState, useContext } from 'react';
import api from '../services/api'; // Import your axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 1. The Login Function
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      // Save token to localStorage so it persists on refresh
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error.response?.data);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // 2. The Register Function (UPDATED)
  // Added 'role' parameter here to support Farmer/FPO/MSME selection
  const register = async (name, email, password, role) => {
    try {
      await api.post('/auth/register', { name, email, password, role });
      return { success: true };
    } catch (error) {
      console.error("Registration failed", error.response?.data);
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);