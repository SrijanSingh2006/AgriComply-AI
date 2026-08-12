import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './ComplianceDashboard.css';

export default function ComplianceDashboard() {
  // ==========================================
  // 🔍 FEATURE 1: Live Entity Resolution State 
  // ==========================================
  const [bundleFiles, setBundleFiles] = useState([]);
  const [consistencyData, setConsistencyData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // ==========================================
  // 🪄 FEATURE 2: Optimization State 
  // ==========================================
  const [selectedImage, setSelectedImage] = useState(null);
  const [optimizedData, setOptimizedData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Handle Multi-File Selection
  const handleBundleSelection = (e) => {
    // Array.from ensures we capture all selected files properly
    setBundleFiles(Array.from(e.target.files));
  };

  // Run Live OCR Extraction & Consistency Check
  const processBundle = async () => {
    if (bundleFiles.length < 2) {
        alert("Please upload at least 2 documents to compare consistency!");
        return;
    }

    setIsExtracting(true);
    setConsistencyData(null);

    const formData = new FormData();
    bundleFiles.forEach(file => {
        formData.append('documents', file);
    });

    try {
        const res = await fetch('http://127.0.0.1:5001/api/bundler/process-bundle', {
            method: 'POST', body: formData
        });
        setConsistencyData(await res.json());
    } catch (err) { 
        console.error("Error processing bundle", err); 
    } finally {
        setIsExtracting(false);
    }
  };

  // Handle Image Upload & OpenCV Restoration
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedImage(URL.createObjectURL(file));
    setIsOptimizing(true);
    setOptimizedData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('http://127.0.0.1:5001/api/bundler/optimize', {
            method: 'POST', body: formData
        });
        setOptimizedData(await res.json());
    } catch (err) { console.error("Optimization failed", err); }
    finally { setIsOptimizing(false); }
  };

  // Format data for Radar Chart
  const radarData = consistencyData?.matrix.map(m => ({
    subject: m.comparison,
    A: m.match_score,
    fullMark: 100,
  })) || [];

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '12px', marginTop: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#00ff00' }}>
           📦 Intelligent Pre-Flight Compliance Bundler
        </h2>
        <p className="text-gray-400 mt-1 text-sm">
            Auto-verifies identity consistency across all KYC documents (PDFs/Images) and generatively cleans images to meet strict government portal limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================== */}
        {/* LEFT: Live Entity Resolution (Gemini + Math) */}
        {/* ========================================== */}
        <div style={{ padding: '20px', background: '#2d2d2d', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 className="text-lg font-bold mb-2 text-white">🔍 Live Identity Verification</h3>
            <p className="text-sm text-gray-400 mb-6">Upload raw PDFs/Images. AI extracts the entities and runs a Levenshtein fuzzy-match.</p>
            
            {/* Live Document Upload Zone */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-600 rounded bg-black/50">
                {/* REMOVED 'accept' attribute to fix Windows/Mac OS multi-select blocking */}
                <input 
                    type="file" 
                    multiple={true} 
                    onChange={handleBundleSelection}
                    className="block w-full text-sm text-green-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-green-900/30 file:text-green-400 hover:file:bg-green-900/50 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">Selected: {bundleFiles.length} files</p>
                
                <button 
                    onClick={processBundle}
                    disabled={isExtracting || bundleFiles.length === 0}
                    className={`mt-4 w-full py-2 font-bold rounded ${isExtracting ? 'bg-gray-600 text-gray-300' : 'bg-blue-600 hover:bg-blue-500 text-white'} transition-colors`}
                >
                    {isExtracting ? '🤖 Reading Documents...' : 'Extract & Analyze Bundle'}
                </button>
            </div>

            {/* Display Live Extracted Data */}
            {consistencyData && (
                <div className="mb-6 bg-black p-3 rounded border border-gray-800">
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Live OCR Extraction Results:</h4>
                    {Object.entries(consistencyData.extracted_entities).map(([docType, name], idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-800 last:border-0">
                            <span className="text-blue-400">{docType}</span>
                            <span className="text-white font-mono">{name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Radar Chart & Results */}
            {consistencyData && (
                <div className="flex flex-col items-center border-t border-gray-700 pt-6">
                    <h4 className={`text-xl font-bold mb-2 ${consistencyData.is_portal_ready ? 'text-green-500' : 'text-orange-500'}`}>
                        Bundle Health: {consistencyData.overall_consistency}%
                    </h4>
                    
                    <div className="w-full h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#555" />
                                <PolarAngleAxis dataKey="subject" tick={{fill: '#aaa', fontSize: 11}} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar name="Match Score" dataKey="A" stroke={consistencyData.is_portal_ready ? "#00ff00" : "#ff9900"} fill={consistencyData.is_portal_ready ? "#00ff00" : "#ff9900"} fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="w-full space-y-2 mt-4">
                        {consistencyData.matrix.map((m, i) => (
                            <div key={i} className="flex justify-between text-sm p-2 bg-black rounded border border-gray-800">
                                <span>{m.comparison}</span>
                                <span className={m.status === 'Safe' ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>
                                    {m.match_score}% ({m.status})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* ========================================== */}
        {/* RIGHT: Document Restoration (Portal Optimizer) */}
        {/* ========================================== */}
        <div style={{ padding: '20px', background: '#2d2d2d', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 className="text-lg font-bold mb-2 text-white">🪄 Generative Portal Optimizer</h3>
            <p className="text-sm text-gray-400 mb-6">Adaptive thresholding to auto-clean shadows and enforce 2MB portal limits (Images Only).</p>

            <input 
                type="file" accept="image/*"
                onChange={handleImageUpload}
                className="mb-6 block w-full text-sm text-green-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-green-900/30 file:text-green-400 hover:file:bg-green-900/50 cursor-pointer"
            />

            {isOptimizing && <div className="text-center text-green-400 animate-pulse my-10">Applying Morphological Restoration...</div>}

            {optimizedData && !isOptimizing && (
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <p className="text-xs text-gray-500 mb-1">Original Upload ({optimizedData.original_size_kb} KB)</p>
                            <img src={selectedImage} alt="Original" className="w-full h-40 object-cover rounded border border-gray-700 opacity-60" />
                        </div>
                        <div className="w-1/2">
                            <p className="text-xs text-green-400 mb-1 font-bold">Optimized Output ({optimizedData.optimized_size_kb} KB)</p>
                            <img src={optimizedData.optimized_image_b64} alt="Optimized" className="w-full h-40 object-cover rounded border-2 border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.2)]" />
                        </div>
                    </div>

                    <div className="bg-black p-4 rounded border border-green-900/50 mt-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Compression Ratio:</span>
                            <span className="text-green-400 font-bold">⬇ {optimizedData.compression_ratio}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Portal Readiness:</span>
                            <span className="text-green-400 font-bold flex items-center gap-1">✅ {optimizedData.status}</span>
                        </div>
                    </div>

                    <button className="w-full py-3 mt-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors border-none cursor-pointer">
                        Download Final Compliance ZIP Bundle
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}