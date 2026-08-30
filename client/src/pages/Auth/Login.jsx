import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, Leaf, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-900">
      
      {/* LEFT: Branding & Graphics (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
               <Leaf className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-4">
              Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">AgriComply</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
              Securely access your compliance vault, AI legal assistant, and alternative credit score insights.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="text-emerald-400" size={24} />
              <span className="text-slate-300 font-medium">Bank-grade data encryption</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <Sparkles className="text-emerald-400" size={24} />
              <span className="text-slate-300 font-medium">AI-powered regulatory insights</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -z-10 opacity-60"></div>
        
        <div className="w-full max-w-md relative z-10">
          
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
               <Leaf className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">AgriComply</span>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 mb-8 font-medium">Enter your credentials to access your account.</p>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="text-rose-500" size={18} /> {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-slate-800 shadow-inner"
                    placeholder="farmer@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">Password</label>
                   <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-slate-800 shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-8 bg-slate-900 text-white font-extrabold py-4 px-6 rounded-2xl hover:bg-slate-800 disabled:opacity-70 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {loading ? 'Authenticating...' : (
                   <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-4 decoration-2 decoration-emerald-600/30 transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;