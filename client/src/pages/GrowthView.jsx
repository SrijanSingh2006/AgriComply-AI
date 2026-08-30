import React, { useEffect, useState } from 'react';
import SchemeCard from '../components/growth/SchemeCard';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { Lightbulb, Landmark, HandCoins } from 'lucide-react';

const GrowthView = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [data, setData] = useState({ schemes: [], loans: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schemes');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/growth/schemes');
      setData(res.data);
    } catch (err) {
      console.error("Failed to load opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  const activeList = activeTab === 'schemes' ? data.schemes : data.loans;
  const displayedItems = showAll ? activeList : activeList.slice(0, 3);

  const handleCheckEligibility = (scheme) => {
      navigate('/loan-check', { state: { scheme } });
  };

  return (
    <motion.div 
      className="p-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Growth Hub</h2>
        <p className="text-slate-500 font-medium mt-1">
            Nationwide opportunities curated for <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{user?.role}s</span>.
        </p>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-slate-200 mb-8 pb-1">
        <button
            onClick={() => { setActiveTab('schemes'); setShowAll(false); }}
            className={`px-5 py-2.5 rounded-t-xl font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'schemes' 
                ? 'text-emerald-700 bg-emerald-50/50' 
                : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'
            }`}
        >
            <Landmark size={18} /> Government Schemes
            {activeTab === 'schemes' && (
                <motion.div layoutId="growthTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-500" />
            )}
        </button>
        <button
            onClick={() => { setActiveTab('loans'); setShowAll(false); }}
            className={`px-5 py-2.5 rounded-t-xl font-bold transition-all relative flex items-center gap-2 ${
                activeTab === 'loans' 
                ? 'text-teal-700 bg-teal-50/50' 
                : 'text-slate-500 hover:text-teal-600 hover:bg-slate-50'
            }`}
        >
            <HandCoins size={18} /> Bank Loans & Credit
            {activeTab === 'loans' && (
                <motion.div layoutId="growthTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-teal-500" />
            )}
        </button>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader text={`Scanning nationwide ${activeTab} for ${user?.role}...`} />
        </div>
      ) : (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Context Header */}
            <div className="mb-6 p-4 bg-amber-50/50 rounded-2xl text-sm text-amber-800 border border-amber-200/60 shadow-sm flex items-start gap-3">
                <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={20} />
                {activeTab === 'loans' ? (
                    <p className="leading-relaxed font-medium"><b>Pro Tip:</b> Loans usually require financial proofs like <span className="font-bold bg-amber-100 px-1.5 py-0.5 rounded">ITR</span> or <span className="font-bold bg-amber-100 px-1.5 py-0.5 rounded">Bank Statements</span>. Ensure these are securely stored in your Vault.</p>
                ) : (
                    <p className="leading-relaxed font-medium"><b>Pro Tip:</b> Schemes often require identity proofs like <span className="font-bold bg-amber-100 px-1.5 py-0.5 rounded">Aadhaar</span> and <span className="font-bold bg-amber-100 px-1.5 py-0.5 rounded">Caste Certificates</span>. Ensure these are verified in your Vault.</p>
                )}
            </div>

            {/* The Grid */}
            {activeList.length === 0 ? (
                <p className="text-slate-500 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium">No specific {activeTab} found right now.</p>
            ) : (
                <>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {displayedItems.map((item, index) => (
                            <motion.div 
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <SchemeCard 
                                    scheme={item} 
                                    onApply={() => handleCheckEligibility(item)} 
                                />
                            </motion.div>
                        ))}
                    </motion.div>

                    {activeList.length > 3 && (
                        <div className="text-center pb-8 pt-2">
                            <button 
                                onClick={() => setShowAll(!showAll)}
                                className="bg-white border border-slate-200 text-slate-600 px-8 py-3 rounded-2xl font-bold hover:bg-slate-50 hover:text-emerald-700 transition-all shadow-sm hover:shadow text-sm hover:border-emerald-200 active:scale-95"
                            >
                                {showAll ? "Show Less" : `View ${activeList.length - 3} More Recommendations`}
                            </button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GrowthView;