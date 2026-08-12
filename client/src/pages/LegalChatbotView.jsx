import React, { useState } from 'react';

export default function LegalChatbotView() {
  const ML_URL = import.meta.env.VITE_ML_URL || 'http://127.0.0.1:5001';

  const [pdfPath, setPdfPath] = useState('');
  const [ingestStatus, setIngestStatus] = useState('');
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your AI Legal Assistant. Ingest a scheme document above, and ask me any questions about it!' }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const handleIngest = async (e) => {
    e.preventDefault();
    setIngestStatus('Ingesting PDF into Vector Database...');
    try {
      const response = await fetch(`${ML_URL}/admin/ingest-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ filePath: pdfPath })
      });
      const data = await response.json();
      setIngestStatus(data.message || data.error);
    } catch (err) {
      setIngestStatus('Failed to connect to AI server.');
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newChat = [...chatHistory, { role: 'user', text: question }];
    setChatHistory(newChat);
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch(`${ML_URL}/legal/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setChatHistory([...newChat, { role: 'ai', text: data.answer || data.error }]);
    } catch (err) {
      setChatHistory([...newChat, { role: 'ai', text: 'Connection error.' }]);
    }
    setIsAsking(false);
  };

  return (
    <div className="space-y-6 h-[85vh] flex flex-col">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
          Agentic AI Legal Assistant
        </h1>
        <p className="text-gray-600 mt-2">Vector-powered Retrieval-Augmented Generation (RAG) for official documents.</p>
      </div>

      {/* TOP: Admin Ingestion Panel */}
      <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm flex items-end space-x-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Admin: Ingest Official PDF Rulebook</label>
          <input 
            type="text" 
            placeholder="e.g., C:\Users\Documents\PM-KISAN_Guidelines.pdf"
            className="mt-1 w-full rounded-lg border-gray-200 bg-white focus:ring-emerald-500 p-2 text-sm shadow-inner"
            value={pdfPath} onChange={e => setPdfPath(e.target.value)}
          />
        </div>
        <button onClick={handleIngest} className="bg-emerald-100 text-emerald-700 font-bold py-2 px-4 rounded-lg hover:bg-emerald-200 transition">
          Index Document
        </button>
      </div>
      {ingestStatus && <p className="text-sm font-medium text-emerald-600 px-2">{ingestStatus}</p>}

      {/* BOTTOM: Chat Interface */}
      <div className="flex-1 bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl border border-white/50 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isAsking && (
             <div className="flex justify-start">
               <div className="bg-white text-gray-500 rounded-2xl rounded-tl-none border border-gray-100 p-4 shadow-sm animate-pulse">
                 Thinking...
               </div>
             </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleAsk} className="p-4 bg-gray-50 border-t border-gray-100 flex space-x-2">
          <input 
            type="text" 
            placeholder="Ask a question about the uploaded document..."
            className="flex-1 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 p-3 shadow-sm"
            value={question} onChange={e => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={isAsking} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition">
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}