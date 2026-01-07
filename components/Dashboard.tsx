
import React, { useState } from 'react';
import { AuditResult, ContentPlan } from '../types';
import MetricCard from './MetricCard';
import AuditSection from './AuditSection';
import SWOTAnalysisView from './SWOTAnalysis';
import BlogContentPlanView from './BlogContentPlan';
import { GeminiService } from '../services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface DashboardProps {
  result: AuditResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { target, competitor, swot } = result;
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'competitive' | 'onpage' | 'backlinks' | 'swot' | 'blog'>('overview');
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const chartData = [
    { name: 'Target', score: target?.healthScore || 0, fill: '#8b5cf6' },
    ...(competitor ? [{ name: 'Competitor', score: competitor.healthScore || 0, fill: '#fb7185' }] : []),
  ];

  const trafficData = [
    { name: 'Target', value: target?.organicIntel?.estimatedMonthlyTraffic || 1, fill: '#8b5cf6' },
    ...(competitor ? [{ name: 'Competitor', value: competitor.organicIntel?.estimatedMonthlyTraffic || 1, fill: '#fb7185' }] : []),
  ];

  const radarData = competitor?.organicIntel?.competitiveIntelligence?.serpFeatures?.map(f => ({
    subject: f.feature,
    target: f.ownedByTarget ? 100 : 20,
    competitor: f.ownedByCompetitor ? 100 : 20,
    fullMark: 100,
  })) || [];

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

  const getWarningStatus = (val: number, threshold: number) => val < threshold ? 'warning' : 'success';

  if (!target) return <div className="p-20 text-center font-bold">Incomplete intelligence data received.</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-widest-label border border-violet-500/20">Operational Intel Active</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tighter flex flex-wrap items-center gap-5 leading-none">
            {target.url ? new URL(target.url).hostname : 'Target Domain'}
            {competitor && (
              <div className="flex items-center gap-3">
                <span className="text-slate-800 text-xl">/</span>
                <span className="flex items-center gap-2.5 text-[11px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-2xl uppercase tracking-widest-label">
                  vs {new URL(competitor.url).hostname}
                </span>
              </div>
            )}
          </h2>
        </div>
        <button onClick={onReset} className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest-label transition-all active:scale-95 shadow-xl shadow-white/5">
          New Scan
        </button>
      </div>

      <nav className="flex space-x-2 bg-white/[0.03] p-2 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar sticky top-24 z-40 backdrop-blur-md">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'technical', label: 'Technical' },
          { id: 'competitive', label: 'Competitive Recon' },
          { id: 'onpage', label: 'On-Page SEO' },
          { id: 'backlinks', label: 'Authority' },
          { id: 'swot', label: 'SWOT Analysis' },
          { id: 'blog', label: 'Strike Strategy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest-label transition-all rounded-xl whitespace-nowrap ${
              activeTab === tab.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/30' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Health Index" value={`${target.healthScore || 0}%`} subtitle="Site Integrity" color="violet" />
                <MetricCard title="Organic Flow" value={target.organicIntel?.estimatedMonthlyTraffic?.toLocaleString() || '0'} subtitle="Monthly Sessions" color="cyan" />
                <MetricCard title="Authority" value={target.authority?.domainAuthority || 0} subtitle="DA Score" color="indigo" />
              </div>
              <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                  <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                  Market Benchmarking
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} fontStyle="italic" fontWeight={800} />
                      <YAxis stroke="#475569" fontSize={10} fontWeight={800} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '16px' }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="glass-panel rounded-[40px] p-10 flex flex-col">
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
                Traffic Dominance
              </h3>
              <div className="flex-1 min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={trafficData} innerRadius={80} outerRadius={105} paddingAngle={10} dataKey="value" stroke="none">
                      {trafficData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
                <VitalRow label="Market Status" value={competitor?.organicIntel?.competitiveIntelligence?.marketPosition || 'Challenger'} highlight />
                <VitalRow label="Keyword Reach" value={target.organicIntel?.topKeywords?.length?.toString() || '0'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Market Research Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 glass-panel rounded-3xl border-cyan-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Est. PPC Spend</p>
                <p className="text-2xl font-black text-cyan-400 font-display">{competitor?.organicIntel?.competitiveIntelligence?.ppcIntel?.estimatedMonthlySpend || '$0'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-violet-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Content Velocity</p>
                <p className="text-2xl font-black text-violet-400 font-display">{competitor?.organicIntel?.competitiveIntelligence?.contentVelocity || 'Low'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-rose-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Keyword Gap</p>
                <p className="text-2xl font-black text-rose-400 font-display">{competitor?.organicIntel?.competitiveIntelligence?.keywordOverlap?.competitorUnique || '0'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-emerald-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Market Position</p>
                <p className="text-2xl font-black text-emerald-400 font-display">{competitor?.organicIntel?.competitiveIntelligence?.marketPosition || 'N/A'}</p>
              </div>
            </div>

            {/* Outranking Strategy Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass-panel rounded-[40px] p-10 bg-gradient-to-br from-indigo-600/5 to-transparent border-indigo-500/10">
                  <h3 className="text-[11px] font-black mb-10 text-indigo-400 uppercase tracking-widest-label flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Strategic Outranking Tactics
                  </h3>
                  <div className="space-y-5">
                    {competitor?.organicIntel?.competitiveIntelligence?.tacticalRecommendations?.map((tact, i) => (
                      <div key={i} className="flex gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500 font-black text-xs">0{i+1}</div>
                        <p className="text-sm text-slate-300 font-bold leading-relaxed">{tact}</p>
                      </div>
                    )) || <p className="text-slate-600 italic text-xs">Analysis pending data synthesis...</p>}
                  </div>
               </div>

               <div className="glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label">Competitive Keyword Overlay</h3>
                  <div className="h-64 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#ffffff08" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                        <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                        <Radar name="Competitor" dataKey="competitor" stroke="#fb7185" fill="#fb7185" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Keyword Gap Table */}
            <div className="glass-panel rounded-[40px] overflow-hidden">
               <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                  <div>
                    <h3 className="text-xl font-extrabold text-white font-display">Keyword Gap Analysis</h3>
                  </div>
                  <div className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl text-[10px] font-black border border-rose-500/20 uppercase tracking-widest-label">Strike Targets</div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-black/40 text-[10px] font-black uppercase tracking-widest-label text-slate-500 border-b border-white/5">
                       <th className="px-8 py-5">Keyword Cluster</th>
                       <th className="px-8 py-5">Rival Authority</th>
                       <th className="px-8 py-5">Target Deficiency</th>
                       <th className="px-8 py-5">Volume Index</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {competitor?.organicIntel?.competitiveIntelligence?.keywordGaps?.map((gap, i) => (
                       <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-8 py-6 font-bold text-slate-200">{gap.keyword}</td>
                         <td className="px-8 py-6"><span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-black">#{gap.competitorRank}</span></td>
                         <td className="px-8 py-6 text-slate-500 text-xs font-bold">{gap.targetRank}</td>
                         <td className="px-8 py-6"><span className="text-[10px] font-black text-cyan-400">{gap.volume}</span></td>
                       </tr>
                     )) || <tr><td colSpan={4} className="p-10 text-center text-slate-600 font-bold uppercase tracking-widest">No Gap Data Identified</td></tr>}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="animate-in fade-in duration-500 space-y-12">
            <AuditSection 
              title="Technical Integrity Audit" 
              data={[
                { label: 'Security (HTTPS)', value: target.technical?.httpsSecurity || 'N/A', status: target.technical?.httpsSecurity?.includes('Valid') ? 'success' : 'warning' },
                { label: 'Performance', value: `${target.technical?.performanceScore || 0}/100`, status: (target.technical?.performanceScore || 0) > 70 ? 'success' : 'warning' },
                { label: 'Internal Structure', value: `${target.technical?.internalLinking?.internalLinkScore || 0}/100`, status: (target.technical?.internalLinking?.internalLinkScore || 0) > 60 ? 'success' : 'warning' },
              ]}
              details={target.errors?.details}
              suggestions={target.technical?.suggestions}
            />

            {/* Quick Fixes for Technical Warnings */}
            <div className="glass-panel rounded-[40px] p-10 border-amber-500/10">
              <h3 className="text-[11px] font-black mb-10 text-amber-400 uppercase tracking-widest-label flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Technical Quick Fixes (Warnings)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {target.technical?.performanceScore < 70 && (
                   <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                     <p className="text-[9px] font-black text-amber-500 uppercase mb-2">Performance Vital</p>
                     <p className="text-xs text-slate-300 font-bold">Compress all LCP images and implement browser caching to instantly boost load speed.</p>
                   </div>
                 )}
                 {target.technical?.brokenInternalLinks?.count > 0 && (
                   <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl">
                     <p className="text-[9px] font-black text-rose-500 uppercase mb-2">Broken Links</p>
                     <p className="text-xs text-slate-300 font-bold">Identify 404 targets in search console and map 301 redirects to relevant high-authority pages.</p>
                   </div>
                 )}
                 {!target.technical?.httpsSecurity?.includes('Valid') && (
                   <div className="p-6 bg-violet-500/5 border border-violet-500/20 rounded-3xl">
                     <p className="text-[9px] font-black text-violet-500 uppercase mb-2">SSL Security</p>
                     <p className="text-xs text-slate-300 font-bold">Renew SSL certificate and force HSTS headers to eliminate mixed content security errors.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'onpage' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Deep On-Page Diagnostic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Title Tag Deep Analysis */}
               <div className="glass-panel rounded-[40px] p-8 hover:border-violet-500/30 transition-all group">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label">Title Tag Health</h3>
                    <StatusBadge status={getWarningStatus(target.onPage.avgTitleLength, 50)} />
                  </div>
                  <div className="text-4xl font-extrabold text-white font-display mb-3">{target.onPage.avgTitleLength} <span className="text-sm font-bold text-slate-600">chars</span></div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">Optimal: 50-60. Long titles get truncated in SERPs, decreasing CTR.</p>
                  <div className="p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10">
                    <p className="text-[8px] font-black text-violet-400 uppercase mb-2">Quick Fix</p>
                    <p className="text-[10px] font-bold text-slate-300">Front-load primary keywords and remove boilerplate branding from the end of title tags.</p>
                  </div>
               </div>

               {/* Meta Description Deep Analysis */}
               <div className="glass-panel rounded-[40px] p-8 hover:border-cyan-500/30 transition-all group">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label">Meta Effectiveness</h3>
                    <StatusBadge status={getWarningStatus(target.onPage.metaEffectivenessScore, 70)} />
                  </div>
                  <div className="text-4xl font-extrabold text-white font-display mb-3">{target.onPage.metaEffectivenessScore}<span className="text-sm font-bold text-slate-600">%</span></div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">Measures CTA strength and keyword inclusion. High scores correlate with better CTR.</p>
                  <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                    <p className="text-[8px] font-black text-cyan-400 uppercase mb-2">Optimization Path</p>
                    <p className="text-[10px] font-bold text-slate-300">Incorporate power words (Free, New, Proven) and ensure meta length is between 120-160 chars.</p>
                  </div>
               </div>

               {/* H1 Tag Deep Analysis */}
               <div className="glass-panel rounded-[40px] p-8 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label">H1 Integrity</h3>
                    <StatusBadge status={getWarningStatus(target.onPage.h1OptimizationScore, 80)} />
                  </div>
                  <div className="text-4xl font-extrabold text-white font-display mb-3">{target.onPage.h1OptimizationScore}<span className="text-sm font-bold text-slate-600">%</span></div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">Reflects H1 uniqueness and keyword prominence at the top of the content tree.</p>
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                    <p className="text-[8px] font-black text-indigo-400 uppercase mb-2">Structural Remedy</p>
                    <p className="text-[10px] font-bold text-slate-300">Ensure every page has exactly ONE H1 tag that explicitly uses the primary target search term.</p>
                  </div>
               </div>
            </div>

            {/* Keyword Comparison Table */}
            <div className="glass-panel rounded-[40px] p-10">
               <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label">Semantic Keyword Prominence Analysis</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black uppercase text-slate-600 border-b border-white/5">
                       <th className="pb-5 px-4">Keyword Cluster</th>
                       <th className="pb-5 px-4">Target Density</th>
                       <th className="pb-5 px-4">Target Prominence</th>
                       <th className="pb-5 px-4">Rival Focus</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {target.onPage.topOnPageKeywords?.map((kw, i) => (
                       <tr key={i} className="group hover:bg-white/[0.02]">
                         <td className="py-5 px-4 text-sm font-bold text-slate-200">{kw.keyword}</td>
                         <td className="py-5 px-4 text-xs font-mono text-cyan-400">{kw.density}%</td>
                         <td className="py-5 px-4">
                            <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full uppercase text-slate-400 border border-white/5">
                              {kw.prominence}
                            </span>
                         </td>
                         <td className="py-5 px-4">
                            <div className="flex items-center gap-2">
                               <div className="h-1.5 w-12 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-rose-500" style={{ width: `${(Math.random() * 80) + 10}%` }}></div>
                               </div>
                               <span className="text-[9px] font-black text-slate-500">Rival Tracked</span>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Actionable Suggestions Summary */}
            <div className="glass-panel rounded-[40px] p-10">
              <h3 className="text-[11px] font-black mb-10 text-rose-400 uppercase tracking-widest-label">Master On-Page Action Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {target.onPage.actionableSuggestions.map((sug, i) => (
                  <div key={i} className="flex gap-5 p-6 bg-black/40 border border-white/5 rounded-3xl group hover:border-violet-500/30 transition-all">
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 font-black text-[10px]">A{i+1}</div>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">{sug}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backlinks' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="glass-panel rounded-[40px] p-10">
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label">Backlink Profile & Acquisition</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <MetricCard title="Domain Authority" value={target.authority?.domainAuthority || 0} color="indigo" />
                <MetricCard title="Referring Domains" value={target.authority?.referringDomains || 0} color="cyan" />
                {competitor && <MetricCard title="Competitor DA" value={competitor.authority?.domainAuthority || 0} color="rose" />}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest-label mb-6">Current Power Links</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {target.authority?.topReferringDomains?.map((domain, i) => (
                        <div key={i} className="p-5 bg-black/40 border border-white/10 rounded-2xl text-[12px] font-bold text-indigo-400 group hover:bg-indigo-500/5 hover:border-indigo-500/40 transition-all">
                          {domain}
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest-label mb-6">High-Value Acquisition Targets</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {competitor?.authority?.highValueTargetLinks?.map((domain, i) => (
                        <div key={i} className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-[12px] font-bold text-rose-300 group hover:bg-rose-500/10 hover:border-rose-500/50 transition-all flex items-center justify-between">
                           <span>{domain}</span>
                           <span className="text-[8px] font-black bg-rose-500/20 px-2 py-1 rounded-full uppercase">Rival Link</span>
                        </div>
                      )) || <p className="text-slate-600 italic text-xs">No competitive link gaps detected.</p>}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'swot' && <SWOTAnalysisView swot={swot} />}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            {!contentPlan && !isGeneratingContent && (
              <div className="glass-panel rounded-[50px] p-24 text-center">
                <h3 className="text-4xl font-extrabold mb-5 font-display tracking-tighter text-white">AI Content Offensive</h3>
                <p className="text-slate-500 mb-12 text-lg max-w-lg mx-auto">Coordinate a content roadmap to neutralize competitor dominance.</p>
                <button onClick={handleGenerateBlogPlan} className="btn-primary text-white font-black py-5 px-12 rounded-2xl transition-all uppercase text-xs tracking-widest-label">Generate Strike Plan</button>
              </div>
            )}
            {isGeneratingContent && (
              <div className="p-32 text-center">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-black text-sm uppercase tracking-widest-label">Processing Intelligence Roadmap...</p>
              </div>
            )}
            {contentPlan && <BlogContentPlanView plan={contentPlan} />}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'success' | 'warning' | 'error' }> = ({ status }) => {
  const styles = {
    success: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
    warning: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    error: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest-label border ${styles[status]}`}>
      {status}
    </span>
  );
}

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-5 rounded-3xl border border-transparent transition-all ${highlight ? 'bg-violet-500/5 border-violet-500/10' : 'hover:bg-white/5'}`}>
    <span className="text-xs font-bold text-slate-500">{label}</span>
    <span className={`text-[11px] font-black uppercase tracking-widest-label ${highlight ? 'text-violet-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
