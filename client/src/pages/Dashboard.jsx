import React, { useEffect, useState } from 'react';
import { useVault } from '../contexts/VaultContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FilingCard from '../components/vault/FilingCard';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const { files } = useVault(); 
  
  // FIX 1: Initialize state to match the new structure
  const [growthData, setGrowthData] = useState({ schemes: [], loans: [] });
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const res = await api.get('/growth/schemes'); 
        // Backend now returns { schemes: [], loans: [] }
        // We ensure it's always an object with arrays
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

  // FIX 2: Calculate stats by combining both lists safely
  const allOpportunities = [...growthData.schemes, ...growthData.loans];
  const eligibleLoans = allOpportunities.filter(s => s.is_eligible).length;

  // Helper to pick top items for display (Mix of loans and schemes)
  const displayItems = allOpportunities.slice(0, 3);

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'FPO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MSME': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 border-b pb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.name}
            </h1>
            <span className={`self-start md:self-auto px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getRoleBadgeColor(user?.role)}`}>
              {user?.role || "Farmer"} Account
            </span>
        </div>
        <p className="text-gray-600">
          You have <span className="font-bold text-gray-800">{totalDocs} documents</span> secured in your Vault.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col justify-center">
          <div className="text-3xl font-bold text-blue-700">{totalDocs}</div>
          <div className="text-sm text-blue-600">Total Documents</div>
        </div>
        
        <div className={`p-4 rounded-lg border flex flex-col justify-center ${complianceAlerts > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <div className={`text-3xl font-bold ${complianceAlerts > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {complianceAlerts}
          </div>
          <div className={`text-sm font-semibold mb-1 ${complianceAlerts > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {complianceAlerts > 0 ? "Critical Docs Missing" : "Core Compliance Met"}
          </div>
          {complianceAlerts > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {missingDocs.map(doc => (
                <span key={doc} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200 font-medium">
                  {doc}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col justify-center">
          <div className="text-3xl font-bold text-green-700">{loadingSchemes ? "-" : eligibleLoans}</div>
          <div className="text-sm text-green-600">Schemes Ready to Apply</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Compliance Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              {user?.role || 'Farmer'} Compliance
            </h2>
            <Link to="/compliance" className="text-sm text-blue-600 hover:underline">View Checklist</Link>
          </div>

          {missingDocs.length > 0 ? (
            <div className="border border-red-200 bg-red-50 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                ⚠️ Action Required
              </h3>
              <p className="text-sm text-red-700 mt-2 mb-3">
                Please upload the following documents:
              </p>
              <ul className="list-disc list-inside text-sm text-red-800 mb-4 font-medium pl-2">
                {missingDocs.map(doc => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
              <Link to="/vault">
                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition">
                  Upload Now
                </button>
              </Link>
            </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-green-600 rounded-full"></span>
              Growth Opportunities
            </h2>
            <Link to="/growth" className="text-sm text-green-600 hover:underline">View All</Link>
          </div>

          {loadingSchemes ? (
             <div className="bg-white p-6 rounded-lg border flex flex-col items-center justify-center h-32">
               <Loader text={`Finding ${user?.role} schemes...`} />
             </div>
          ) : displayItems.length > 0 ? (
            <div className="space-y-4">
              {displayItems.map((scheme, idx) => (
                <div key={idx} className="bg-white p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-700 truncate pr-2">{scheme.name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${scheme.match_score === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                      {scheme.match_score}% Ready
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${scheme.match_score === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${scheme.match_score}%` }}
                    ></div>
                  </div>
                  {scheme.missing_docs && scheme.missing_docs.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2 items-center">
                        <span className="text-xs text-gray-500 mr-1">Missing:</span>
                        {scheme.missing_docs.slice(0,3).map((doc, i) => (
                            <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-medium uppercase">
                                {doc}
                            </span>
                        ))}
                    </div>
                  ) : (
                    <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                            ✓ Fully Eligible
                        </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <p>Upload documents to unlock {user?.role} loan offers.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;