
import React, { useState } from 'react';
import { AuditResult, SEOAuditData, ContentPlan } from '../types';
import MetricCard from './MetricCard';
import AuditSection from './AuditSection';
import SWOTAnalysisView from './SWOTAnalysis';
import BlogContentPlanView from './BlogContentPlan';
import { GeminiService } from '../services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest-label border border-emerald-500/20">Final Intelligence Report</span>
            <span className="text-slate-700 text-xs font-medium">•</span>
            <span className="text-slate-500 text-xs font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white font-display tracking-tight flex items-center gap-3">
            {new URL(target.url).hostname}
            {competitor && (
              <span className="flex items-center gap-2 text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full uppercase tracking-widest-label">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.4503-.4503l-7 3a1 1 0 00-.4503 1.4503l7 3a1 1 0 001.4503-.4503l-7-3a1 1 0 00.4503-1.4503l7-3z" clipRule="evenodd" /></svg>
                Vs Rival
              </span>
            )}
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-300 uppercase tracking-widest-label">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Logs
          </button>
          <button onClick={onReset} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest-label">
            New Audit
          </button>
        </div>
      </div>

      <nav className="flex space-x-2 bg-slate-900/50 p-1 rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar">
        {['overview', 'technical', 'organic', 'onpage', 'backlinks', 'swot', 'blog'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2.5 text-xs font-bold transition-all uppercase tracking-widest-label rounded-xl whitespace-nowrap ${
              activeTab === tab 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab === 'blog' ? 'Blog Strategy' : tab === 'organic' ? 'Organic Intel' : tab === 'onpage' ? 'On-Page SEO' : tab}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Health Score" value={`${target.healthScore.toFixed(1)}%`} subtitle="Global Site Integrity" color={target.healthScore > 80 ? 'green' : 'red'} />
                <MetricCard 
                  title="Internal 404s" 
                  value={target.technical.brokenInternalLinks.count} 
                  subtitle="Critical Broken Links" 
                  color={target.technical.brokenInternalLinks.count > 0 ? 'red' : 'green'} 
                />
                <MetricCard 
                  title="Performance" 
                  value={`${target.technical.performanceScore}/100`} 
                  subtitle="Speed & Core Vitals" 
                  color={target.technical.performanceScore > 80 ? 'blue' : 'yellow'} 
                />
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-8 text-white font-display tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  Competitive Health Benchmarking
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={600} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={12} fontWeight={600} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 text-white font-display tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Technical Vitals
              </h3>
              <div className="space-y-3">
                 <VitalRow label="Mobile Responsive" value={target.technical.mobileFriendly ? 'Pass' : 'Fail'} highlight={target.technical.mobileFriendly} />
                 <VitalRow label="Architecture Score" value={`${target.technical.internalLinking.internalLinkScore}/100`} highlight={target.technical.internalLinking.internalLinkScore > 70} />
                 <VitalRow label="SSL Security" value={target.technical.httpsSecurity} />
                 <VitalRow label="Indexing Status" value={target.technical.robotsTxtStatus} />
              </div>
              <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest-label mb-2">System Insight</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {target.healthScore > 85 
                    ? "Your technical foundation is robust. Focus on content clusters." 
                    : "Multiple technical bottlenecks detected. Prioritize H1 and 404 remediation."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'organic' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 blur-[100px] -ml-48 -mt-48"></div>
              <h3 className="text-2xl font-bold mb-10 text-white font-display tracking-tight flex items-center gap-3 relative z-10">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Organic Intelligence & Market Gaps
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-8">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest-label border-b border-white/5 pb-3">Keyword Landscape</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest-label mb-4">Target Core Set</p>
                      <ul className="space-y-3">
                        {target.organicIntel.topKeywords.slice(0, 5).map((kw, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-center gap-3 font-medium">
                            <span className="text-[10px] text-slate-600 font-bold w-4">0{i+1}</span> {kw}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {competitor && (
                      <div className="p-5 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest-label mb-4">Competitor Core Set</p>
                        <ul className="space-y-3">
                          {competitor.organicIntel.topKeywords.slice(0, 5).map((kw, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-center gap-3 font-medium">
                              <span className="text-[10px] text-slate-600 font-bold w-4">0{i+1}</span> {kw}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest-label border-b border-white/5 pb-3">Strategic Content Gaps</h4>
                  <div className="space-y-4">
                    {target.organicIntel.gapAnalysis.map((gap, i) => (
                      <div key={i} className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl group hover:bg-emerald-500/10 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-emerald-400 font-display text-lg tracking-tight">{gap.topic}</p>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase font-black tracking-widest-label">{gap.intent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-500/40"></div>
                           <p className="text-xs text-slate-500 font-medium">Dominant Competitor: <span className="text-slate-400">{new URL(gap.competitorUrl).hostname}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {target.organicIntel.serpAnalysis && (
                <div className="mt-16 space-y-8 relative z-10">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest-label border-b border-white/5 pb-3">SERP Competitive Performance</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {target.organicIntel.serpAnalysis.map((item, i) => (
                      <div key={i} className="p-6 bg-slate-900/80 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 group">
                        <div className="mb-6">
                          <p className="text-xs font-bold text-slate-200 mb-4 truncate group-hover:text-white" title={item.query}>{item.query}</p>
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-600 text-[9px] uppercase font-black tracking-widest-label">Target Rank</span>
                              <span className={`text-2xl font-black font-display tracking-tight-data ${item.targetRank <= 3 ? 'text-emerald-500' : item.targetRank <= 10 ? 'text-blue-500' : 'text-slate-500'}`}>#{item.targetRank}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-right">
                              <span className="text-slate-600 text-[9px] uppercase font-black tracking-widest-label">Vs Rival</span>
                              <span className={`text-lg font-bold font-display ${item.competitorRank <= item.targetRank ? 'text-rose-500' : 'text-slate-300'}`}>#{item.competitorRank}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                          <span className="text-[9px] text-slate-600 uppercase font-black block mb-1 tracking-widest-label">Keyword Leader</span>
                          <p className="text-[10px] text-emerald-400 font-bold truncate tracking-tight">{item.topCompetitor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs follow the same refined typography patterns */}
        {activeTab === 'technical' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AuditSection 
              title="Technical Ecosystem Audit" 
              data={[
                { label: 'Broken Internal', value: target.technical.brokenInternalLinks.count, status: target.technical.brokenInternalLinks.count > 0 ? 'error' : 'success' },
                { label: 'Broken External', value: target.technical.brokenExternalLinks.count, status: target.technical.brokenExternalLinks.count > 0 ? 'error' : 'success' },
                { label: 'Orphan Pages', value: target.technical.internalLinking.orphanPagesCount, status: target.technical.internalLinking.orphanPagesCount > 0 ? 'warning' : 'success' },
                { label: 'Mixed Content', value: target.technical.mixedContent ? 'Detected' : 'None', status: target.technical.mixedContent ? 'error' : 'success' },
                { label: 'Robots.txt Status', value: target.technical.robotsTxtStatus, status: target.technical.robotsTxtStatus.toLowerCase().includes('ok') ? 'success' : 'warning' },
                { label: 'Security Protocols', value: target.technical.httpsSecurity, status: target.technical.httpsSecurity.toLowerCase().includes('secure') ? 'success' : 'error' },
              ]}
              details={[
                ...target.errors.details,
                ...target.technical.brokenInternalLinks.list.map(u => `Internal Link Failure (404): ${u}`),
                ...target.technical.brokenExternalLinks.list.map(u => `External Link Failure (404): ${u}`),
              ]}
              suggestions={target.technical.suggestions}
            />
          </div>
        )}

        {activeTab === 'onpage' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-10 text-white font-display tracking-tight flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                On-Page Semantic Optimization
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard title="H1 Presence" value={target.onPage.missingH1s > 0 ? 'Fix Needed' : 'Optimized'} color={target.onPage.missingH1s > 0 ? 'red' : 'green'} subtitle={`${target.onPage.missingH1s} Gaps Detected`} />
                <MetricCard title="Title Health" value={target.onPage.duplicateTitles > 0 ? 'Conflict' : 'Perfect'} color={target.onPage.duplicateTitles > 0 ? 'yellow' : 'green'} subtitle={`${target.onPage.duplicateTitles} Duplicates`} />
                <MetricCard title="Topical Depth" value={`${target.onPage.keywordOptimizationScore}%`} color="blue" subtitle="Semantic Score" />
                <MetricCard title="Meta Data Gaps" value={target.onPage.missingMetaDescriptions} color={target.onPage.missingMetaDescriptions > 0 ? 'yellow' : 'green'} subtitle="Missing Desc Tags" />
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest-label mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Remediation Checklist
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {target.onPage.actionableSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex gap-5 p-5 bg-slate-800/20 border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all duration-300">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold font-display text-sm shrink-0">0{i+1}</span>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backlinks' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-10 text-white font-display tracking-tight flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Authority Profile & Off-Page Network
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard title="Domain Power" value={target.authority.domainAuthority} color="blue" subtitle="Domain Authority" />
                {competitor && (
                  <MetricCard title="Rival Power" value={competitor.authority.domainAuthority} color="red" subtitle="Competitor Authority" />
                )}
                <MetricCard title="Risk Exposure" value={target.authority.toxicLinks} color={target.authority.toxicLinks > 5 ? 'red' : 'green'} subtitle="Toxic Backlink Count" />
                <MetricCard title="Root Domains" value={target.authority.referringDomains} color="slate" subtitle="Total Unique Ref Sites" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label">Primary Authority Sources (Target)</h4>
                  <div className="space-y-2">
                    {target.authority.topReferringDomains.map((domain, i) => (
                      <div key={i} className="p-4 bg-slate-900/80 border border-white/5 rounded-2xl text-[11px] font-bold font-mono text-blue-400/80 shadow-sm">
                        {domain}
                      </div>
                    ))}
                  </div>
                </div>
                {competitor && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label text-right">Primary Authority Sources (Competitor)</h4>
                    <div className="space-y-2">
                      {competitor.authority.topReferringDomains.map((domain, i) => (
                        <div key={i} className="p-4 bg-slate-900/80 border border-white/5 rounded-2xl text-[11px] font-bold font-mono text-rose-400/80 text-right shadow-sm">
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!contentPlan && !isGeneratingContent && (
              <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-16 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 ring-1 ring-blue-500/20 shadow-2xl shadow-blue-500/10">
                   <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold mb-4 font-display text-white tracking-tight">Overtake Your Competition</h3>
                <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed font-medium">
                  Synthesize a data-driven 30-day content roadmap based on verified market gaps and keyword difficulty.
                </p>
                <button 
                  onClick={handleGenerateBlogPlan} 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 font-display tracking-wide uppercase text-sm"
                >
                  Create 30-Day Strategy
                </button>
              </div>
            )}
            {isGeneratingContent && (
              <div className="p-24 text-center">
                <div className="flex justify-center gap-1.5 mb-6">
                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
                <p className="text-white font-bold font-display text-xl mb-2 uppercase tracking-widest-label">Mapping Opportunity Clusters...</p>
                <p className="text-slate-500 text-sm font-medium">Aligning user intent with domain authority spikes</p>
              </div>
            )}
            {contentPlan && <BlogContentPlanView plan={contentPlan} />}
          </div>
        )}
      </div>
    </div>
  );
};

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-4 rounded-2xl border border-transparent transition-all duration-300 ${highlight ? 'bg-emerald-500/10 border-emerald-500/10' : 'hover:bg-white/5'}`}>
    <span className="text-sm font-semibold text-slate-400">{label}</span>
    <span className={`text-sm font-extrabold font-display ${highlight ? 'text-emerald-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
