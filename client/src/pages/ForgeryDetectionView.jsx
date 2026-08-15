import React, { useState } from 'react';

export default function ForgeryDetectionView() {
  const [filePath, setFilePath] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ML_URL = 'https://server-eta-rosy-45.vercel.app/api/ml';

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${ML_URL}/security/forgery-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ filePath })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
          Security Vault & Fraud Detection
        </h1>
        <p className="text-gray-600 mt-2">Enterprise-grade Error Level Analysis (ELA) to detect manipulated documents.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-white/50 max-w-2xl">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Document Path (Local)</label>
            <input 
              type="text" 
              placeholder="e.g., C:\Users\Downloads\bank_statement.jpg"
              className="mt-1 w-full rounded-xl border-gray-200 bg-white/50 focus:ring-emerald-500 focus:border-emerald-500 p-3 shadow-sm transition-all"
              value={filePath} 
              onChange={e => setFilePath(e.target.value)} 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition hover:-translate-y-1 flex justify-center items-center"
          >
            {loading ? (
              <span className="animate-pulse">🔍 Scanning Pixels...</span>
            ) : "Run Forgery Scan"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className={`mt-6 p-6 rounded-2xl border ${result.is_tampered ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${result.is_tampered ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <span className="text-2xl">{result.is_tampered ? '🚨' : '✅'}</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${result.is_tampered ? 'text-red-700' : 'text-emerald-700'}`}>
                  {result.status}
                </h3>
                <p className="text-sm text-gray-600">
                  Forgery Confidence Score: <span className="font-bold">{result.forgery_confidence_score}%</span>
                </p>
              </div>
            </div>
            {result.is_tampered && (
              <p className="mt-4 text-sm text-red-600 bg-red-100/50 p-3 rounded-lg">
                <strong>Warning:</strong> The pixel compression rate in this document is highly inconsistent. It is highly likely that sections of this document have been digitally altered, spliced, or photoshopped.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}