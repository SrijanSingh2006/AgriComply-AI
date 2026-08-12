import api from './api';

export const docService = {
  // 1. Fetch REAL files from your Database
  getAllDocuments: async () => {
    try {
      const res = await api.get('/vault'); // Calls server/controllers/vaultController.js
      return res.data;
    } catch (error) {
      console.error("Could not fetch docs", error);
      return [];
    }
  },
  
  // 2. Upload REAL files to your 'uploads' folder
  uploadDocument: async (formData) => {
    try {
      const res = await api.post('/vault/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Upload failed";
    }
  }
};