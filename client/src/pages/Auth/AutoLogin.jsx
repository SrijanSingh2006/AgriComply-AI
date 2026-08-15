import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AutoLogin() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        // Try to register the demo user (ignore error if already exists)
        await register("Interview Demo", "demo@interview.com", "demo123", "Farmer");
        
        // Log in with the demo credentials
        const result = await login("demo@interview.com", "demo123");
        
        if (result.success) {
          window.location.href = '/'; // Hard redirect to guarantee fresh state
        } else {
          console.error("AutoLogin failed:", result.message);
        }
      } catch (error) {
        console.error("AutoLogin error:", error);
      }
    };

    performAutoLogin();
  }, [login, register, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
        <h2 className="text-xl font-bold text-green-800">Logging you in instantly...</h2>
        <p className="text-gray-500 mt-2">Preparing your interview environment.</p>
      </div>
    </div>
  );
}
