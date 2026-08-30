import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, User, Search, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Determine active track based on URL
  const isCompliance = location.pathname.includes('/compliance');
  const isGrowth = location.pathname.includes('/growth');

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 px-6 py-3 flex justify-between items-center shadow-sm">
      
      {/* Mobile Title / Global Search */}
      <div className="flex-1 flex items-center gap-4">
        <div className="md:hidden">
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-600">AC</h1>
        </div>
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all shadow-inner">
          <Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search documents or schemes..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* The Core Dual-Track Switch */}
      <div className="flex justify-center flex-1">
        <div className="relative flex bg-slate-100/80 p-1.5 rounded-2xl shadow-inner border border-slate-200/50">
          <button 
            onClick={() => navigate('/compliance')}
            className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 ${isCompliance ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {isCompliance && (
              <motion.div 
                layoutId="navBubble" 
                className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-200/50" 
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                style={{ zIndex: -1 }}
              />
            )}
            Track A: Compliance
          </button>
          
          <button 
            onClick={() => navigate('/growth')}
            className={`relative z-10 px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 ${isGrowth ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {isGrowth && (
              <motion.div 
                layoutId="navBubble" 
                className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-200/50" 
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                style={{ zIndex: -1 }}
              />
            )}
            Track B: Growth
          </button>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex-1 flex justify-end items-center gap-4">
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
        </button>
        
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm hidden sm:block">
          <Settings size={18} />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-1 pr-3 rounded-full border border-slate-200 shadow-sm transition-all">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform">
            <User size={16} />
          </div>
          <span className="text-sm font-bold text-slate-700 hidden sm:block">
            {currentUser ? currentUser.email.split('@')[0] : 'Farmer'}
          </span>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;