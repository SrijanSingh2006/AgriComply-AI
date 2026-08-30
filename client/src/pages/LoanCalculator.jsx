import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; 
import axios from 'axios';
import { useVault } from '../contexts/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowLeft, Landmark, FileText, ChevronRight, Zap, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';

const LoanCalculator = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const schemeData = state?.scheme || null;
    
    // 1. Get docs from Context
    const { documents: contextDocs } = useVault() || { documents: [] };

    const [formData, setFormData] = useState({
        amount: '',
        tenure: '5',
        bank: schemeData?.bank || '' 
    });
    
    const [foundDocs, setFoundDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // 2. Load Documents (Context + Fallback API)
    useEffect(() => {
        const loadDocs = async () => {
            if (contextDocs && contextDocs.length > 0) {
                console.log("Loaded docs from Context:", contextDocs.length);
                setFoundDocs(mapDocs(contextDocs));
                return;
            }

            try {
                console.log("Context empty, fetching from API...");
                const res = await api.get('/vault');
                setFoundDocs(mapDocs(res.data));
            } catch (err) {
                console.error("API Fetch failed:", err);
            }
        };
        loadDocs();
    }, [contextDocs]);

    // 3. Helper to extract tags AND actual OCR Data
    const mapDocs = (docs) => {
        return (docs || []).map(d => {
            const rawData = d.extracted_data || d.parsed_text || d.content || "Data not available";
            return {
                tag: d.tag || d.type || d.classification?.type || "Unknown",
                filename: d.filename,
                extracted_data: typeof rawData === 'object' ? JSON.stringify(rawData) : rawData
            };
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheck = async () => {
        if (!formData.amount) return alert("Please enter an amount");
        
        setLoading(true);
        setResult(null);
        
        const ML_URL = (import.meta.env.VITE_ML_URL || 'http://localhost:5001') + '/growth/advanced-check';

        try {
            console.log("Sending docs to AI:", foundDocs); 
            
            const res = await axios.post(ML_URL, {
                ...formData,
                user_docs: foundDocs 
            });
            setResult(res.data);
        } catch (error) {
            console.error("AI Error:", error);
            if (error.code === "ERR_NETWORK") {
                alert("Please ensure the ML service is running.");
            } else {
                alert("AI Analysis Failed. See console.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="p-4 md:p-8 max-w-6xl mx-auto pb-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <button 
                onClick={() => navigate('/growth')} 
                className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors shadow-sm"
            >
                <ArrowLeft size={16} /> Back to Growth Hub
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
                        <Calculator size={32} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 tracking-tight">
                            AI Eligibility Engine
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {schemeData ? `Analyzing eligibility for: ${schemeData.name}` : 'Check approval odds across all Banks & NBFCs'}
                        </p>
                    </div>
                </div>
                
                <div className={`px-5 py-3 rounded-2xl border shadow-sm flex items-center gap-3 ${foundDocs.length > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    <FileText size={20} />
                    <div>
                        <div className="font-extrabold text-xl leading-none">{foundDocs.length}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Vault Docs</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Form */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-8 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 relative overflow-hidden">
                        
                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">Loan Amount (₹)</label>
                                <input 
                                    type="number" 
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-slate-300 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-xl font-bold text-slate-700 transition-all shadow-inner"
                                    placeholder="e.g. 500000"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">Tenure</label>
                                    <span className="bg-indigo-100 text-indigo-700 font-black px-3 py-1 rounded-lg shadow-sm">
                                        {formData.tenure} Years
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    name="tenure"
                                    min="1" max="20"
                                    value={formData.tenure}
                                    onChange={handleChange}
                                    className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                                    <span>1 Yr</span>
                                    <span>20 Yrs</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Landmark size={14} /> Preferred Lender
                                </label>
                                <input 
                                    list="banks" 
                                    name="bank"
                                    value={formData.bank}
                                    onChange={handleChange}
                                    placeholder="Type 'Any' or specific bank..."
                                    className="w-full p-4 border border-slate-300 rounded-2xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-slate-700 transition-all shadow-inner"
                                />
                                <datalist id="banks">
                                    <option value="Any Bank or NBFC" />
                                    <option value="State Bank of India (SBI)" />
                                    <option value="HDFC Bank" />
                                    <option value="Punjab National Bank" />
                                </datalist>
                            </div>

                            <button 
                                onClick={handleCheck}
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Zap size={22} className="text-amber-300"/></motion.div> AI is Analyzing...</>
                                ) : (
                                    <>Analyze Eligibility <ChevronRight size={22} /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {foundDocs.length > 0 && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
                            <p className="font-extrabold text-slate-400 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <FileText size={12}/> Vault Inventory Context
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {foundDocs.map((d, i) => (
                                    <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-mono text-xs font-bold shadow-sm">
                                        {d.tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50 h-full min-h-[400px] flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {!result && !loading && (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center space-y-4"
                                >
                                    <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-300">
                                        <Zap size={32} />
                                    </div>
                                    <p className="font-bold text-slate-500">Awaiting input for<br/>AI Analysis</p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-indigo-600 text-lg">Evaluating Context...</p>
                                        <p className="text-sm font-medium text-slate-500 mt-1">Checking {foundDocs.length} vault documents against bank policies.</p>
                                    </div>
                                </motion.div>
                            )}

                            {result && (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <div className={`p-6 rounded-2xl mb-6 text-center border-2 shadow-sm ${result.eligible ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">
                                            {result.eligible ? 'High Chance' : 'Not Eligible'}
                                        </h2>
                                        <div className="inline-flex items-center gap-1.5 mt-2 bg-white/60 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                                            {result.eligible ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {result.confidence_score}% AI Confidence
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6 flex-1">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                            <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                                Reasoning
                                            </h3>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">{result.reasoning}</p>
                                        </div>
                                        
                                        {result.suggestion && (
                                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                                                <h3 className="font-extrabold text-indigo-800 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Lightbulb size={16} /> Actionable Tip
                                                </h3>
                                                <p className="text-indigo-700 text-sm font-medium leading-relaxed">{result.suggestion}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LoanCalculator;