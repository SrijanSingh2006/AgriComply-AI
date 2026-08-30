import React, { useEffect, useState } from 'react';
import { useVault } from '../contexts/VaultContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FilingCard from '../components/vault/FilingCard';
import Loader from '../components/common/Loader';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, FileText, TrendingUp, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { files } = useVault(); 
  
  const [growthData, setGrowthData] = useState({ schemes: [], loans: [] });
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const res = await api.get('/growth/schemes'); 
        setGrowthData({
            schemes: res.data.schemes || [],
            loans: res.data.loans || []
        });
      } catch (err) {
        console.error("Failed to load insights", err);
      } finally {
        setLoadingSchemes(false);
      }
    };
    fetchAIInsights();
  }, []);

  const totalDocs = files.length;
  
  const getCriticalDocs = (role) => {
      switch(role) {
          case 'FPO': return ['GSTR-3B', 'Audit Report'];
          case 'MSME': return ['GST Certificate', 'Udyam Registration'];
          default: return ['PAN', 'Aadhaar', 'LandRecord'];
      }
  };

  const mandatoryDocs = getCriticalDocs(user?.role);
  const missingDocs = mandatoryDocs.filter(req => !files.some(f => f.tag === req));
  const complianceAlerts = missingDocs.length;

  const allOpportunities = [...growthData.schemes, ...growthData.loans];
  const eligibleLoans = allOpportunities.filter(s => s.is_eligible).length;

  const displayItems = allOpportunities.slice(0, 3);

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'FPO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MSME': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Welcome, {user?.name}
            </h1>
            <span className={`self-start md:self-auto px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide shadow-sm ${getRoleBadgeColor(user?.role)}`}>
              {user?.role || "Farmer"} Account
            </span>
        </div>
        <p className="text-slate-500 font-medium">
          You have <span className="font-bold text-slate-700">{totalDocs} documents</span> secured in your Vault.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={24} /></div>
            <div className="text-3xl font-bold text-slate-800">{totalDocs}</div>
          </div>
          <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Documents</div>
        </motion.div>
        
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className={`p-5 rounded-xl border flex flex-col justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${complianceAlerts > 0 ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg ${complianceAlerts > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {complianceAlerts > 0 ? <AlertCircle size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div className={`text-3xl font-bold ${complianceAlerts > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {complianceAlerts}
            </div>
          </div>
          <div className={`text-sm font-semibold mt-1 uppercase tracking-wider ${complianceAlerts > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {complianceAlerts > 0 ? "Critical Docs Missing" : "Core Compliance Met"}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp size={24} /></div>
            <div className="text-3xl font-bold text-slate-800">{loadingSchemes ? "-" : eligibleLoans}</div>
          </div>
          <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Ready to Apply</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Compliance Section */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              {user?.role || 'Farmer'} Compliance
            </h2>
            <Link to="/compliance" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">View Checklist</Link>
          </div>

          {missingDocs.length > 0 ? (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="border border-red-200 bg-red-50/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-red-600"><AlertCircle size={64} /></div>
              <h3 className="font-bold text-red-800 flex items-center gap-2 text-lg">
                Action Required
              </h3>
              <p className="text-sm text-red-700 mt-2 mb-4 font-medium">
                Please upload the following documents to secure your compliance:
              </p>
              <ul className="space-y-2 mb-6 relative z-10">
                {missingDocs.map(doc => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-red-800 font-semibold bg-white px-3 py-2 rounded-lg border border-red-100 shadow-sm w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {doc}
                  </li>
                ))}
              </ul>
              <Link to="/vault" className="relative z-10">
                <button className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-red-700 hover:shadow-md transition-all active:scale-95">
                  Upload Documents Now
                </button>
              </Link>
            </motion.div>
          ) : (
             <FilingCard 
                title={`${user?.role === 'FPO' ? 'GST Filing' : 'Tax Filing'} Status`} 
                dueDate="Upcoming" 
                status="Ready" 
             />
          )}
        </section>

        {/* Growth Section */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Growth Opportunities
            </h2>
            <Link to="/growth" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">View All Offers</Link>
          </div>

          {loadingSchemes ? (
             <div className="bg-white p-8 rounded-xl border border-slate-200 flex flex-col items-center justify-center h-48 shadow-sm">
               <Loader text={`Finding ${user?.role} schemes...`} />
             </div>
          ) : displayItems.length > 0 ? (
            <div className="space-y-4">
              {displayItems.map((scheme, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
                  <div className="flex justify-between mb-3 items-start">
                    <span className="font-bold text-slate-800 pr-2 group-hover:text-blue-700 transition-colors">{scheme.name}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm ${scheme.match_score === 100 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                      {scheme.match_score}% Ready
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${scheme.match_score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-2 rounded-full ${scheme.match_score === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    />
                  </div>
                  {scheme.missing_docs && scheme.missing_docs.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Missing:</span>
                        {scheme.missing_docs.slice(0,3).map((doc, i) => (
                            <span key={i} className="text-[10px] bg-white text-red-600 px-2 py-0.5 rounded border border-red-200 font-bold uppercase shadow-sm">
                                {doc}
                            </span>
                        ))}
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-between items-center bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle size={14} /> Fully Eligible - Ready to Apply
                        </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 flex flex-col items-center justify-center">
              <FileText size={48} className="text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Upload more documents to unlock exclusive {user?.role} loan offers.</p>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default Dashboard;