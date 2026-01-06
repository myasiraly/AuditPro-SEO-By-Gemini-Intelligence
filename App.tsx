
import React, { useState, useCallback } from 'react';
import { GeminiService } from './services/gemini';
import { AuditResult } from './types';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AuditPro <span className="text-blue-500">SEO</span></h1>
          </div>
          <div className="text-sm text-slate-400">Powered by Gemini Intelligence (Yasir Ali)</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!result && !isLoading && (
          <div className="max-w-2xl mx-auto mt-20 text-center">
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Deep SEO Intelligence at Your Fingertips
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Audit your site's health, analyze technical performance, and crush your competition with AI-powered SWOT insights.
            </p>
            
            <form onSubmit={handleAudit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <input
                  type="url"
                  placeholder="Enter Target URL (e.g., https://example.com)"
                  className="relative w-full bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />
              </div>
              <input
                type="url"
                placeholder="Competitor URL (Optional)"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                {isLoading ? 'Analyzing Site Integrity...' : 'Launch SEO Audit'}
              </button>
            </form>
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-slate-200 animate-pulse">Scanning URL Structure...</p>
              <p className="text-sm text-slate-500 mt-2">Checking technical headers, meta tags, and content depth</p>
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
      <footer className="py-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} AuditPro SEO.
        </div>
      </footer>
    </div>
  );
};

export default App;
