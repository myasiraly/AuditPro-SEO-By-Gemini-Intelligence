
import React, { useState, useCallback, useEffect } from 'react';
import { GeminiService } from './services/gemini';
import { AuditResult } from './types';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { auth, onAuthStateChanged, signOut } from './firebase';

interface User {
  email: string | null;
  name: string | null;
  avatar: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Intelligence Agent',
          avatar: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setResult(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleAudit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const gemini = new GeminiService();
      const auditResult = await gemini.performSEOAudit(targetUrl, competitorUrl);
      setResult(auditResult);
    } catch (err: any) {
      console.error(err);
      setError("Intelligence scan failed. The URL format might be incorrect.");
    } finally {
      setIsLoading(false);
    }
  }, [targetUrl, competitorUrl]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col selection:bg-violet-500/30">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      </div>

      <header className="border-b border-white/10 bg-[#02040a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter font-display uppercase">AuditPro <span className="text-violet-400">SEO</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-black uppercase overflow-hidden border-2 border-white/20">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.[0]}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-[11px] font-bold text-white leading-none">{user.name}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest-label mt-1">Authorized</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/[0.05] border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 rounded-2xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {!result && !isLoading && (
          <div className="max-w-2xl mx-auto mt-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest-label mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Local Heuristic Engine Online
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-8 font-display tracking-tighter text-white leading-[1.1]">
              Uncover Deep <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Search Intelligence.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium max-w-xl mx-auto">
              Execute advanced reconnaissance. No API costs. Fast, local, and private diagnostic analysis.
            </p>
            
            <form onSubmit={handleAudit} className="space-y-5 max-w-lg mx-auto">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-0 group-focus-within:opacity-25 transition duration-500"></div>
                <input
                  type="url"
                  placeholder="Target URL (e.g., https://domain.com)"
                  className="relative w-full bg-[#0d1117] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-violet-500/50 transition-all text-base font-semibold placeholder:text-slate-700 shadow-2xl"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />
              </div>
              <div className="group relative">
                <input
                  type="url"
                  placeholder="Competitor URL (Optional)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500/50 transition-all font-semibold placeholder:text-slate-500 text-white"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary text-white font-black py-5 rounded-2xl transition-all font-display text-xs uppercase tracking-widest-label"
              >
                {isLoading ? 'Synthesizing Diagnostics...' : 'Start Local Intelligence Scan'}
              </button>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-10 animate-in fade-in duration-500">
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 border-4 border-violet-500/5 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 flex items-center justify-center">
                 <div className="w-16 h-16 bg-violet-500/5 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-3 h-3 bg-violet-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.8)]"></div>
                 </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-black font-display text-white uppercase tracking-widest-label mb-3">Synthesizing Local Intel</p>
              <div className="flex gap-1.5 justify-center">
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div>
              </div>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest-label mt-6 opacity-60">Running diagnostic heuristics & pattern matching</p>
            </div>
          </div>
        )}

        {result && (
          <Dashboard 
            result={result} 
            onReset={() => {
              setResult(null);
              setTargetUrl('');
              setCompetitorUrl('');
            }}
          />
        )}
      </main>

      <footer className="py-16 border-t border-white/5 bg-black/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest-label opacity-40">
            &copy; {new Date().getFullYear()} AuditPro SEO. Zero-Cost Local Intelligence Engine.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
