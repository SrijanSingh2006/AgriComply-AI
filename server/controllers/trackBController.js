const Document = require('../models/Document');
const axios = require('axios');

// Use ML_URL (set by Render) or PYTHON_URL (legacy) or 127.0.0.1 for local dev
const PYTHON_SERVICE_URL = process.env.ML_URL || process.env.PYTHON_URL || 'http://127.0.0.1:5001';

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

    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/recommend`, {
        user_docs: userTags,
        profile: userProfile
      }, { timeout: 8000 });

      if (response.data && (response.data.schemes?.length || response.data.loans?.length)) {
        return res.json(response.data);
      }
    } catch (apiErr) {
      console.log("ML service fallback for schemes:", apiErr.message);
    }

    // High-quality fallback if ML service takes longer than 8s
    const fallbackData = {
      schemes: [
        { name: 'PM-KISAN (Income Support)', type: 'Central Govt', description: '₹6,000 annual financial assistance in 3 installments.', required_docs: ['Aadhaar', 'LandRecord', 'BankStatement'], match_score: 100, is_eligible: true },
        { name: 'PMFBY (Pradhan Mantri Fasal Bima)', type: 'Central Govt Insurance', description: 'Comprehensive crop loss protection against natural calamities.', required_docs: ['LandRecord', 'CropSowingCertificate', 'Aadhaar'], match_score: 100, is_eligible: true },
        { name: 'SMAM (Agricultural Mechanization)', type: 'Subsidy Scheme', description: '40% - 50% capital subsidy on tractors, solar pumps & farm equipment.', required_docs: ['Aadhaar', 'Quotation', 'LandRecord'], match_score: 67, is_eligible: false }
      ],
      loans: [
        { name: 'SBI Kisan Credit Card (KCC)', bank: 'State Bank of India', interest_rate: '7.0% p.a. (3% prompt repayment subvention)', required_docs: ['LandRecord', 'Aadhaar', 'PAN'], description: 'Concessional agricultural revolving cash credit limit.', match_score: 100, is_eligible: true },
        { name: 'HDFC Agri Machinery & Tractor Loan', bank: 'HDFC Bank', interest_rate: '10.5% p.a.', required_docs: ['BankStatement', 'Quotation', 'LandRecord'], description: 'Financing up to 90% of equipment quotation.', match_score: 67, is_eligible: false },
        { name: 'NABARD Dairy & Livestock Development', bank: 'NABARD / Lead Bank', interest_rate: '8.25% p.a.', required_docs: ['Aadhaar', 'LandRecord', 'BankStatement'], description: 'Credit facility for commercial dairy, cattle and cold chain setup.', match_score: 100, is_eligible: true }
      ]
    };

    res.json(fallbackData);
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