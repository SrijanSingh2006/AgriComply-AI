import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFilePdf, FaImage, FaTrash, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';
import { useVault } from '../contexts/VaultContext';

const VaultView = () => {
  const { files, refreshVault } = useVault();
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState(null); // ID of file being replaced

  // --- DROPZONE LOGIC ---
  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    const formData = new FormData();
    
    // If replacing, append the ID so backend knows which file to update
    if (replacingId) {
        formData.append('replaceId', replacingId);
    }
    
    formData.append('file', acceptedFiles[0]);
    // Auto-tag based on filename for simplicity in this demo
    const tag = acceptedFiles[0].name.split('.')[0].toUpperCase(); 
    formData.append('tag', tag);

    try {
      if (replacingId) {
          // Call Replace Endpoint
          await api.put(`/vault/replace/${replacingId}`, formData);
          alert("Document updated successfully!");
      } else {
          // Call Upload Endpoint
          await api.post('/vault/upload', formData);
          alert("Document uploaded successfully!");
      }
      refreshVault(); // Refresh list
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload/replace document.");
    } finally {
      setUploading(false);
      setReplacingId(null); // Reset replace mode
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // --- DELETE LOGIC ---
  const handleDelete = async (fileId) => {
      if (window.confirm("Are you sure you want to delete this document? This might affect your loan eligibility.")) {
          try {
              await api.delete(`/vault/delete/${fileId}`);
              refreshVault();
              alert("Document deleted.");
          } catch (err) {
              console.error("Delete failed", err);
              alert("Could not delete file.");
          }
      }
  };

  // --- REPLACE TRIGGER ---
  const handleReplace = (fileId) => {
      setReplacingId(fileId);
      // Programmatically open the dropzone or scroll to it
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert("Please upload the new file in the dropzone above to replace the old one.");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Document Vault</h1>
        <p className="text-gray-600">Manage your financial records securely.</p>
      </header>

      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition 
            ${replacingId ? 'border-orange-400 bg-orange-50' : 'border-blue-300 hover:bg-blue-50'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
            <p className="text-blue-600 font-semibold animate-pulse">Processing file...</p>
        ) : replacingId ? (
            <div className="text-orange-600">
                <FaExchangeAlt className="mx-auto text-4xl mb-3" />
                <p className="font-bold">Upload new file to REPLACE selected document</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); setReplacingId(null); }}
                    className="mt-2 text-xs underline"
                >
                    Cancel Replacement
                </button>
            </div>
        ) : (
            <div className="text-gray-500">
                <FaCloudUploadAlt className="mx-auto text-4xl mb-3 text-blue-400" />
                <p>Drag & drop new files here, or click to select</p>
            </div>
        )}
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {files.map((file) => (
          <div key={file.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition relative group">
            
            {/* Tag Badge */}
            <span className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                {file.tag}
            </span>

            <div className="flex items-center gap-3 mb-3">
                {file.type?.includes('pdf') ? (
                    <FaFilePdf className="text-red-500 text-3xl" />
                ) : (
                    <FaImage className="text-green-500 text-3xl" />
                )}
                <div className="overflow-hidden">
                    <h3 className="font-bold text-gray-700 truncate">{file.filename}</h3>
                    <p className="text-xs text-gray-500">Uploaded on {new Date(file.upload_date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Action Buttons (Delete / Replace) */}
            <div className="border-t pt-3 flex justify-between">
                <button 
                    onClick={() => handleReplace(file.id)}
                    className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition"
                >
                    <FaExchangeAlt /> Replace
                </button>
                
                <button 
                    onClick={() => handleDelete(file.id)}
                    className="text-sm text-red-500 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition"
                >
                    <FaTrash /> Delete
                </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default VaultView;