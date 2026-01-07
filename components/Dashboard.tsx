
import React, { useState } from 'react';
import { AuditResult, ContentPlan, StrategicGap } from '../types';
import MetricCard from './MetricCard';
import AuditSection from './AuditSection';
import SWOTAnalysisView from './SWOTAnalysis';
import BlogContentPlanView from './BlogContentPlan';
import { GeminiService } from '../services/gemini';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface DashboardProps {
  result: AuditResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { target, competitor, swot } = result;
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'competitive' | 'keywords' | 'onpage' | 'backlinks' | 'swot' | 'blog'>('overview');
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

  const dailyTrend = target?.organicIntel?.dailyTrafficStats || [];

  const radarData = competitor?.organicIntel?.competitiveIntelligence?.serpFeatures?.map(f => ({
    subject: f.feature,
    target: f.ownedByTarget ? 100 : 20,
    competitor: f.ownedByCompetitor ? 100 : 20,
    fullMark: 100,
  })) || [];

  const keywordStatsData = target?.organicIntel?.topKeywords?.map(kw => ({
    keyword: kw.keyword,
    difficulty: kw.difficulty,
    volume: parseFloat(kw.volume.replace(/[^0-9.]/g, '')) * (kw.volume.includes('K') ? 1000 : 1)
  })).slice(0, 5) || [];

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

      {/* Navigation - Enhanced with flex-wrap and better visibility for all tabs */}
      <nav className="flex flex-wrap lg:flex-nowrap gap-2 bg-white/[0.03] p-2 rounded-2xl border border-white/10 sticky top-24 z-40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'technical', label: 'Technical' },
          { id: 'competitive', label: 'Competitive' },
          { id: 'keywords', label: 'Keywords' },
          { id: 'onpage', label: 'On-Page' },
          { id: 'backlinks', label: 'Authority' },
          { id: 'swot', label: 'SWOT' },
          { id: 'blog', label: 'Strike' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-max px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest-label transition-all rounded-xl whitespace-nowrap border ${
              activeTab === tab.id 
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border-violet-500' 
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard title="Health Index" value={`${target.healthScore || 0}%`} subtitle="Site Integrity" color="violet" />
              <MetricCard title="Organic Flow" value={target.organicIntel?.estimatedMonthlyTraffic?.toLocaleString() || '0'} subtitle="Monthly Sessions" color="cyan" />
              <MetricCard title="Authority" value={target.authority?.domainAuthority || 0} subtitle="DA Score" color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                  <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                  Daily Traffic Trend (30d)
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} fontStyle="italic" fontWeight={800} />
                      <YAxis stroke="#475569" fontSize={10} fontWeight={800} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
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
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel rounded-[40px] p-10">
                   <h3 className="text-[11px] font-black mb-10 text-violet-400 uppercase tracking-widest-label">Keyword Difficulty vs Volume</h3>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={keywordStatsData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                           <XAxis dataKey="keyword" stroke="#475569" fontSize={9} fontWeight={700} />
                           <YAxis stroke="#475569" fontSize={9} fontWeight={700} />
                           <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '12px' }} />
                           <Bar dataKey="difficulty" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="KD Score" barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="glass-panel rounded-[40px] p-10">
                   <h3 className="text-[11px] font-black mb-10 text-cyan-400 uppercase tracking-widest-label">Strategic Value Metrics</h3>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">High Intent Reach</p>
                            <p className="text-xl font-extrabold text-white font-display">
                               {target.organicIntel.topKeywords.filter(k => k.intent.toLowerCase().includes('trans') || k.intent.toLowerCase().includes('comm')).length} Keywords
                            </p>
                         </div>
                         <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 11c0 0.552-0.448 1-1 1s-1-0.448-1-1 0.448-1 1-1 1 0.448 1 1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM12 4c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z" /></svg>
                         </div>
                      </div>
                      <div className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg. Difficulty</p>
                            <p className="text-xl font-extrabold text-white font-display">
                               {Math.round(target.organicIntel.topKeywords.reduce((acc, curr) => acc + curr.difficulty, 0) / (target.organicIntel.topKeywords.length || 1))} / 100
                            </p>
                         </div>
                         <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="glass-panel rounded-[40px] overflow-hidden">
                <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
                   <h3 className="text-2xl font-extrabold text-white font-display tracking-tight">Search Keywords Recon</h3>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label">Target</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label">Rival</span>
                      </div>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-black/40 text-[10px] font-black uppercase tracking-widest-label text-slate-600 border-b border-white/5">
                            <th className="px-10 py-6">Search Query</th>
                            <th className="px-10 py-6">Domain</th>
                            <th className="px-10 py-6">Intent Mapping</th>
                            <th className="px-10 py-6 text-right">Difficulty (KD)</th>
                            <th className="px-10 py-6 text-right">Est. Volume</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {[
                            ...target.organicIntel.topKeywords.map(k => ({ ...k, domain: 'Target', color: 'violet' })),
                            ...(competitor?.organicIntel.topKeywords.map(k => ({ ...k, domain: 'Competitor', color: 'rose' })) || [])
                         ].sort((a, b) => {
                            const valA = parseFloat(a.volume.replace(/[^0-9.]/g, '')) * (a.volume.includes('K') ? 1000 : 1);
                            const valB = parseFloat(b.volume.replace(/[^0-9.]/g, '')) * (b.volume.includes('K') ? 1000 : 1);
                            return valB - valA;
                         }).map((kw, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] group transition-all">
                               <td className="px-10 py-6">
                                  <p className="font-bold text-slate-100 text-sm group-hover:text-violet-400 transition-colors">{kw.keyword}</p>
                               </td>
                               <td className="px-10 py-6">
                                  <span className={`text-[10px] font-black uppercase tracking-widest-label ${kw.color === 'violet' ? 'text-violet-400' : 'text-rose-400'}`}>
                                     {kw.domain}
                                  </span>
                               </td>
                               <td className="px-10 py-6">
                                  <IntentBadge intent={kw.intent} />
                               </td>
                               <td className="px-10 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                     <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                           className={`h-full ${kw.difficulty > 70 ? 'bg-rose-500' : kw.difficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                           style={{ width: `${kw.difficulty}%` }}
                                        ></div>
                                     </div>
                                     <span className="text-xs font-mono font-bold text-slate-400">{kw.difficulty}%</span>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-right">
                                  <span className="text-sm font-black text-cyan-400 font-display">{kw.volume}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="space-y-12 animate-in fade-in duration-700">
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

            <div className="glass-panel rounded-[40px] p-10 border-rose-500/10">
              <h3 className="text-[11px] font-black mb-10 text-rose-400 uppercase tracking-widest-label flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Strategic Competitive Gaps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitor?.organicIntel?.competitiveIntelligence?.strategicGaps?.map((gap, i) => (
                  <StrategicGapCard key={i} gap={gap} />
                )) || <p className="p-10 text-slate-600 italic text-sm">Synthesizing strategic intelligence...</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass-panel rounded-[40px] p-10 bg-gradient-to-br from-indigo-600/5 to-transparent border-indigo-500/10">
                  <h3 className="text-[11px] font-black mb-10 text-indigo-400 uppercase tracking-widest-label flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Operational Insights
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
                  <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label">Competitive Feature Overlay</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label">Backlink Profile & Authority</h3>
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
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest-label mb-6">Acquisition Targets</h4>
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

const IntentBadge: React.FC<{ intent: string }> = ({ intent }) => {
   const lower = intent.toLowerCase();
   let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
   
   if (lower.includes('trans')) styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
   else if (lower.includes('comm')) styles = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
   else if (lower.includes('info')) styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
   else if (lower.includes('nav')) styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

   return (
      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest-label border ${styles}`}>
         {intent}
      </span>
   );
};

const StrategicGapCard: React.FC<{ gap: StrategicGap }> = ({ gap }) => {
  const impactColors = {
    High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-rose-500/30 transition-all">
      <div className="flex justify-between items-center mb-4">
        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase text-slate-500 border border-white/5 tracking-widest-label">
          {gap.category}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest-label border ${impactColors[gap.impact as keyof typeof impactColors]}`}>
          {gap.impact} Impact
        </span>
      </div>
      <p className="text-sm font-bold text-white mb-3">{gap.description}</p>
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-[9px] font-black text-rose-500 uppercase mb-2 tracking-widest-label">Strategy Remedy</p>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{gap.remedy}</p>
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
