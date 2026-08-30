const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const SERVER_URL = "http://localhost:5000";
const ML_URL = "http://localhost:5001";
const CLIENT_URL = "http://localhost:3000";
const DEMO_DIR = path.resolve(__dirname, "../demo_documents");

let authToken = "";
let results = [];

function record(name, pass, details) {
  results.push({ name, pass, details });
  console.log(`${pass ? "? PASS" : "? FAIL"}: ${name} - ${details}`);
}

async function runLiveTest() {
  console.log("\n=======================================================");
  console.log("   AgriComply AI - Comprehensive Full System Audit    ");
  console.log("=======================================================\n");

  // 1. Health Checks
  try {
    const sRes = await axios.get(`${SERVER_URL}/health`);
    record("1. Node.js Backend Health", sRes.status === 200, JSON.stringify(sRes.data));
  } catch (e) { record("1. Node.js Backend Health", false, e.message); }

  try {
    const mlRes = await axios.get(`${ML_URL}/health`);
    record("2. Python ML Microservice Health", mlRes.status === 200, JSON.stringify(mlRes.data));
  } catch (e) { record("2. Python ML Microservice Health", false, e.message); }

  try {
    const geminiRes = await axios.get(`${ML_URL}/debug`);
    record("3. Google Gemini 3.7 AI Connection", geminiRes.data.ai_test.includes("SUCCESS"), geminiRes.data.ai_test);
  } catch (e) { record("3. Google Gemini 3.7 AI Connection", false, e.message); }

  try {
    const cRes = await axios.get(CLIENT_URL);
    record("4. React Vite Frontend UI", cRes.status === 200, `HTTP ${cRes.status}`);
  } catch (e) { record("4. React Vite Frontend UI", false, e.message); }

  // 2. Authentication
  try {
    const logRes = await axios.post(`${SERVER_URL}/api/auth/login`, {
      email: "farmer@demo.com",
      password: "demo123"
    });
    authToken = logRes.data.token;
    record("5. Farmer Authentication (JWT Login)", !!authToken, `Logged in as: ${logRes.data.user.name} (${logRes.data.user.role})`);
  } catch (e) { record("5. Farmer Authentication (JWT Login)", false, e.message); }

  const authHeaders = { Authorization: `Bearer ${authToken}` };

  // 3. Document Vault Uploads with Real Demo Documents
  const uploadDocs = [
    { file: "1_Aadhaar_Card_John_Farmer.pdf", expectedType: "Aadhaar" },
    { file: "2_PAN_Card_John_Farmer.pdf", expectedType: "PAN" },
    { file: "3_Land_Record_7_12_Extract.pdf", expectedType: "LandRecord" },
    { file: "4_Bank_Statement_SBI_Agri.pdf", expectedType: "BankStatement" }
  ];

  for (const doc of uploadDocs) {
    try {
      const filePath = path.join(DEMO_DIR, doc.file);
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));
      const upRes = await axios.post(`${SERVER_URL}/api/vault/upload`, form, {
        headers: { ...authHeaders, ...form.getHeaders() }
      });
      record(`6. Vault Upload & Classification (${doc.expectedType})`, upRes.data.success && upRes.data.document.type === doc.expectedType, `Type: ${upRes.data.document.type}, Hash: ${upRes.data.document.hash ? upRes.data.document.hash.slice(0, 16) + "..." : "none"}`);
    } catch (e) { record(`6. Vault Upload & Classification (${doc.expectedType})`, false, e.message); }
  }

  // 4. Retrieve Vault Inventory
  try {
    const listRes = await axios.get(`${SERVER_URL}/api/vault`, { headers: authHeaders });
    record("7. Vault Document Inventory Query", listRes.data.success && listRes.data.documents.length >= 4, `Total Vault Records: ${listRes.data.documents.length}`);
  } catch (e) { record("7. Vault Document Inventory Query", false, e.message); }

  // 5. Compliance Gap Analysis
  try {
    const compRes = await axios.get(`${SERVER_URL}/api/compliance/rules?role=Farmer`, { headers: authHeaders });
    record("8. Role-Specific Compliance Checklist", compRes.data.success && compRes.data.rules.length > 0, `Rules Evaluated: ${compRes.data.rules.length}`);
  } catch (e) { record("8. Role-Specific Compliance Checklist", false, e.message); }

  // 6. Alternative Credit Scoring (XGBoost + SHAP)
  try {
    const csRes = await axios.post(`${ML_URL}/growth/credit-score`, {
      land_size: 3.5,
      annual_turnover: 540000,
      existing_loans: 0,
      experience_years: 10
    });
    record("9. ML Alternative Credit Scoring (AgriScore & SHAP)", csRes.data.agriscore > 300, `AgriScore: ${csRes.data.agriscore} (${csRes.data.risk_level}), Model R²: ${csRes.data.model_accuracy}`);
  } catch (e) { record("9. ML Alternative Credit Scoring (AgriScore & SHAP)", false, e.message); }

  // 7. Senior Credit Officer AI Underwriting (Gemini 3.7 Flash)
  try {
    const loanRes = await axios.post(`${ML_URL}/growth/advanced-check`, {
      loan_amount: 500000,
      tenure_years: 5,
      selected_bank: "State Bank of India",
      user_id: 1,
      role: "Farmer"
    });
    record("10. Senior Credit Officer Multimodal AI Evaluation", !!loanRes.data.approval_odds, `Approval Odds: ${loanRes.data.approval_odds}%, Status: ${loanRes.data.loan_status}`);
  } catch (e) { record("10. Senior Credit Officer Multimodal AI Evaluation", false, e.message); }

  // 8. Government Scheme Discovery
  try {
    const schemeRes = await axios.post(`${ML_URL}/recommend`, {
      role: "Farmer",
      user_id: 1
    });
    record("11. Government Subsidy & Scheme Discovery", schemeRes.data.recommendations && schemeRes.data.recommendations.length > 0, `Found ${schemeRes.data.recommendations.length} Active Schemes`);
  } catch (e) { record("11. Government Subsidy & Scheme Discovery", false, e.message); }

  // 9. Error Level Analysis (ELA) Fraud Scanner
  try {
    const tamperedPath = path.join(DEMO_DIR, "6_Tampered_Land_Record_Fraud_Test.jpg");
    const form = new FormData();
    form.append("file", fs.createReadStream(tamperedPath));
    const elaRes = await axios.post(`${ML_URL}/security/forgery-check`, form, { headers: form.getHeaders() });
    record("12. Error Level Analysis (ELA) Pixel Forgery Scanner", elaRes.data.status === "SUCCESS", `Scan Result: ${elaRes.data.result}, Tamper Score: ${elaRes.data.forgery_score}%`);
  } catch (e) { record("12. Error Level Analysis (ELA) Pixel Forgery Scanner", false, e.message); }

  // 10. Vector RAG Rulebook Ingestion
  try {
    const rulebookPath = path.join(DEMO_DIR, "5_Official_Rulebook_PM_KISAN_Guidelines.pdf");
    const form = new FormData();
    form.append("file", fs.createReadStream(rulebookPath));
    const ingestRes = await axios.post(`${ML_URL}/admin/ingest-pdf`, form, { headers: form.getHeaders() });
    record("13. Vector RAG Document Embedding Ingestion", ingestRes.status === 200, ingestRes.data.message);
  } catch (e) { record("13. Vector RAG Document Embedding Ingestion", false, e.message); }

  // 11. Legal AI Assistant RAG Query
  try {
    const askRes = await axios.post(`${ML_URL}/legal/ask`, {
      question: "What is the annual financial assistance under PM-KISAN and how is it paid?"
    });
    record("14. Agentic Legal AI RAG Response", askRes.data.answer && askRes.data.answer.includes("6,000"), `Response Length: ${askRes.data.answer.length} chars (Verified PM-KISAN figures)`);
  } catch (e) { record("14. Agentic Legal AI RAG Response", false, e.message); }

  // 12. Pre-Flight KYC Entity Resolution (Levenshtein Fuzzy Match)
  try {
    const bundlerRes = await axios.post(`${ML_URL}/api/bundler/process-bundle`, {
      files: ["1_Aadhaar_Card_John_Farmer.pdf", "2_PAN_Card_John_Farmer.pdf"]
    });
    record("15. Pre-Flight KYC Levenshtein Entity Matcher", bundlerRes.data.status === "SUCCESS", `Identity Match: ${bundlerRes.data.identity_consistency}%`);
  } catch (e) { record("15. Pre-Flight KYC Levenshtein Entity Matcher", false, e.message); }

  // 13. Generative Portal Image Optimizer
  try {
    const optRes = await axios.post(`${ML_URL}/api/bundler/optimize`, {
      filename: "6_Tampered_Land_Record_Fraud_Test.jpg"
    });
    record("16. Generative Portal Image Optimizer", optRes.data.status === "SUCCESS", `Cleaned & Optimized: ${optRes.data.optimized_file}`);
  } catch (e) { record("16. Generative Portal Image Optimizer", false, e.message); }

  // 14. Keystroke Behavioral Biometrics
  try {
    const bioRes = await axios.post(`${ML_URL}/api/security/keystrokes`, {
      intervals: [120, 145, 98, 160, 110, 135, 150]
    });
    record("17. Keystroke Behavioral Biometrics (Bot Defense)", bioRes.data.status === "SUCCESS", `Pattern: ${bioRes.data.behavior}`);
  } catch (e) { record("17. Keystroke Behavioral Biometrics (Bot Defense)", false, e.message); }

  // 15. Zero-Trust SHA-256 Crypto Sealing
  try {
    const hashRes = await axios.post(`${ML_URL}/api/security/hash-document`, {
      document_content: "UNIQUE IDENTIFICATION AUTHORITY OF INDIA - John Farmer"
    });
    record("18. Zero-Trust SHA-256 Cryptographic Sealer", hashRes.data.status === "SUCCESS", `SHA-256 Digest: ${hashRes.data.hash.slice(0, 24)}...`);
  } catch (e) { record("18. Zero-Trust SHA-256 Cryptographic Sealer", false, e.message); }

  console.log("\n=======================================================");
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`  SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round(passed/total*100)}% SUCCESS RATE)`);
  console.log("=======================================================\n");
}

runLiveTest();
