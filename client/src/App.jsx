import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VaultProvider } from './contexts/VaultContext';

// Import Pages
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ComplianceView from './pages/ComplianceView';
import GrowthView from './pages/GrowthView';
import VaultView from './pages/VaultView';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register'; 
import LoanCalculator from './pages/LoanCalculator'; 

// 🌟 NEW: Import our advanced ML Pages
import CreditScoreView from './pages/CreditScoreView';
import ForgeryDetectionView from './pages/ForgeryDetectionView';
import LegalChatbotView from './pages/LegalChatbotView';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// --- VIBRANT UI UPGRADE ---
// Changed from flat gray to a modern, subtle mesh gradient with glass effects
function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        {/* Added backdrop blur for that modern glassmorphism feel */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto backdrop-blur-sm p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <VaultProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/growth" element={<GrowthView />} />
                    <Route path="/loan-check" element={<LoanCalculator />} />
                    
                    {/* 🌟 NEW ROUTES FOR AI FEATURES */}
                    <Route path="/credit-score" element={<CreditScoreView />} />
                    <Route path="/security" element={<ForgeryDetectionView />} />
                    <Route path="/legal-bot" element={<LegalChatbotView />} />
                    
                    <Route path="/vault" element={<VaultView />} />
                    <Route path="/compliance" element={<ComplianceView />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </VaultProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;