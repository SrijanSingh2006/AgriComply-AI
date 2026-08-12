import React from 'react';
import { useVault } from '../../contexts/VaultContext';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import UploadWidget from '../vault/UploadWidget';

const Checklist = ({ rules }) => {
  // We no longer need 'hasDocument' from VaultContext here, 
  // because the Backend API has already done the check (isCompliant: true/false)

  return (
    <div className="mb-6">
      <ul className="space-y-4">
        {rules.map((rule, index) => (
          <li key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            
            {/* Header: Rule Name & Status Icon */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    {rule.isCompliant ? (
                        <FaCheckCircle className="text-green-500 text-xl"/>
                    ) : (
                        <FaExclamationTriangle className="text-orange-500 text-xl"/>
                    )}
                    <div>
                        <h4 className={`font-semibold ${rule.isCompliant ? 'text-green-800' : 'text-gray-800'}`}>
                            {rule.ruleName}
                        </h4>
                        <p className="text-xs text-gray-500">
                            Required: <span className="font-mono bg-gray-200 px-1 rounded">{rule.requiredDoc}</span>
                        </p>
                    </div>
                </div>
                
                {/* Due Date Badge */}
                <span className="text-xs font-semibold bg-white border px-2 py-1 rounded text-gray-500">
                    Due: {new Date(rule.dueDate).toLocaleDateString()}
                </span>
            </div>

            {/* Action Area: Show Upload Button if Missing */}
            {!rule.isCompliant && (
                <div className="mt-3 pl-8">
                    <p className="text-xs text-red-500 mb-2">
                        Document missing from Vault.
                    </p>
                    {/* Reusing our Smart Upload Widget, pre-filled with the missing tag */}
                    <div className="scale-95 origin-left">
                        <UploadWidget requiredType={rule.requiredDoc} />
                    </div>
                </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Checklist;