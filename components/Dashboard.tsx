
import React, { useState } from 'react';
import { AuditResult, SEOAuditData, ContentPlan } from '../types';
import MetricCard from './MetricCard';
import AuditSection from './AuditSection';
import SWOTAnalysisView from './SWOTAnalysis';
import BlogContentPlanView from './BlogContentPlan';
import { GeminiService } from '../services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface DashboardProps {
  result: AuditResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { target, competitor, swot } = result;
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'organic' | 'onpage' | 'backlinks' | 'swot' | 'blog'>('overview');
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const chartData = [
    { name: 'Target', score: target.healthScore, fill: '#3b82f6' },
    ...(competitor ? [{ name: 'Competitor', score: competitor.healthScore, fill: '#ef4444' }] : []),
  ];

  const handleGenerateBlogPlan = async () => {
    setIsGeneratingContent(true);
    try {
      const gemini = new GeminiService();
      const plan = await gemini.generateBlogContentPlan(result);
      setContentPlan(plan);
    } catch (err) {
      console.error("Failed to generate blog plan", err);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToCSV = () => {
    const rows = [
      ['Metric', 'Target Value'],
      ['URL', target.url],
      ['Health Score', target.healthScore.toFixed(2)],
      ['Performance Score', target.technical.performanceScore],
      ['Broken Internal Links', target.technical.brokenInternalLinks.count],
      ['Broken External Links', target.technical.brokenExternalLinks.count],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seo_audit_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Intelligence Report: {new URL(target.url).hostname}
            {competitor && <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest">VS Competitor</span>}
          </h2>
          <p className="text-slate-400">Deep SEO Analysis & Grounded Research</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20">
            Reset Audit
          </button>
        </div>
      </div>

      <nav className="flex space-x-2 border-b border-slate-800 overflow-x-auto custom-scrollbar pb-1">
        {['overview', 'technical', 'organic', 'onpage', 'backlinks', 'swot', 'blog'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-all capitalize whitespace-nowrap ${
              activeTab === tab 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'blog' ? 'Blog Strategy' : tab === 'organic' ? 'Organic Intel' : tab === 'onpage' ? 'On-Page SEO' : tab}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Health Score" value={`${target.healthScore.toFixed(1)}%`} subtitle="Overall Integrity" color={target.healthScore > 80 ? 'green' : 'red'} />
              <MetricCard 
                title="Internal 404s" 
                value={target.technical.brokenInternalLinks.count} 
                subtitle="On-Site Broken Links" 
                color={target.technical.brokenInternalLinks.count > 0 ? 'red' : 'green'} 
              />
              <MetricCard 
                title="Performance" 
                value={`${target.technical.performanceScore}/100`} 
                subtitle="Load Time & Efficiency" 
                color={target.technical.performanceScore > 80 ? 'blue' : 'yellow'} 
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6 text-blue-400">Competitive Health Comparison</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Grounded Technical Vitals</h3>
            <div className="space-y-4">
               <VitalRow label="Mobile Optimization" value={target.technical.mobileFriendly ? 'Pass' : 'Fail'} highlight={target.technical.mobileFriendly} />
               <VitalRow label="Internal Architecture" value={`${target.technical.internalLinking.internalLinkScore}/100`} highlight={target.technical.internalLinking.internalLinkScore > 70} />
               <VitalRow label="HTTPS Security" value={target.technical.httpsSecurity} />
               <VitalRow label="Robots.txt" value={target.technical.robotsTxtStatus} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'organic' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl -ml-32 -mt-32"></div>
            <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Organic Intelligence & Gap Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2">Keyword Landscape</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/40 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Target Top 5</p>
                    <ul className="space-y-2">
                      {target.organicIntel.topKeywords.slice(0, 5).map((kw, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="text-[10px] text-slate-600 font-mono">#{i+1}</span> {kw}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {competitor && (
                    <div className="p-4 bg-slate-800/40 rounded-xl">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">Competitor Top 5</p>
                      <ul className="space-y-2">
                        {competitor.organicIntel.topKeywords.slice(0, 5).map((kw, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="text-[10px] text-slate-600 font-mono">#{i+1}</span> {kw}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2">High-Intent Content Gaps</h4>
                <div className="space-y-3">
                  {target.organicIntel.gapAnalysis.map((gap, i) => (
                    <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl group hover:bg-emerald-500/10 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-emerald-400">{gap.topic}</p>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase font-black">{gap.intent}</span>
                      </div>
                      <p className="text-xs text-slate-500 italic">Targeting Competitor Rank on {new URL(gap.competitorUrl).hostname}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {target.organicIntel.serpAnalysis && (
              <div className="mt-12 space-y-6">
                <h4 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2">SERP Competitive Tracking</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {target.organicIntel.serpAnalysis.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl">
                      <p className="text-xs font-bold text-slate-400 mb-3 truncate" title={item.query}>{item.query}</p>
                      <div className="flex justify-between text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500 text-[10px] uppercase">Target</span>
                          <span className={`font-bold ${item.targetRank <= 3 ? 'text-green-500' : 'text-blue-400'}`}>#{item.targetRank}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                          <span className="text-slate-500 text-[10px] uppercase">Competitor</span>
                          <span className={`font-bold ${item.competitorRank <= item.targetRank ? 'text-red-400' : 'text-slate-400'}`}>#{item.competitorRank}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <AuditSection 
            title="Technical Audit Summary" 
            data={[
              { label: 'Broken Internal', value: target.technical.brokenInternalLinks.count, status: target.technical.brokenInternalLinks.count > 0 ? 'error' : 'success' },
              { label: 'Broken External', value: target.technical.brokenExternalLinks.count, status: target.technical.brokenExternalLinks.count > 0 ? 'error' : 'success' },
              { label: 'Orphan Pages', value: target.technical.internalLinking.orphanPagesCount, status: target.technical.internalLinking.orphanPagesCount > 0 ? 'warning' : 'success' },
              { label: 'Mixed Content', value: target.technical.mixedContent ? 'Detected' : 'None', status: target.technical.mixedContent ? 'error' : 'success' },
              { label: 'Robots.txt', value: target.technical.robotsTxtStatus, status: target.technical.robotsTxtStatus.toLowerCase().includes('ok') ? 'success' : 'warning' },
              { label: 'HTTPS Security', value: target.technical.httpsSecurity, status: target.technical.httpsSecurity.toLowerCase().includes('secure') ? 'success' : 'error' },
            ]}
            details={[
              ...target.errors.details,
              ...target.technical.brokenInternalLinks.list.map(u => `Internal 404: ${u}`),
              ...target.technical.brokenExternalLinks.list.map(u => `External 404: ${u}`),
            ]}
            suggestions={target.technical.suggestions}
          />
        </div>
      )}

      {activeTab === 'onpage' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Semantic & Structural Optimization
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricCard title="H1 Integrity" value={target.onPage.missingH1s > 0 ? 'Fix Needed' : 'Optimized'} color={target.onPage.missingH1s > 0 ? 'red' : 'green'} subtitle={`${target.onPage.missingH1s} Pages Missing`} />
              <MetricCard title="Title Optimization" value={target.onPage.duplicateTitles > 0 ? 'Warning' : 'Good'} color={target.onPage.duplicateTitles > 0 ? 'yellow' : 'green'} subtitle={`${target.onPage.duplicateTitles} Duplicate Titles`} />
              <MetricCard title="Keyword Score" value={`${target.onPage.keywordOptimizationScore}%`} color="blue" subtitle="Topical Depth" />
              <MetricCard title="Meta Desc Gap" value={target.onPage.missingMetaDescriptions} color={target.onPage.missingMetaDescriptions > 0 ? 'yellow' : 'green'} subtitle="Missing Descriptions" />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Actionable Fix Recommendations
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {target.onPage.actionableSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl group hover:border-emerald-500/50 transition-all">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">{i+1}</span>
                    <p className="text-sm text-slate-200 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backlinks' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Authority & Off-Page Network
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <MetricCard title="Target DA" value={target.authority.domainAuthority} color="blue" subtitle="Domain Authority" />
              {competitor && (
                <MetricCard title="Competitor DA" value={competitor.authority.domainAuthority} color="red" subtitle="Domain Authority" />
              )}
              <MetricCard title="Toxic Risk" value={target.authority.toxicLinks} color={target.authority.toxicLinks > 5 ? 'red' : 'green'} subtitle="Spam Potential" />
              <MetricCard title="Referring Domains" value={target.authority.referringDomains} color="slate" subtitle="Root Domain Count" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Target Top Backlinks</h4>
                <div className="space-y-2">
                  {target.authority.topReferringDomains.map((domain, i) => (
                    <div key={i} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs font-mono text-blue-400">
                      {domain}
                    </div>
                  ))}
                </div>
              </div>
              {competitor && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-right">Competitor Top Backlinks</h4>
                  <div className="space-y-2">
                    {competitor.authority.topReferringDomains.map((domain, i) => (
                      <div key={i} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs font-mono text-red-400 text-right">
                        {domain}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'swot' && <SWOTAnalysisView swot={swot} />}

      {activeTab === 'blog' && (
        <div className="space-y-6">
          {!contentPlan && !isGeneratingContent && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Content Bridge Roadmap</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Based on the discovered content gaps and organic data, we can build a 30-day strategy to overtake competition.
              </p>
              <button 
                onClick={handleGenerateBlogPlan} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/10 active:scale-95"
              >
                Generate 30-Day Content Plan
              </button>
            </div>
          )}
          {isGeneratingContent && (
            <div className="p-20 text-center animate-pulse">
              <p className="text-blue-400 font-bold mb-2 uppercase tracking-widest">Synthesizing Content Map...</p>
              <p className="text-slate-500 text-sm">Aligning search intent with domain authority gaps</p>
            </div>
          )}
          {contentPlan && <BlogContentPlanView plan={contentPlan} />}
        </div>
      )}
    </div>
  );
};

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-3 rounded-xl border border-transparent transition-colors ${highlight ? 'bg-emerald-500/5' : ''}`}>
    <span className="text-sm font-medium text-slate-400">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-emerald-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

const OrganicSubList: React.FC<{ title: string, items: string[], color: 'blue' | 'red', isPages?: boolean }> = ({ title, items, color, isPages }) => (
  <div className="space-y-4">
    <p className={`text-[10px] font-bold ${color === 'blue' ? 'text-blue-400' : 'text-red-400'} uppercase tracking-widest`}>{title}</p>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-800 rounded-xl group transition-all hover:bg-slate-800/50">
          <span className="text-[10px] text-slate-600 font-mono w-4">{i + 1}</span>
          <p className={`text-xs ${isPages ? 'font-mono text-[10px] truncate' : 'text-slate-200'} flex-1`}>{item}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;
