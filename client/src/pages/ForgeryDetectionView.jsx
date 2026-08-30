import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileSearch, Search, AlertTriangle, Fingerprint } from 'lucide-react';

export default function ForgeryDetectionView() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001';

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (!file) {
        throw new Error('Please select a file first.');
      }
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${ML_URL}/security/forgery-check`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' },
        body: formData
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4 border-b border-slate-200/60 pb-6">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/20 text-emerald-400">
            <Fingerprint size={32} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 tracking-tight">
            Security Vault & Fraud Detection
          </h1>
          <p className="text-slate-500 font-medium mt-1">Enterprise-grade Error Level Analysis (ELA) to detect manipulated documents.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-3xl p-8 border border-white max-w-3xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        <form onSubmit={handleScan} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileSearch size={14} /> Document Path (Local)
            </label>
            <input 
              type="file" 
              accept="image/*,.pdf"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 p-3 shadow-inner transition-all font-medium text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
              onChange={e => setFile(e.target.files[0])} 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-slate-900/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-3 overflow-hidden relative"
          >
            {loading ? (
              <>
                 <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                             animate={{ x: ['-100%', '200%'] }} 
                             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                     <Search size={20} className="text-emerald-400" />
                 </motion.div>
                 Scanning Pixels...
              </>
            ) : (
                <><Fingerprint size={20} className="text-emerald-400" /> Run Forgery Scan</>
            )}
          </button>
        </form>

        <AnimatePresence>
            {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl font-medium flex items-center gap-3"
            >
                <AlertTriangle size={20} /> {error}
            </motion.div>
            )}

            {result && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`mt-8 p-6 rounded-3xl border shadow-inner ${result.is_tampered ? 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'}`}
            >
                <div className="flex items-center space-x-5">
                <div className={`p-4 rounded-2xl shadow-sm ${result.is_tampered ? 'bg-white text-rose-500' : 'bg-white text-emerald-500'}`}>
                    {result.is_tampered ? <ShieldAlert size={32} strokeWidth={2.5} /> : <ShieldCheck size={32} strokeWidth={2.5} />}
                </div>
                <div>
                    <h3 className={`text-2xl font-extrabold tracking-tight ${result.is_tampered ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {result.status}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-2">
                    Forgery Confidence Score: 
                    <span className={`px-2 py-0.5 rounded-md text-xs font-black ${result.is_tampered ? 'bg-rose-200/50 text-rose-800' : 'bg-emerald-200/50 text-emerald-800'}`}>
                        {result.forgery_confidence_score}%
                    </span>
                    </p>
                </div>
                </div>
                {result.is_tampered && (
                <motion.div 
                    initial={{ opacity: 0, mt: 0 }} animate={{ opacity: 1, mt: 16 }}
                    className="text-sm text-rose-700 bg-white/60 p-4 rounded-xl border border-rose-100 font-medium leading-relaxed shadow-sm"
                >
                    <strong className="flex items-center gap-1.5 mb-1 text-rose-800 uppercase tracking-widest text-[10px]"><AlertTriangle size={12}/> Analysis Warning</strong> 
                    The pixel compression rate in this document is highly inconsistent. It is highly likely that sections of this document have been digitally altered, spliced, or photoshopped.
                </motion.div>
                )}
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}