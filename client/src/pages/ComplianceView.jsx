import React, { useEffect, useState } from 'react';
import Checklist from '../components/compliance/Checklist';
import ComplianceDashboard from '../components/compliance/ComplianceDashboard'; // 🌟 NEW ML DASHBOARD IMPORT
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';

const ComplianceView = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceStatus();
  }, []);

  const fetchComplianceStatus = async () => {
    try {
      // This calls trackAController.js -> getComplianceStatus
      // The BACKEND already filters by Role (Farmer vs FPO)
      const res = await api.get('/compliance/status');
      setRules(res.data);
    } catch (err) {
      console.error("Failed to load compliance rules", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate stats
  const pendingCount = rules.filter(r => !r.isCompliant).length;
  const nextDeadline = rules
    .filter(r => !r.isCompliant)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Compliance Manager</h2>
            <p className="text-gray-600 text-sm">
                Showing requirements for: <span className="font-bold text-blue-700">{user?.role || "Farmer"}</span>
            </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
             <Loader text={`Loading ${user?.role} obligations...`} />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
            {/* ========================================== */}
            {/* TOP SECTION: STANDARD COMPLIANCE CHECKLIST */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: The Checklist */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex justify-between">
                        Mandatory Filings
                        <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded">
                            {rules.length} Total Rules
                        </span>
                    </h3>
                    
                    {rules.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No specific rules found for this role.</p>
                    ) : (
                        // We pass the API data directly to the Checklist component
                        <Checklist rules={rules} />
                    )}
                </div>

                {/* RIGHT COLUMN: Actions & Alerts */}
                <div className="space-y-6">
                    
                    {/* 1. Status Card */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                        
                        {pendingCount > 0 ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
                                <p className="text-red-800 font-bold flex items-center gap-2">
                                    ⚠️ Action Required
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                    You have <b>{pendingCount}</b> pending compliances.
                                </p>
                                {nextDeadline && (
                                    <p className="text-xs text-red-600 mt-2 font-semibold">
                                        Next Deadline: {new Date(nextDeadline.dueDate).toDateString()} <br/>
                                        ({nextDeadline.ruleName})
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
                                <p className="text-green-800 font-bold">✅ All Clear</p>
                                <p className="text-sm text-green-700">You are fully compliant for this period.</p>
                            </div>
                        )}
                    </div>

                    {/* 2. Export Button */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">Auditor Ready?</h3>
                        <p className="text-sm text-blue-700 mb-4">
                            Download all your {user?.role} compliance documents in a single ZIP file.
                        </p>
                        <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
                            Download Filing Bundle
                        </button>
                    </div>

                </div>
            </div>

            {/* ========================================== */}
            {/* BOTTOM SECTION: ADVANCED AI ML DASHBOARD   */}
            {/* ========================================== */}
            <div className="mt-4 border-t-2 border-gray-200 pt-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span>🤖</span> Enterprise AI Audit Engine
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Live machine learning monitoring for semantic policy alignment, anti-money laundering (AML) structuring, and neuro-symbolic eligibility verifications.
                    </p>
                </div>
                
                {/* The ML Dashboard Component (Wrapped in a shadow box for a clean look) */}
                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-[#1e1e1e]">
                    <ComplianceDashboard />
                </div>
            </div>

        </div>
      )}
    </div>
  );
};

export default ComplianceView;