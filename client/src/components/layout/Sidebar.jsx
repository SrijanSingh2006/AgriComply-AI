import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, TrendingUp, Archive, LogOut,
  Calculator, LineChart, ShieldAlert, Scale
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const NavItem = ({ to, icon: Icon, label, activeColor = "emerald" }) => {
    const isActive = location.pathname === to;
    
    const activeStyles = {
      emerald: "text-emerald-700 bg-emerald-50/50",
      rose: "text-rose-700 bg-rose-50/50",
      teal: "text-teal-700 bg-teal-50/50"
    };

    const activeBorders = {
      emerald: "bg-emerald-500",
      rose: "bg-rose-500",
      teal: "bg-teal-500"
    };

    return (
      <Link 
        to={to} 
        className={`relative flex items-center gap-3 p-3 transition-all duration-300 rounded-l-2xl ml-3 mb-1 group ${isActive ? activeStyles[activeColor] : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
      >
        {isActive && (
          <motion.div 
            layoutId="activeNavBorder"
            className={`absolute right-0 top-0 bottom-0 w-1 rounded-l-full ${activeBorders[activeColor]}`}
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
        <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 h-screen flex flex-col justify-between hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Vibrant Logo Area */}
        <div className="h-24 flex items-center px-7 border-b border-slate-100/80 mb-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
              <span className="text-white font-black text-xl tracking-tighter">AC</span>
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 tracking-tight">
              AgriComply
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 space-y-8">
          
          {/* CATEGORY 1: Core Platform */}
          <div>
            <div className="px-7 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Core Platform</div>
            <div className="flex flex-col">
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/vault" icon={Archive} label="Secure Vault" />
              <NavItem to="/compliance" icon={FileText} label="Compliance Hub" />
              <NavItem to="/growth" icon={TrendingUp} label="Growth & Schemes" />
              <NavItem to="/loan-check" icon={Calculator} label="Loan Calculator" />
            </div>
          </div>

          {/* CATEGORY 2: Enterprise AI Tools */}
          <div>
            <div className="px-7 mb-3 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
               Enterprise AI
            </div>
            <div className="flex flex-col">
              <NavItem to="/credit-score" icon={LineChart} label="Credit Intelligence" activeColor="emerald" />
              <NavItem to="/security" icon={ShieldAlert} label="Fraud Detection" activeColor="rose" />
              <NavItem to="/legal-bot" icon={Scale} label="Legal AI Assistant" activeColor="teal" />
            </div>
          </div>

        </nav>
      </div>
      
      {/* Upgraded Logout Button Area */}
      <div className="p-5 border-t border-slate-200/60 bg-slate-50/50">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 text-rose-600 bg-white hover:text-white hover:bg-rose-500 font-bold w-full px-4 py-3.5 rounded-xl transition-all duration-300 border border-rose-100 hover:border-rose-500 shadow-sm hover:shadow-md hover:shadow-rose-500/20 active:scale-95"
        >
          <LogOut size={18} strokeWidth={2.5} /> <span>Secure Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;