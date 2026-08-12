import React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import { docService } from '../services/docService';

const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all user files on startup
  useEffect(() => {
    refreshVault();
  }, []);

  const refreshVault = async () => {
    setLoading(true);
    try {
        // Mock API call - replace with actual API
        const data = await docService.getAllDocuments(); 
        setFiles(data);
    } catch (error) {
        console.error("Failed to fetch vault", error);
    } finally {
        setLoading(false);
    }
  };

  // Helper: Check if a specific doc type exists in the vault
  const hasDocument = (docType) => {
    return files.some(f => f.type === docType);
  };

  return (
    <VaultContext.Provider value={{ files, refreshVault, hasDocument, loading }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);