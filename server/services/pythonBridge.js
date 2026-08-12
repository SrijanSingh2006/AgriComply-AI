const axios = require('axios');

// Assuming Python Flask/FastAPI is running on port 5001
const PYTHON_SERVICE_URL = process.env.PYTHON_URL || 'http://localhost:5001';

const analyzeDocument = async (filePath) => {
  try {
    // In a real scenario, you might send the file stream or just the path
    const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze`, {
      filePath: filePath
    });
    return response.data;
  } catch (error) {
    console.error("Python Service Error:", error.message);
    return { success: false, error: "AI Service Unavailable" };
  }
};

module.exports = { analyzeDocument };