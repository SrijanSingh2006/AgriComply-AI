import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, FileText, Image as ImageIcon, Trash2, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import api from '../services/api';
import { useVault } from '../contexts/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';

const VaultView = () => {
  const { files, refreshVault } = useVault();
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState(null); 

  // --- DROPZONE LOGIC ---
  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    const formData = new FormData();
    
    if (replacingId) {
        formData.append('replaceId', replacingId);
    }
    
    formData.append('file', acceptedFiles[0]);
    const tag = acceptedFiles[0].name.split('.')[0].toUpperCase(); 
    formData.append('tag', tag);

    try {
      if (replacingId) {
          await api.put(`/vault/replace/${replacingId}`, formData);
          alert("Document updated successfully!");
      } else {
          await api.post('/vault/upload', formData);
          alert("Document uploaded successfully!");
      }
      refreshVault(); 
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload/replace document.");
    } finally {
      setUploading(false);
      setReplacingId(null); 
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // --- DELETE LOGIC ---
  const handleDelete = async (fileId) => {
      if (window.confirm("Are you sure you want to delete this document? This might affect your loan eligibility.")) {
          try {
              await api.delete(`/vault/delete/${fileId}`);
              refreshVault();
          } catch (err) {
              console.error("Delete failed", err);
              alert("Could not delete file.");
          }
      }
  };

  // --- REPLACE TRIGGER ---
  const handleReplace = (fileId) => {
      setReplacingId(fileId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="mb-8 border-b border-slate-200 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" size={32} /> Secure Vault
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage and encrypt your financial records securely.</p>
        </div>
      </header>

      {/* Upload Area */}
      <motion.div 
        {...getRootProps()} 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 shadow-sm
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 
              replacingId ? 'border-orange-400 bg-orange-50/50 hover:bg-orange-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {uploading ? (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-blue-600 flex flex-col items-center">
                  <CloudUpload className="animate-bounce mb-3" size={48} />
                  <p className="font-semibold text-lg">Encrypting and uploading file...</p>
              </motion.div>
          ) : replacingId ? (
              <motion.div key="replacing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-orange-600 flex flex-col items-center">
                  <RefreshCw className="text-orange-500 mb-3" size={48} />
                  <p className="font-bold text-lg">Upload new file to REPLACE selected document</p>
                  <button 
                      onClick={(e) => { e.stopPropagation(); setReplacingId(null); }}
                      className="mt-3 text-sm font-semibold bg-white px-4 py-1.5 rounded-full border border-orange-200 shadow-sm hover:bg-orange-100 transition-colors"
                  >
                      Cancel Replacement
                  </button>
              </motion.div>
          ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-500 flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-4 transition-colors ${isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CloudUpload size={48} />
                  </div>
                  <p className="font-semibold text-lg text-slate-700">Drag & drop new files here</p>
                  <p className="text-sm mt-1">or click to browse from your device</p>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        <AnimatePresence>
          {files.map((file, idx) => (
            <motion.div 
              key={file.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 relative group"
            >
              
              {/* Tag Badge */}
              <span className="absolute top-4 right-4 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                  {file.tag}
              </span>

              <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${file.type?.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {file.type?.includes('pdf') ? <FileText size={28} /> : <ImageIcon size={28} />}
                  </div>
                  <div className="overflow-hidden pr-10">
                      <h3 className="font-bold text-slate-800 truncate text-lg">{file.filename}</h3>
                      <p className="text-xs text-slate-500 font-medium">Uploaded {new Date(file.upload_date).toLocaleDateString()}</p>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <button 
                      onClick={() => handleReplace(file.id)}
                      className="text-sm text-blue-600 font-semibold flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                      <RefreshCw size={16} /> Replace
                  </button>
                  
                  <button 
                      onClick={() => handleDelete(file.id)}
                      className="text-sm text-slate-500 font-semibold flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                      <Trash2 size={16} /> Delete
                  </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VaultView;