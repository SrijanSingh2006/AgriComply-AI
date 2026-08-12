import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active track based on URL
  const isCompliance = location.pathname.includes('/compliance');
  const isGrowth = location.pathname.includes('/growth');

  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-700">AgriComply AI</h1>
      
      {/* The Core Dual-Track Switch */}
      <div className="flex bg-gray-200 rounded-lg p-1">
        <button 
          onClick={() => navigate('/compliance')}
          className={`px-4 py-2 rounded-md transition-all ${isCompliance ? 'bg-white shadow text-blue-700 font-bold' : 'text-gray-600'}`}
        >
          Track A: Compliance
        </button>
        <button 
          onClick={() => navigate('/growth')}
          className={`px-4 py-2 rounded-md transition-all ${isGrowth ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-600'}`}
        >
          Track B: Growth
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/vault')} className="text-sm underline text-gray-500">
           My Vault
        </button>
        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
          U
        </div>
      </div>
    </nav>
  );
};

export default Navbar;