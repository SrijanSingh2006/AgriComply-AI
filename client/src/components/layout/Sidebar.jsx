import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaFileAlt, FaSeedling, FaArchive, FaSignOutAlt,
  FaCalculator, FaChartLine, FaShieldAlt, FaBalanceScale 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  // Upgraded NavItem with vibrant dynamic active states
  const NavItem = ({ to, icon: Icon, label, activeColor = "emerald" }) => {
    const isActive = location.pathname === to;
    
    // Dynamic glassmorphism colors based on the section
    const activeStyles = {
      emerald: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-r-4 border-emerald-500 font-bold shadow-sm",
      rose: "bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 border-r-4 border-rose-500 font-bold shadow-sm",
      teal: "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-r-4 border-teal-500 font-bold shadow-sm"
    };

    const baseStyles = "flex items-center gap-3 p-3 transition-all duration-300 text-gray-500 hover:bg-white/80 hover:text-gray-800 border-r-4 border-transparent rounded-l-xl ml-2";

    return (
      <Link to={to} className={isActive ? `${baseStyles} ${activeStyles[activeColor]}` : baseStyles}>
        <Icon className={`text-lg ${isActive ? '' : 'text-gray-400'}`} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    // Replaced flat white with frosted glass (bg-white/60 + backdrop-blur)
    <aside className="w-72 bg-white/60 backdrop-blur-xl border-r border-white/50 h-screen flex flex-col justify-between hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Vibrant Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">
              AgriComply
            </span>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1 pr-2 space-y-6">
          
          {/* CATEGORY 1: Core Platform */}
          <div>
            <div className="px-6 mb-2 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Core Platform</div>
            <div className="space-y-1">
              <NavItem to="/" icon={FaHome} label="Dashboard" />
              <NavItem to="/vault" icon={FaArchive} label="Document Vault" />
              <NavItem to="/compliance" icon={FaFileAlt} label="Compliance Hub" />
              <NavItem to="/growth" icon={FaSeedling} label="Growth & Schemes" />
              <NavItem to="/loan-check" icon={FaCalculator} label="Loan Calculator" />
            </div>
          </div>

          {/* CATEGORY 2: Enterprise AI Tools */}
          <div>
            <div className="px-6 mb-2 text-xs font-extrabold text-emerald-500 uppercase tracking-widest">Enterprise AI</div>
            <div className="space-y-1">
              <NavItem to="/credit-score" icon={FaChartLine} label="Credit Intelligence" activeColor="emerald" />
              <NavItem to="/security" icon={FaShieldAlt} label="Fraud Detection" activeColor="rose" />
              <NavItem to="/legal-bot" icon={FaBalanceScale} label="Legal AI Assistant" activeColor="teal" />
            </div>
          </div>

        </nav>
      </div>
      
      {/* Upgraded Logout Button Area */}
      <div className="p-4 border-t border-gray-100/50 bg-white/30 backdrop-blur-md">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 text-rose-500 hover:text-white hover:bg-rose-500 font-semibold w-full px-4 py-3 rounded-xl transition-all duration-300 border border-rose-100 hover:shadow-lg hover:shadow-rose-500/20"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;