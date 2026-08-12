import React from 'react';
const LoanStatus = ({ loanName, readiness }) => {
  // readiness is a percentage (0-100)
  return (
    <div className="bg-white p-4 border rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="font-bold text-gray-700">{loanName}</span>
        <span className="text-sm font-bold text-blue-600">{readiness}% Ready</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${readiness}%` }}
        ></div>
      </div>
      
      <p className="text-xs text-gray-500">
        {readiness === 100 
          ? "All documents ready. Apply now!" 
          : "Upload missing documents in Vault to proceed."}
      </p>
    </div>
  );
};

export default LoanStatus;