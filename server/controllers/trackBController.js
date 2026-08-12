const Document = require('../models/Document');
const axios = require('axios');

// Configure Python URL
const PYTHON_SERVICE_URL = process.env.PYTHON_URL || 'http://localhost:5001';

exports.getEligibleSchemes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role || 'Farmer'; 

    const userDocs = await Document.findByUserId(userId);
    const userTags = userDocs.map(d => d.tag);

    const userProfile = {
      role: userRole,
      location: "India"
    };

    const response = await axios.post(`${PYTHON_SERVICE_URL}/recommend`, {
      user_docs: userTags,
      profile: userProfile
    });

    res.json(response.data);
  } catch (err) {
    console.error("Scheme Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch AI schemes" });
  }
};

// --- NEW: Eligibility Check Bridge ---
exports.checkLoanEligibility = async (req, res) => {
  try {
    // 1. We expect the FULL loan object in body.loanDetails
    const { loanDetails } = req.body; 
    
    const userId = req.user.id;
    const userRole = req.user.role || 'Farmer';

    const userDocs = await Document.findByUserId(userId);
    const userTags = userDocs.map(d => d.tag);

    // 2. Pass everything to Python
    const response = await axios.post(`${PYTHON_SERVICE_URL}/check-eligibility`, {
      target_loan: loanDetails, 
      user_docs: userTags,
      role: userRole
    });

    res.json(response.data);

  } catch (err) {
    console.error("Eligibility Check Error:", err.message);
    res.status(500).json({ error: "Eligibility check failed" });
  }
};