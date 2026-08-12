import React, { useState, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

export default function AdvancedSecurityPanel() {
  // --- STATE: Keystroke Dynamics ---
  const [inputValue, setInputValue] = useState('');
  const [chartData, setChartData] = useState([]);
  const [securityStatus, setSecurityStatus] = useState('🟢 SYSTEM SECURE: Monitoring Human Cadence');
  const [isBot, setIsBot] = useState(false);
  
  const lastKeyTime = useRef(Date.now());
  const flightTimes = useRef([]);

  // --- STATE: Crypto Vault ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [displayHash, setDisplayHash] = useState('AWAITING_DOCUMENT_UPLOAD...');
  const [finalHash, setFinalHash] = useState(null);
  const [isHashing, setIsHashing] = useState(false);

  // ==========================================
  // ⌨️ BEHAVIORAL BIOMETRICS LOGIC
  // ==========================================
  const handleKeyDown = async (e) => {
    const now = Date.now();
    const flightTime = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // Ignore the very first key press calculation
    if (inputValue.length > 0) {
      flightTimes.current.push(flightTime);
      
      // Update Heartbeat Chart
      setChartData(prev => {
        const newData = [...prev, { time: prev.length, ms: flightTime }];
        return newData.slice(-20); // Keep last 20 keystrokes for the visual
      });
    }

    // Every 5 characters, send to backend to check if it's a Bot
    if (inputValue.length % 5 === 0 && flightTimes.current.length > 0) {
        try {
            const res = await fetch('http://localhost:5001/api/security/keystrokes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flight_times: flightTimes.current })
            });
            const data = await res.json();

            if (data.status === 'bot') {
                setIsBot(true);
                setSecurityStatus('🚨 SYNTHETIC INPUT DETECTED: BOT LOCKDOWN INITIATED');
                setInputValue('LOCKED_OUT_DUE_TO_SECURITY_VIOLATION');
            }
        } catch (err) { console.error(err); }
    }
  };

  const handlePaste = (e) => {
      e.preventDefault(); // Stop normal pasting
      setIsBot(true);
      setSecurityStatus('🚨 SYNTHETIC INPUT (CTRL+V) DETECTED: APPLICATION LOCKED');
  };

  // ==========================================
  // 🔐 CRYPTOGRAPHIC VAULT LOGIC
  // ==========================================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setIsHashing(true);
    setFinalHash(null);

    // 1. Matrix Animation Effect (Rapid random hex generation)
    let iterations = 0;
    const interval = setInterval(() => {
        setDisplayHash([...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
        iterations++;
        if (iterations > 20) clearInterval(interval);
    }, 50);

    // 2. Actually send to backend for real SHA-256
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('http://localhost:5001/api/security/hash-document', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        setTimeout(() => {
            clearInterval(interval);
            setDisplayHash(data.hash);
            setFinalHash(data.hash);
            setIsHashing(false);
        }, 1200); // Let animation run for 1.2s for dramatic effect
    } catch (err) {
        clearInterval(interval);
        setDisplayHash("ERROR_GENERATING_HASH");
        setIsHashing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#0a0a0a] text-green-400 font-mono rounded-xl border border-gray-800 shadow-[0_0_20px_rgba(0,255,0,0.1)]">
      
      {/* ------------------------------------------- */}
      {/* LEFT: LIVE BOT DEFENSE (KEYSTROKES)         */}
      {/* ------------------------------------------- */}
      <div className={`p-4 rounded border ${isBot ? 'border-red-500 bg-red-900/20' : 'border-green-500/30'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className={isBot ? "text-red-500" : "text-green-500 animate-pulse"}>●</span> Live Bot Defense
        </h3>
        
        <p className={`text-sm mb-4 font-bold ${isBot ? 'text-red-500' : 'text-green-500'}`}>
            {securityStatus}
        </p>

        <input 
            type="text" 
            disabled={isBot}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type your Aadhaar Number slowly..."
            className={`w-full p-3 mb-4 bg-black border ${isBot ? 'border-red-500 text-red-500' : 'border-green-800 text-green-400'} rounded focus:outline-none focus:border-green-400`}
        />

        {/* The Live Keystroke EKG Chart */}
        <div className="h-32 w-full bg-black/50 border border-green-900/50 rounded overflow-hidden relative">
            {isBot && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center font-bold text-red-500 z-10">TERMINAL LOCKED</div>}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis domain={[0, 1000]} hide={true} />
                    <Line 
                        type="monotone" 
                        dataKey="ms" 
                        stroke={isBot ? "#ef4444" : "#22c55e"} 
                        strokeWidth={2} 
                        dot={true} 
                        isAnimationActive={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <p className="text-xs text-green-600 mt-2">OC-SVM Behavioral Biometrics Active. Monitoring flight times.</p>
      </div>

      {/* ------------------------------------------- */}
      {/* RIGHT: CRYPTO VAULT (SHA-256)               */}
      {/* ------------------------------------------- */}
      <div className="p-4 rounded border border-green-500/30">
        <h3 className="text-xl font-bold mb-4">🔐 Zero-Trust Crypto Vault</h3>
        <p className="text-xs text-green-600 mb-4">SHA-256 Cryptographic Fingerprinting (Avalanche Effect)</p>

        <input 
            type="file" 
            onChange={handleFileUpload}
            className="mb-4 block w-full text-sm text-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-900/30 file:text-green-400 hover:file:bg-green-900/50"
        />

        {/* Matrix Hash Display */}
        <div className="bg-black p-4 rounded border border-green-800 mb-4 overflow-hidden relative">
            <p className="text-xs mb-1 text-gray-500">Document Hash Digest:</p>
            <p className={`break-all ${isHashing ? 'text-green-300 opacity-80' : 'text-green-500 font-bold'}`}>
                {displayHash}
            </p>
        </div>

        {/* Final QR Code Generation */}
        {finalHash && (
            <div className="flex items-start gap-4 p-4 bg-green-900/10 rounded border border-green-500/30 animate-pulse">
                <div className="bg-white p-2 rounded">
                    <QRCodeSVG value={finalHash} size={80} />
                </div>
                <div>
                    <h4 className="font-bold text-green-400">DOCUMENT SEALED</h4>
                    <p className="text-xs text-green-600 mt-1">Immutable record generated. Tamper-proofing active. Bank Auditor verification ready.</p>
                </div>
            </div>
        )}
      </div>

    </div>
  );
}