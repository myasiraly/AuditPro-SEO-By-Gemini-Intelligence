
import React, { useState, useRef, useEffect } from 'react';
import { AuditResult } from '../types';
import { marked } from 'marked';
import { GoogleGenAI } from "@google/genai";

interface VirtualAssistantProps {
  auditResult: AuditResult;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ auditResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm your **Heuristic SEO Advisor**. I've processed the diagnostics for **${new URL(auditResult.target.url).hostname}**. How can I help you improve your search performance?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // COMMENT: Initializing GoogleGenAI with named parameter as required.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // COMMENT: Utilizing Gemini 3 Flash for fast, context-aware SEO advisory responses.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Current SEO Audit Context: ${JSON.stringify(auditResult)}` },
              { text: `User Question: ${userMessage}` }
            ]
          }
        ],
        config: {
          systemInstruction: "You are a world-class senior SEO consultant. Answer user queries by analyzing the provided audit data for the target domain and its competitor. Provide specific, data-driven advice. Use Markdown for formatting.",
          temperature: 0.7,
        }
      });

      const assistantResponse = response.text?.trim() || "I'm currently recalibrating my intelligence stream. Please try rephrasing.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (err) {
      console.error("Assistant sync failed:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Deep intelligence sync failed. Please check your network connection or API quota." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-display">
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)] glass-panel border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest-label">AuditPro Expert</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Heuristic Engine Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/10' 
                  : 'bg-white/[0.03] border border-white/5 text-slate-300'
                }`}>
                   <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl flex gap-1.5">
                   <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-white/[0.01]">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your SEO diagnostics..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-700 text-white pr-14"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg shadow-violet-600/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all duration-500 active:scale-90 relative group ${
          isOpen ? 'bg-rose-500 rotate-90 scale-75 opacity-0 pointer-events-none' : 'bg-gradient-to-br from-violet-500 to-indigo-600 hover:scale-110 hover:shadow-violet-500/40'
        }`}
      >
        <div className="absolute inset-0 bg-violet-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
};

export default VirtualAssistant;
