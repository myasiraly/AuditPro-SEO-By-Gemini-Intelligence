
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

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
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
      setError("Audit failed. Please ensure your URL is valid and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [targetUrl, competitorUrl]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-body">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight font-display">AuditPro <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">SEO</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black uppercase overflow-hidden">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.[0]}
              </div>
              <span className="text-xs font-bold text-slate-300">{user.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 rounded-xl transition-all"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {!result && !isLoading && (
          <div className="max-w-3xl mx-auto mt-16 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest-label mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Verified Professional Access
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 font-display tracking-tight text-white">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 capitalize">{user.name}.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
              Audit your site's health, analyze technical performance, write the SEO-optimized blogs for FREE, and crush your competition with AI-powered SWOT insights.
            </p>
            
            <form onSubmit={handleAudit} className="space-y-4 max-w-xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <input
                  type="url"
                  placeholder="Enter Target URL (e.g., https://example.com)"
                  className="relative w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg font-medium placeholder:text-slate-600"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />
              </div>
              <div className="relative group">
                <input
                  type="url"
                  placeholder="Competitor URL (Optional)"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium placeholder:text-slate-700"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/10 active:scale-[0.98] font-display text-lg tracking-wide"
              >
                {isLoading ? 'Synthesizing Audit Data...' : 'Launch Intelligence Scan'}
              </button>
            </form>
            {error && <p className="mt-6 text-red-500 font-medium text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-indigo-500/10 rounded-full"></div>
              <div className="absolute inset-4 border-4 border-b-indigo-500 border-r-transparent border-t-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-8 h-8 text-blue-500/50 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-white tracking-tight animate-pulse">Analyzing Site Ecosystem...</p>
              <p className="text-slate-500 mt-3 font-medium">Checking technical headers, semantic structure, and market positioning</p>
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

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-900/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} AuditPro SEO Intelligence. Powered by Gemini Pro.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest-label text-slate-700">Confidential Audit Report</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
