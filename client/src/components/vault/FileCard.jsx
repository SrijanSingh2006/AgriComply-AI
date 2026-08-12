import React from 'react';
import { FaFilePdf, FaFileImage, FaDownload, FaEye } from 'react-icons/fa';

const FileCard = ({ file }) => {
  // SAFETY FIX: 
  // 1. We check if file_name exists. 
  // 2. We use '|| ""' to fallback to an empty string if it's null/undefined.
  const fileName = file.file_name || file.fileName || "Unknown File"; 
  
  // Now it's safe to use .includes()
  const isPdf = fileName.toLowerCase().includes('.pdf');

  // Format the date safely
  const uploadDate = file.upload_date 
    ? new Date(file.upload_date).toLocaleDateString() 
    : 'Unknown Date';

  // Base URL for viewing files (Points to your backend static folder)
  // Ensure your backend is serving static files from 'uploads'
  const fileUrl = `http://localhost:5000/${file.file_path}`; 

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      
      {/* Icon & Details Section */}
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={`p-3 rounded-lg ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
          {isPdf ? <FaFilePdf className="text-2xl" /> : <FaFileImage className="text-2xl" />}
        </div>
        
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-800 truncate pr-2" title={fileName}>
            {fileName}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
              {file.tag || "Uncategorized"}
            </span>
            <span>• {uploadDate}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="View File"
        >
          <FaEye />
        </a>
        
        <a 
          href={fileUrl} 
          download
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
          title="Download"
        >
          <FaDownload />
        </a>
      </div>

    </div>
  );
};

export default FileCard;