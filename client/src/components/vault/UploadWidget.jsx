import React, { useState, useRef } from 'react'; // 1. Import useRef
import { useVault } from '../../contexts/VaultContext';
import { useAuth } from '../../contexts/AuthContext';
import { docService } from '../../services/docService';
import { FaCloudUploadAlt } from 'react-icons/fa';

const UploadWidget = ({ requiredType = null }) => {
  const [file, setFile] = useState(null);
  // If requiredType is passed (e.g. from Compliance Checklist), use it. Otherwise start empty.
  const [tag, setTag] = useState(requiredType || '');
  const [uploading, setUploading] = useState(false);
  
  // 2. Create a reference to the file input element
  const fileInputRef = useRef(null);
  
  const { refreshVault } = useVault();
  const { user } = useAuth();

  const roleBasedDocs = {
    'Farmer': ['PAN', 'Aadhaar', 'LandRecord', 'Kisan Credit Card', 'Bank Passbook'],
    'FPO': ['GSTR-3B', 'Audit Report', 'Registration Cert', 'Board Resolution', 'Bank Statement'],
    'MSME': ['GST Cert', 'Udyam Registration', 'Stock Statement', 'ITR-V', 'Project Report']
  };

  const suggestedDocs = roleBasedDocs[user?.role] || roleBasedDocs['Farmer'];

  const handleUpload = async () => {
    if (!file || !tag) {
        alert("Please select a file and a document type.");
        return;
    }
    
    setUploading(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tag', tag);

        await docService.uploadDocument(formData);
        await refreshVault(); 
        
        // 3. Reset the State AND the HTML Input
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file path from the input
        }

        // Only clear the tag if it wasn't forced by the parent component
        if(!requiredType) setTag(''); 
        
        alert("Upload Successful!");
    } catch (error) {
        alert("Upload Failed: " + error);
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-dashed border-blue-200 p-6 rounded-xl text-center hover:border-blue-400 transition-colors">
      <div className="mb-4">
        <FaCloudUploadAlt className="mx-auto text-4xl text-blue-400 mb-2" />
        <h3 className="font-semibold text-gray-700">
            {requiredType ? `Upload ${requiredType}` : "Upload New Document"}
        </h3>
        <p className="text-xs text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
      </div>

      {!requiredType && (
        <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                Quick Select for {user?.role || 'Farmer'}:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
                {suggestedDocs.map((docName) => (
                    <button
                        key={docName}
                        onClick={() => setTag(docName)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            tag === docName 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        {docName}
                    </button>
                ))}
            </div>
            
            <input 
                type="text" 
                placeholder="Or type document name..." 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
        </div>
      )}

      {/* 4. Attach the ref here */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files[0])} 
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />

      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`mt-4 w-full py-2 rounded-lg font-bold text-sm transition-all ${
            !file || uploading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
        }`}
      >
        {uploading ? "Uploading..." : "Secure Upload"}
      </button>
    </div>
  );
};

export default UploadWidget;