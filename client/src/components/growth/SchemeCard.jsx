import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, IndianRupee, ArrowRight, Building, Landmark } from 'lucide-react';
import { useVault } from '../../contexts/VaultContext';
import { motion } from 'framer-motion';

const SchemeCard = ({ scheme }) => {
  const navigate = useNavigate();
  const { documents } = useVault(); 

  // Get the list of required docs
  const docsToVerify = scheme.required_docs || scheme.missing_docs || [];
  
  // SMART LIVE CHECKER
  const liveMissingDocs = docsToVerify.filter(reqDoc => {
      const reqClean = reqDoc.toLowerCase().replace(/[^a-z0-9]/g, '');

      const isUploaded = documents?.some(uploadedDoc => {
          const rawTag = uploadedDoc.tag || uploadedDoc.type || uploadedDoc.classification?.type || '';
          const docClean = rawTag.toLowerCase().replace(/[^a-z0-9]/g, '');
          return docClean === reqClean;
      });

      return !isUploaded;
  });

  const isPerfectMatch = liveMissingDocs.length === 0;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-200/60 transition-all duration-300 flex flex-col h-full group"
    >
      
      {/* Header: Name & Type Badge */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
            <div className="flex gap-2 flex-wrap mb-2">
                {scheme.type && (
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1 uppercase tracking-wider
                        ${scheme.type.includes('State') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        <Landmark size={12} /> {scheme.type}
                    </span>
                )}
                {scheme.bank && (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1 uppercase tracking-wider bg-indigo-100 text-indigo-700">
                        <Building size={12} /> {scheme.bank}
                    </span>
                )}
            </div>
            <h3 className="font-extrabold text-slate-800 text-xl leading-tight group-hover:text-emerald-700 transition-colors">{scheme.name}</h3>
        </div>
        
        {/* Match Score Badge synced with Live Check */}
        <div className={`flex flex-col items-end shrink-0`}>
             <span className={`text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm border ${isPerfectMatch ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {isPerfectMatch ? '100% Match' : `${scheme.match_score || 50}% Match`}
             </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-5 flex-grow leading-relaxed">{scheme.description}</p>

      {/* Interest Rate Badge */}
      {scheme.interest_rate && (
        <div className="mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl flex items-center gap-3 border border-emerald-100/50">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600 shadow-sm">
                <IndianRupee size={16} strokeWidth={2.5} />
            </div>
            <div>
                <div className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Interest Rate</div>
                <div className="text-sm font-extrabold text-emerald-800">{scheme.interest_rate}</div>
            </div>
        </div>
      )}

      {/* Action Area */}
      <div className="mt-auto pt-5 border-t border-slate-100">
        
        {/* Missing Docs Warning */}
        {liveMissingDocs.length > 0 ? (
            <div className="mb-4">
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5 mb-2.5">
                    <AlertCircle size={14} /> Missing {liveMissingDocs.length} Document(s):
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {liveMissingDocs.slice(0, 3).map((doc, i) => (
                        <span key={i} className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-md font-medium tracking-wide">
                            {doc}
                        </span>
                    ))}
                    {liveMissingDocs.length > 3 && (
                        <span className="text-[10px] text-slate-400 pl-1 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">+{liveMissingDocs.length - 3} more</span>
                    )}
                </div>
            </div>
        ) : (
             <div className="mb-4">
                 <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 inline-flex">
                     <CheckCircle2 size={14} /> All Required Documents Uploaded
                 </p>
             </div>
        )}

        {/* Button */}
        <button 
            onClick={() => navigate('/loan-check', { state: { scheme: scheme } })}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
            Check Eligibility <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default SchemeCard;