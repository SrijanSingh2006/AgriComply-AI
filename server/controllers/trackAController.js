const db = require('../config/db'); // Database connection
const Document = require('../models/Document');

exports.getComplianceStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    // Default to 'Farmer' if role is missing for any reason
    const userRole = req.user.role || 'Farmer'; 

    console.log(`Fetching compliance rules for User Role: ${userRole}`);

    // 1. Fetch Rules SPECIFIC to this Role (or 'ALL')
    // We use a raw SQL query here to handle the OR condition easily
    const [rules] = await db.execute(
        "SELECT * FROM compliance_rules WHERE applicable_role = ? OR applicable_role = 'ALL'", 
        [userRole]
    );
    
    // 2. Get User's Uploaded Documents from the Vault
    const userDocs = await Document.findByUserId(userId);
    
    // Create a simple array of tags the user HAS (e.g., ['PAN', 'LandRecord'])
    const userTags = userDocs.map(d => d.tag);

    // 3. Gap Analysis (Compare Rules vs. User Docs)
    const status = rules.map(rule => {
      // Check if the user has the required document tag
      const hasDoc = userTags.includes(rule.required_doc_tag);
      
      return {
        ruleName: rule.rule_name,
        requiredDoc: rule.required_doc_tag,
        isCompliant: hasDoc,
        dueDate: rule.due_date,
        // Optional: You can calculate specific penalty amounts here if needed
        penalty: hasDoc ? "None" : "₹100/day" 
      };
    });

    res.json(status);

  } catch (err) {
    console.error("Compliance Check Error:", err);
    res.status(500).json({ error: err.message });
  }
};