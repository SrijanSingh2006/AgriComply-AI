import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaRupeeSign } from 'react-icons/fa';
import { useVault } from '../../contexts/VaultContext';

const SchemeCard = ({ scheme }) => {
  const navigate = useNavigate();
  const { documents } = useVault(); 

  // Get the list of required docs
  const docsToVerify = scheme.required_docs || scheme.missing_docs || [];
  
  // SMART LIVE CHECKER
  const liveMissingDocs = docsToVerify.filter(reqDoc => {
      const reqClean = reqDoc.toLowerCase().replace(/[^a-z0-9]/g, '');

      const isUploaded = documents?.some(uploadedDoc => {
          // CRITICAL FIX: Look for the tag everywhere it might be stored in your database!
          const rawTag = uploadedDoc.tag || uploadedDoc.type || uploadedDoc.classification?.type || '';
          const docClean = rawTag.toLowerCase().replace(/[^a-z0-9]/g, '');
          return docClean === reqClean;
      });

      return !isUploaded;
  });

  const isPerfectMatch = liveMissingDocs.length === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      
      {/* Header: Name & Type Badge */}
      <div className="flex justify-between items-start mb-2">
        <div>
            {scheme.type && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block uppercase tracking-wide
                    ${scheme.type.includes('State') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {scheme.type}
                </span>
            )}
            {scheme.bank && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block uppercase tracking-wide bg-purple-100 text-purple-700">
                    {scheme.bank}
                </span>
            )}
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{scheme.name}</h3>
        </div>
        
        {/* Match Score Badge synced with Live Check */}
        <div className={`flex flex-col items-end`}>
             <span className={`text-sm font-bold px-2 py-1 rounded ${isPerfectMatch ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isPerfectMatch ? '100% Match' : `${scheme.match_score || 50}% Match`}
             </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 flex-grow">{scheme.description}</p>

      {/* Interest Rate Badge */}
      {scheme.interest_rate && (
        <div className="mb-4 bg-gray-50 p-2 rounded flex items-center gap-2 border border-gray-100">
            <FaRupeeSign className="text-green-600" />
            <span className="text-xs font-bold text-gray-700">Interest Rate:</span>
            <span className="text-sm font-bold text-green-700">{scheme.interest_rate}</span>
        </div>
      )}

      {/* Action Area */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        
        {/* Missing Docs Warning */}
        {liveMissingDocs.length > 0 ? (
            <div className="mb-3">
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mb-2">
                    <FaExclamationCircle /> Missing {liveMissingDocs.length} Document(s):
                </p>
                <div className="flex flex-wrap gap-1">
                    {liveMissingDocs.slice(0, 3).map((doc, i) => (
                        <span key={i} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded font-mono">
                            {doc}
                        </span>
                    ))}
                    {liveMissingDocs.length > 3 && (
                        <span className="text-[10px] text-gray-400 pl-1">+{liveMissingDocs.length - 3} more</span>
                    )}
                </div>
            </div>
        ) : (
             <div className="mb-3">
                 <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                     <FaCheckCircle /> All Required Documents Uploaded
                 </p>
             </div>
        )}

        {/* Button */}
        <button 
            onClick={() => navigate('/loan-check', { state: { scheme: scheme } })}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
            <FaCheckCircle /> Check Eligibility
        </button>
      </div>
    </div>
  );
};

export default SchemeCard;