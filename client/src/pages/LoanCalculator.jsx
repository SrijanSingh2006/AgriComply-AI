import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; 
import axios from 'axios';
import { useVault } from '../contexts/VaultContext';

const LoanCalculator = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const schemeData = state?.scheme || null;
    
    // 1. Get docs from Context
    const { documents: contextDocs } = useVault() || { documents: [] };

    const [formData, setFormData] = useState({
        amount: '',
        tenure: '5',
        bank: schemeData?.bank || '' 
    });
    
    const [foundDocs, setFoundDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // 2. Load Documents (Context + Fallback API)
    useEffect(() => {
        const loadDocs = async () => {
            if (contextDocs && contextDocs.length > 0) {
                console.log("Loaded docs from Context:", contextDocs.length);
                setFoundDocs(mapDocs(contextDocs));
                return;
            }

            try {
                console.log("Context empty, fetching from API...");
                const res = await api.get('/vault');
                setFoundDocs(mapDocs(res.data));
            } catch (err) {
                console.error("API Fetch failed:", err);
            }
        };
        loadDocs();
    }, [contextDocs]);

    // 3. Helper to extract tags AND actual OCR Data (CRITICAL FIX)
    const mapDocs = (docs) => {
        return (docs || []).map(d => {
            // Check where your backend stores the OCR JSON. Often it's in 'extracted_data' or 'content'
            const rawData = d.extracted_data || d.parsed_text || d.content || "Data not available";
            
            return {
                tag: d.tag || d.type || d.classification?.type || "Unknown",
                filename: d.filename,
                // Stringify the JSON so it travels safely over HTTP to Python
                extracted_data: typeof rawData === 'object' ? JSON.stringify(rawData) : rawData
            };
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheck = async () => {
        if (!formData.amount) return alert("Please enter an amount");
        
        setLoading(true);
        setResult(null);
        
        const ML_URL = (import.meta.env.VITE_ML_URL || 'http://localhost:5001') + '/growth/advanced-check';

        try {
            console.log("Sending docs to AI:", foundDocs); 
            
            const res = await axios.post(ML_URL, {
                ...formData,
                user_docs: foundDocs 
            });
            setResult(res.data);
        } catch (error) {
            console.error("AI Error:", error);
            if (error.code === "ERR_NETWORK") {
                alert("Please ensure 'python app.py' is running on Port 5001.");
            } else {
                alert("AI Analysis Failed. See console.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-5xl mx-auto pb-20">
            <button 
                onClick={() => navigate('/growth')} 
                className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium"
            >
                ← Back to Schemes
            </button>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Universal Eligibility Check</h1>
                    <p className="text-gray-600">
                        {schemeData ? `Checking for: ${schemeData.name}` : 'Check eligibility across all Banks & NBFCs'}
                    </p>
                </div>
                
                <div className={`px-4 py-2 rounded-lg border ${foundDocs.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <span className="font-bold text-lg">{foundDocs.length}</span> Documents Found
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-200">
                        <div className="mb-4">
                            <label className="block font-bold mb-2 text-gray-700">Loan Amount (₹)</label>
                            <input 
                                type="number" 
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                placeholder="e.g. 500000"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold mb-2 text-gray-700">Tenure: {formData.tenure} Years</label>
                            <input 
                                type="range" 
                                name="tenure"
                                min="1" max="20"
                                value={formData.tenure}
                                onChange={handleChange}
                                className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block font-bold mb-2 text-gray-700">Preferred Lender</label>
                            <input 
                                list="banks" 
                                name="bank"
                                value={formData.bank}
                                onChange={handleChange}
                                placeholder="Type 'Any' or specific bank..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <datalist id="banks">
                                <option value="Any Bank or NBFC" />
                                <option value="State Bank of India (SBI)" />
                                <option value="HDFC Bank" />
                                <option value="Punjab National Bank" />
                            </datalist>
                        </div>

                        <button 
                            onClick={handleCheck}
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 transition-all shadow-lg"
                        >
                            {loading ? "AI is Analyzing..." : "Check Eligibility Now"}
                        </button>
                    </div>

                    {foundDocs.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                            <p className="font-bold text-gray-500 mb-2 uppercase text-xs tracking-wider">Vault Inventory (Sending to AI)</p>
                            <div className="flex flex-wrap gap-2">
                                {foundDocs.map((d, i) => (
                                    <span key={i} className="bg-white border border-gray-300 px-2 py-1 rounded text-gray-700 font-mono">
                                        {d.tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full min-h-[300px] flex flex-col">
                        {!result && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4 opacity-60">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">🔍</div>
                                <p>Enter details to start<br/>AI Analysis</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                                <p className="font-bold text-blue-600">Checking {foundDocs.length} Documents...</p>
                            </div>
                        )}

                        {result && (
                            <div className="animate-fade-in">
                                <div className={`p-4 rounded-lg mb-4 text-center ${result.eligible ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                    <h2 className="text-xl font-bold">
                                        {result.eligible ? 'High Chance' : 'Not Eligible'}
                                    </h2>
                                    <p className="text-xs font-bold mt-1 opacity-80">{result.confidence_score}% Confidence</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm mb-1">Reasoning:</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{result.reasoning}</p>
                                    </div>
                                    {result.suggestion && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <h3 className="font-bold text-blue-800 text-sm mb-1">💡 Tip:</h3>
                                            <p className="text-blue-600 text-sm">{result.suggestion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanCalculator;