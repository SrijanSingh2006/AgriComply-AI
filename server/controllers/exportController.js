const zipService = require('../services/zipService');

// TRACK A: Download Filing Bundle (Auditor Ready)
exports.downloadComplianceBundle = async (req, res) => {
  try {
    const userId = req.user.id;
    // In a real app, you might fetch these tags from the 'compliance_rules' table
    const requiredTags = ['PAN', 'Aadhaar', 'GSTR-3B', 'ITR-V'];
    
    await zipService.createBundle(userId, requiredTags, 'Compliance_Filing_Bundle', res);
  } catch (err) {
    console.error("Export Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};

// TRACK B: Download Loan Application Packet (Bank Ready)
exports.downloadLoanPacket = async (req, res) => {
  try {
    const userId = req.user.id;
    // In a real app, these tags come from the specific Scheme the user clicked on
    const requiredTags = ['PAN', 'Aadhaar', 'LandRecord', 'Quotation'];

    await zipService.createBundle(userId, requiredTags, 'Loan_Application_Packet', res);
  } catch (err) {
    console.error("Export Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};