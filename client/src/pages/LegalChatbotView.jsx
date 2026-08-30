import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Database, User, ShieldAlert, FileText, ChevronRight, Sparkles, Copy, Check, HelpCircle } from 'lucide-react';
import MarkdownRenderer from '../components/common/MarkdownRenderer';

export default function LegalChatbotView() {
  const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001';

  const [file, setFile] = useState(null);
  const [ingestStatus, setIngestStatus] = useState('');
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'ai',
      text: '### Welcome to your Agentic Legal AI Assistant 🌾\nI can answer questions regarding **Indian agricultural laws**, government subsidies (**PM-KISAN**, **PMFBY**, **KCC**), land record verifications, and compliance filings.\n\n*Ask me a question below or pick a suggested topic to get started!*'
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What is the PM-KISAN scheme and who is eligible?",
    "What documents are needed for Kisan Credit Card (KCC)?",
    "What are the mandatory compliance filings for an FPO?",
    "How does PMFBY crop insurance claim verification work?"
  ];

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

  const handleAskWithQuestion = async (queryText) => {
    if (!queryText.trim() || isAsking) return;

    const newChat = [...chatHistory, { role: 'user', text: queryText }];
    setChatHistory(newChat);
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch(`${ML_URL}/legal/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ question: queryText })
      });
      const data = await response.json();
      setChatHistory([...newChat, { role: 'ai', text: data.answer || data.error }]);
    } catch (err) {
      setChatHistory([...newChat, { role: 'ai', text: 'Failed to connect to Legal AI server. Please make sure the ML service is running.' }]);
    }
    setIsAsking(false);
  };

  const handleAsk = (e) => {
    e.preventDefault();
    handleAskWithQuestion(question);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <motion.div 
      className="space-y-6 h-[85vh] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3.5 rounded-2xl shadow-md text-white">
          <Bot size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Agentic AI Legal Assistant
          </h1>
          <p className="text-slate-500 font-medium mt-1">Vector-powered RAG for analyzing official agricultural rules and schemes.</p>
        </div>
      </div>

      {/* TOP: Admin Ingestion Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end gap-4 transition-all hover:shadow-md hover:border-emerald-200">
        <div className="flex-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Database size={14} className="text-emerald-600" /> Admin: Ingest Official PDF Rulebook (Vector RAG)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={16} className="text-slate-400" />
            </div>
            <input 
              type="file" 
              accept=".pdf"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 py-2 text-sm shadow-inner transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
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
        
        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <AnimatePresence>
            {chatHistory.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <Bot size={18} />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-5 shadow-sm leading-relaxed relative group ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm text-sm font-medium' 
                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200/80 shadow-md'
                }`}>
                  {msg.role === 'ai' ? (
                    <div>
                      <MarkdownRenderer content={msg.text} />
                      
                      {/* Copy Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                          AgriComply Legal Intelligence
                        </span>
                        <button
                          onClick={() => handleCopy(msg.text, idx)}
                          className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 font-semibold px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {copiedIdx === idx ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-800 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <User size={18} />
                  </div>
                )}
              </motion.div>
            ))}

            {isAsking && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3.5 justify-start">
                 <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                    <Bot size={18} />
                  </div>
                 <div className="bg-white text-slate-500 rounded-3xl rounded-tl-sm border border-slate-200 p-5 shadow-md flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                   </div>
                   <span className="text-xs font-bold text-slate-500">Legal AI is reviewing regulations...</span>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {chatHistory.length <= 3 && !isAsking && (
          <div className="px-6 py-2 bg-slate-50/80 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-500" /> Suggestions:
            </span>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAskWithQuestion(q)}
                className="text-xs bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300 shadow-xs shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleAsk} className="p-4 bg-white border-t border-slate-200 flex space-x-3 items-center">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Ask any question regarding agricultural laws, PM-KISAN, KCC, or compliance..."
              className="w-full rounded-2xl border border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 p-4 pr-12 shadow-sm text-sm transition-all font-medium text-slate-800 bg-slate-50/60 focus:bg-white"
              value={question} 
              onChange={e => setQuestion(e.target.value)}
              disabled={isAsking}
            />
          </div>
          <button 
            type="submit" 
            disabled={isAsking || !question.trim()} 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold h-[52px] px-7 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}