import React, { useEffect, useState } from 'react';
import Checklist from '../components/compliance/Checklist';
import ComplianceDashboard from '../components/compliance/ComplianceDashboard';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Download, BrainCircuit, ShieldCheck, CheckCircle } from 'lucide-react';

const ComplianceView = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceStatus();
  }, []);

  const fetchComplianceStatus = async () => {
    try {
      const res = await api.get('/compliance/status');
      setRules(res.data);
    } catch (err) {
      console.error("Failed to load compliance rules", err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = rules.filter(r => !r.isCompliant).length;
  const nextDeadline = rules
    .filter(r => !r.isCompliant)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  return (
    <motion.div 
      className="pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-emerald-600" size={32} /> Compliance Manager
            </h2>
            <p className="text-slate-500 font-medium mt-1">
                Showing tracking requirements for: <span className="font-bold text-blue-700 uppercase text-xs px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md ml-1">{user?.role || "Farmer"}</span>
            </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
             <Loader text={`Loading ${user?.role} obligations...`} />
        </div>
      ) : (
        <div className="flex flex-col gap-12">
            {/* ========================================== */}
            {/* TOP SECTION: STANDARD COMPLIANCE CHECKLIST */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: The Checklist */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-bold mb-5 border-b border-slate-100 pb-3 flex justify-between items-center text-slate-800">
                        Mandatory Filings
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            {rules.length} Total Rules
                        </span>
                    </h3>
                    
                    {rules.length === 0 ? (
                        <p className="text-slate-400 text-center py-8 font-medium">No specific rules found for this role.</p>
                    ) : (
                        <Checklist rules={rules} />
                    )}
                </motion.div>

                {/* RIGHT COLUMN: Actions & Alerts */}
                <div className="space-y-6">
                    
                    {/* 1. Status Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Current Status</h3>
                        
                        {pendingCount > 0 ? (
                            <div className="p-5 bg-red-50/80 border border-red-200 rounded-xl mb-2 relative overflow-hidden">
                                <ShieldAlert size={80} className="absolute -bottom-4 -right-4 text-red-100 opacity-50 pointer-events-none" />
                                <p className="text-red-800 font-bold flex items-center gap-2 text-lg relative z-10">
                                    <ShieldAlert size={20} /> Action Required
                                </p>
                                <p className="text-sm text-red-700 mt-2 font-medium relative z-10">
                                    You have <b className="text-red-900 bg-red-100 px-1.5 py-0.5 rounded mx-1">{pendingCount}</b> pending compliances.
                                </p>
                                {nextDeadline && (
                                    <div className="mt-4 bg-white p-3 rounded-lg border border-red-100 relative z-10">
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Next Deadline</p>
                                        <p className="text-sm font-semibold text-slate-800">{new Date(nextDeadline.dueDate).toDateString()}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{nextDeadline.ruleName}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 flex items-center gap-4">
                                <CheckCircle size={40} className="text-emerald-500" />
                                <div>
                                  <p className="text-emerald-800 font-bold text-lg">All Clear</p>
                                  <p className="text-sm text-emerald-700 font-medium">You are fully compliant for this period.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* 2. Export Button */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <h3 className="font-bold text-blue-900 mb-2 text-lg">Auditor Ready?</h3>
                        <p className="text-sm text-blue-700/80 mb-5 font-medium leading-relaxed">
                            Download all your {user?.role} compliance documents in a single, perfectly structured ZIP file.
                        </p>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 flex justify-center items-center gap-2">
                            <Download size={18} /> Download Filing Bundle
                        </button>
                    </motion.div>

                </div>
            </div>

            {/* ========================================== */}
            {/* BOTTOM SECTION: ADVANCED AI ML DASHBOARD   */}
            {/* ========================================== */}
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <BrainCircuit size={24} />
                          </div>
                          Enterprise AI Audit Engine
                      </h2>
                      <p className="text-slate-500 font-medium mt-2 max-w-3xl">
                          Live machine learning monitoring for semantic policy alignment, anti-money laundering (AML) structuring, and neuro-symbolic eligibility verifications.
                      </p>
                    </div>
                </div>
                
                <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-[#1e1e1e] ring-1 ring-black/5 relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 pointer-events-none group-hover:opacity-100 transition-opacity opacity-0"></div>
                    <ComplianceDashboard />
                </div>
            </motion.div>

        </div>
      )}
    </motion.div>
  );
};

export default ComplianceView;