import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Database, User, ShieldAlert, FileText, ChevronRight } from 'lucide-react';

export default function LegalChatbotView() {
  const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001';

  const [file, setFile] = useState(null);
  const [ingestStatus, setIngestStatus] = useState('');
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your AI Legal Assistant. Ingest a scheme document above, and ask me any questions about it!' }
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAsking]);

  const handleIngest = async (e) => {
    e.preventDefault();
    setIngestStatus('Ingesting PDF into Vector Database...');
    try {
      if (!file) {
        setIngestStatus('Please select a file first.');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${ML_URL}/admin/ingest-pdf`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' },
        body: formData
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

  // Helper to safely render markdown-like text (very basic for this demo)
  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <motion.div 
      className="space-y-6 h-[85vh] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-md text-white">
          <Bot size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Agentic AI Legal Assistant
          </h1>
          <p className="text-slate-500 font-medium mt-1">Vector-powered RAG for analyzing official agricultural documents.</p>
        </div>
      </div>

      {/* TOP: Admin Ingestion Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end gap-4 transition-all hover:shadow-md hover:border-emerald-200">
        <div className="flex-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Database size={14} className="text-emerald-600" /> Admin: Ingest Official PDF Rulebook
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={16} className="text-slate-400" />
            </div>
            <input 
              type="file" 
              accept=".pdf"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 py-1.5 text-sm shadow-inner transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
              onChange={e => setFile(e.target.files[0])}
            />
          </div>
        </div>
        <button onClick={handleIngest} className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-2.5 px-6 rounded-xl hover:bg-emerald-100 hover:shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap">
          Index Document <ChevronRight size={18} />
        </button>
      </div>
      <AnimatePresence>
        {ingestStatus && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-semibold text-emerald-600 px-2 flex items-center gap-2">
            <ShieldAlert size={16} /> {ingestStatus}
          </motion.p>
        )}
      </AnimatePresence>

      {/* BOTTOM: Chat Interface */}
      <div className="flex-1 bg-white shadow-lg rounded-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <AnimatePresence>
            {chatHistory.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-1 shadow-sm border border-emerald-200">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-700 rounded-tl-sm border border-slate-200 shadow-md'
                }`}>
                  {formatText(msg.text)}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-1 shadow-sm">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            ))}
            {isAsking && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-1 shadow-sm border border-emerald-200">
                    <Bot size={16} />
                  </div>
                 <div className="bg-white text-slate-400 rounded-2xl rounded-tl-sm border border-slate-200 p-4 shadow-sm flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleAsk} className="p-4 bg-white border-t border-slate-200 flex space-x-3 items-end">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Type your legal or compliance question here..."
              className="w-full rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-4 pr-12 shadow-sm text-sm transition-shadow"
              value={question} onChange={e => setQuestion(e.target.value)}
              disabled={isAsking}
            />
          </div>
          <button 
            type="submit" 
            disabled={isAsking || !question.trim()} 
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold h-[54px] px-6 rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}