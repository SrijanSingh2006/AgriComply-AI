import api from './api';

export const aiService = {
  // This connects to your Python Service via Node.js Bridge
  analyzeDocument: async (fileId) => {
    // const res = await api.post(`/analyze/${fileId}`);
    // return res.data;
    return {
      success: true,
      extractedData: { panNumber: "ABCDE1234F", name: "Ramesh Kumar" },
      docType: "PAN"
    };
  },

  checkGapAnalysis: async (userId, track) => {
    // Calls the AI engine to see if compliance/growth requirements are met
    // const res = await api.post('/gap-analysis', { userId, track });
    return { status: "missing_docs", missing: ["GSTR-1", "Audit Report"] };
  }
};