
import React, { useState, useRef, useEffect } from 'react';
import { AuditResult } from '../types';
import { marked } from 'marked';

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

    const userMessage = input.toLowerCase();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate thinking delay
    setTimeout(() => {
      let response = "I'm analyzing that query. Can you be more specific about whether you want to improve **Performance**, **Content**, or **Backlinks**?";

      if (userMessage.includes('speed') || userMessage.includes('performance') || userMessage.includes('lcp')) {
        response = `Based on my diagnostics, your performance score is **${auditResult.target.lighthouse?.performance}/100**. To improve, you should focus on **LCP (${auditResult.target.coreWebVitals?.lcp})**. Recommendations: \n1. Compress large assets.\n2. Enable lazy loading.\n3. Utilize browser caching.`;
      } else if (userMessage.includes('keyword') || userMessage.includes('rank')) {
        response = `You're currently tracking **${auditResult.target.organicIntel?.topKeywords?.length}** primary keywords. Your top opportunity is **"${auditResult.target.organicIntel?.topKeywords?.[0]?.keyword}"**. I recommend expanding your content cluster around this topic to build semantic authority.`;
      } else if (userMessage.includes('competitor') || userMessage.includes('rival')) {
        response = `Your main rival, **${new URL(auditResult.competitor?.url || '').hostname}**, is performing at a health index of **${auditResult.competitor?.healthScore}%**. Focus on their keyword gaps in the "Strategic Intel" tab to outrank them.`;
      } else if (userMessage.includes('backlink') || userMessage.includes('authority')) {
        response = `Your Domain Authority is currently **${auditResult.target.authority?.domainAuthority}**. You have **${auditResult.target.authority?.referringDomains}** referring domains. Look at the Acquisition Targets in the Authority tab to find high-value link opportunities.`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 600);
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
