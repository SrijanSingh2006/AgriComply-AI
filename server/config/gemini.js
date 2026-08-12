require('dotenv').config();
// This is a placeholder for direct usage. 
// In this architecture, the Python Service usually handles the heavy GenAI lifting,
// but we keep keys here if Node needs to make quick text summaries.
module.exports = {
  apiKey: process.env.GEMINI_API_KEY
};