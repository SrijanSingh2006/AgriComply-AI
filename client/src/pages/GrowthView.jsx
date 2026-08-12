import React, { useEffect, useState } from 'react';
import SchemeCard from '../components/growth/SchemeCard';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const GrowthView = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // 2. Initialize hook
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

  // 3. Create Navigation Handler
  const handleCheckEligibility = (scheme) => {
      navigate('/loan-check', { state: { scheme } });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Growth Hub</h2>
        <p className="text-gray-600">
            Nationwide opportunities curated for <span className="font-bold text-blue-700">{user?.role}s</span>.
        </p>
      </div>

      {/* TABS */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
            onClick={() => { setActiveTab('schemes'); setShowAll(false); }}
            className={`pb-2 px-4 font-semibold transition-colors relative ${
                activeTab === 'schemes' 
                ? 'text-green-700 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-green-600'
            }`}
        >
            Government Schemes
        </button>
        <button
            onClick={() => { setActiveTab('loans'); setShowAll(false); }}
            className={`pb-2 px-4 font-semibold transition-colors relative ${
                activeTab === 'loans' 
                ? 'text-blue-700 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
        >
            Bank Loans & Credit
        </button>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader text={`Scanning nationwide ${activeTab} for ${user?.role}...`} />
        </div>
      ) : (
        <div>
            {/* Context Header */}
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600 border border-gray-200">
                {activeTab === 'loans' ? (
                    <p>💡 <b>Pro Tip:</b> Loans usually require financial proofs like <b>ITR</b> or <b>Bank Statements</b>. Ensure these are in your Vault.</p>
                ) : (
                    <p>💡 <b>Pro Tip:</b> Schemes often require identity proofs like <b>Aadhaar</b> and <b>Caste Certificates</b>.</p>
                )}
            </div>

            {/* The Grid */}
            {activeList.length === 0 ? (
                <p className="text-gray-500">No specific {activeTab} found right now.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {displayedItems.map((item, index) => (
                            <SchemeCard 
                                key={index} 
                                scheme={item} 
                                // 4. Pass the handler to SchemeCard
                                onApply={() => handleCheckEligibility(item)} 
                            />
                        ))}
                    </div>

                    {activeList.length > 3 && (
                        <div className="text-center pb-8 border-t border-gray-100 pt-4">
                            <button 
                                onClick={() => setShowAll(!showAll)}
                                className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 hover:text-blue-600 transition shadow-sm text-sm"
                            >
                                {showAll ? "Show Less" : `View ${activeList.length - 3} More Recommendations`}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default GrowthView;