
import React, { useState } from 'react';
import { AuditResult, ContentPlan, StrategicGap } from '../types';
import MetricCard from './MetricCard';
import AuditSection from './AuditSection';
import SWOTAnalysisView from './SWOTAnalysis';
import BlogContentPlanView from './BlogContentPlan';
import VirtualAssistant from './VirtualAssistant';
import { GeminiService } from '../services/gemini';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface DashboardProps {
  result: AuditResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { target, competitor, swot } = result;
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'technical' | 'competitive' | 'keywords' | 'onpage' | 'backlinks' | 'swot' | 'blog'>('overview');
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

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
  })).slice(0, 8) || [];

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-widest-label border border-violet-500/20">Advanced Intelligence v4.5</span>
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

      <nav className="flex flex-wrap lg:flex-nowrap gap-2 bg-white/[0.03] p-2 rounded-2xl border border-white/10 sticky top-24 z-40 backdrop-blur-md overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'performance', label: 'Performance' },
          { id: 'technical', label: 'Technical' },
          { id: 'competitive', label: 'Competitive' },
          { id: 'keywords', label: 'Keywords' },
          { id: 'onpage', label: 'On-Page' },
          { id: 'backlinks', label: 'Authority' },
          { id: 'swot', label: 'SWOT' },
          { id: 'blog', label: 'Strike Plan' },
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

      <div className="mt-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard title="Health Index" value={`${target.healthScore || 0}%`} subtitle="Overall Site Integrity" color="violet" />
              <MetricCard title="Organic Flow" value={target.organicIntel?.estimatedMonthlyTraffic?.toLocaleString() || '0'} subtitle="Monthly Sessions" color="cyan" />
              <MetricCard title="Total Pages" value={target.totalPages || 0} subtitle="Crawled Content Nodes" color="teal" />
              <MetricCard title="Authority" value={target.authority?.domainAuthority || 0} subtitle="DA Score" color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                    <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                    Search Visibility Matrix (30d)
                  </h3>
                  <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest-label bg-violet-500/10 px-3 py-1 rounded-lg">Historical Recon</div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} fontStyle="italic" fontWeight={800} />
                      <YAxis stroke="#475569" fontSize={10} fontWeight={800} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-[40px] p-10 flex flex-col">
                <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                  <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
                  Competitive Dominance
                </h3>
                <div className="flex-1 min-h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={trafficData} innerRadius={85} outerRadius={115} paddingAngle={8} dataKey="value" stroke="none">
                        {trafficData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Share</span>
                    <span className="text-2xl font-black text-white font-display">
                      {Math.round((trafficData[0].value / (trafficData[0].value + (trafficData[1]?.value || 0))) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mt-8 pt-8 border-t border-white/5">
                  <VitalRow label="Market Status" value={target?.organicIntel?.competitiveIntelligence?.marketPosition || 'N/A'} highlight />
                  <VitalRow label="Keyword Pool" value={target.organicIntel?.topKeywords?.length?.toString() || '0'} />
                  <VitalRow label="Thin Content" value={target.content?.thinContentCount?.toString() || '0'} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="glass-panel rounded-[40px] p-12">
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Google PageSpeed Insights: Heuristic Diagnostics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <LighthouseGauge label="Performance" value={target.lighthouse?.performance || 0} />
                <LighthouseGauge label="Accessibility" value={target.lighthouse?.accessibility || 0} />
                <LighthouseGauge label="Best Practices" value={target.lighthouse?.bestPractices || 0} />
                <LighthouseGauge label="SEO" value={target.lighthouse?.seo || 0} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label">Core Web Vitals Assessment</h3>
                   <span className={`px-4 py-1 rounded-full text-[10px] font-black border ${target.coreWebVitals?.assessment === 'PASSED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                     {target.coreWebVitals?.assessment || 'FAILED'}
                   </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <VitalsMetric label="Largest Contentful Paint (LCP)" value={target.coreWebVitals?.lcp || '0s'} threshold="2.5s" description="Main content loading speed." />
                  <VitalsMetric label="Cumulative Layout Shift (CLS)" value={target.coreWebVitals?.cls || '0'} threshold="0.1" description="Visual stability of page layout." />
                  <VitalsMetric label="Total Blocking Time (TBT)" value={target.coreWebVitals?.tbt || '0ms'} threshold="200ms" description="Responsiveness during hydration." />
                  <VitalsMetric label="Speed Index" value={target.coreWebVitals?.speedIndex || '0s'} threshold="3.4s" description="Visual progression of content." />
                </div>
              </div>
              
              <div className="glass-panel rounded-[40px] p-10 bg-indigo-500/5 border-indigo-500/10">
                <h3 className="text-[11px] font-black mb-8 text-indigo-400 uppercase tracking-widest-label">Structural Insights</h3>
                <div className="space-y-4">
                  {target.technical?.suggestions?.map((sug, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                       <div className="shrink-0 w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-[10px] font-black">!</div>
                       <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="animate-in fade-in duration-500 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="glass-panel p-8 rounded-[40px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Redirect Chains</p>
                  <p className="text-3xl font-black text-white">{target.technical?.redirectChains}</p>
               </div>
               <div className="glass-panel p-8 rounded-[40px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Robots.txt Status</p>
                  <p className="text-3xl font-black text-emerald-400">{target.technical?.robotsTxtStatus}</p>
               </div>
               <div className="glass-panel p-8 rounded-[40px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Internal Link Score</p>
                  <p className="text-3xl font-black text-indigo-400">{target.technical?.internalLinking?.internalLinkScore}/100</p>
               </div>
            </div>

            <AuditSection 
              title="Technical Integrity Audit" 
              data={[
                { label: 'Security (HTTPS)', value: target.technical?.httpsSecurity || 'N/A', status: 'success' },
                { label: 'Broken Internal Links', value: target.technical?.brokenInternalLinks?.count || 0, status: (target.technical?.brokenInternalLinks?.count || 0) === 0 ? 'success' : 'error' },
                { label: 'Orphan Pages', value: target.technical?.internalLinking?.orphanPagesCount || 0, status: 'warning' },
                { label: 'Mixed Content', value: target.technical?.mixedContent ? 'Found' : 'Clean', status: target.technical?.mixedContent ? 'error' : 'success' },
              ]}
              details={[
                ...(target.errors?.details || []),
                ...(target.technical?.brokenInternalLinks?.list.map(l => `Broken Internal: ${l}`) || []),
                ...(target.technical?.brokenExternalLinks?.list.map(l => `Broken External: ${l}`) || [])
              ]}
              suggestions={target.technical?.suggestions}
            />
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black mb-12 text-violet-400 uppercase tracking-widest-label">Keyword Difficulty Heatmap</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={keywordStatsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="keyword" stroke="#475569" fontSize={9} fontWeight={800} />
                        <YAxis stroke="#475569" fontSize={9} fontWeight={800} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '12px' }} />
                        <Bar dataKey="difficulty" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="KD Score" barSize={35}>
                           {keywordStatsData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.difficulty > 60 ? '#fb7185' : '#8b5cf6'} />
                           ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="glass-panel rounded-[40px] overflow-hidden">
                <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
                   <h3 className="text-2xl font-extrabold text-white font-display tracking-tight">Full Search Query Reconnaissance</h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-black/40 text-[10px] font-black uppercase tracking-widest-label text-slate-600 border-b border-white/5">
                            <th className="px-10 py-6">Search Query</th>
                            <th className="px-10 py-6">Intent Mapping</th>
                            <th className="px-10 py-6 text-right">Difficulty (KD)</th>
                            <th className="px-10 py-6 text-right">Est. Volume</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {target.organicIntel.topKeywords.map((kw, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] group transition-all">
                               <td className="px-10 py-6">
                                  <p className="font-bold text-slate-100 text-sm group-hover:text-violet-400 transition-colors">{kw.keyword}</p>
                               </td>
                               <td className="px-10 py-6">
                                  <IntentBadge intent={kw.intent} />
                                </td>
                               <td className="px-10 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                     <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
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
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Est. PPC Value</p>
                <p className="text-2xl font-black text-cyan-400 font-display">{target.organicIntel?.competitiveIntelligence?.estimatedPpcValue || '$0'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-violet-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Content Velocity</p>
                <p className="text-2xl font-black text-violet-400 font-display">{target.organicIntel?.competitiveIntelligence?.contentVelocity || 'Low'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-rose-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Keyword Overlap</p>
                <p className="text-2xl font-black text-rose-400 font-display">{target.organicIntel?.competitiveIntelligence?.keywordOverlap?.shared || '0'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-emerald-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Market Position</p>
                <p className="text-2xl font-black text-emerald-400 font-display">{target.organicIntel?.competitiveIntelligence?.marketPosition || 'N/A'}</p>
              </div>
            </div>

            <div className="glass-panel rounded-[40px] p-10 border-rose-500/10">
              <h3 className="text-[11px] font-black mb-10 text-rose-400 uppercase tracking-widest-label flex items-center gap-3">
                Strategic Competitive Gaps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {target.organicIntel?.competitiveIntelligence?.strategicGaps?.map((gap, i) => (
                  <StrategicGapCard key={i} gap={gap} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black mb-10 text-indigo-400 uppercase tracking-widest-label flex items-center gap-3">
                    Tactical Recommendations
                  </h3>
                  <div className="space-y-5">
                    {target.organicIntel?.competitiveIntelligence?.tacticalRecommendations?.map((tact, i) => (
                      <div key={i} className="flex gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500 font-black text-xs">0{i+1}</div>
                        <p className="text-sm text-slate-300 font-bold leading-relaxed">{tact}</p>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label">Feature Overlay Matrix</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#ffffff08" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                        <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                        <Radar name="Competitor" dataKey="competitor" stroke="#fb7185" fill="#fb7185" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '16px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'onpage' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass-panel rounded-[40px] p-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Duplicate Titles</p>
                  <p className="text-4xl font-black text-white">{target.onPage.duplicateTitles}</p>
               </div>
               <div className="glass-panel rounded-[40px] p-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Missing Meta Desc</p>
                  <p className="text-4xl font-black text-amber-500">{target.onPage.missingMetaDescriptions}</p>
               </div>
               <div className="glass-panel rounded-[40px] p-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">H1 Optimization</p>
                  <p className="text-4xl font-black text-emerald-500">{target.onPage.h1OptimizationScore}%</p>
               </div>
            </div>

            <div className="glass-panel rounded-[40px] p-10">
              <h3 className="text-[11px] font-black mb-10 text-rose-400 uppercase tracking-widest-label">On-Page Actionable Remediation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {target.onPage.actionableSuggestions.map((sug, i) => (
                  <div key={i} className="flex gap-5 p-6 bg-black/40 border border-white/5 rounded-3xl">
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
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label">Authority Signal Diagnostics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <MetricCard title="Domain Authority" value={target.authority?.domainAuthority || 0} color="indigo" />
                <MetricCard title="Referring Domains" value={target.authority?.referringDomains || 0} color="cyan" />
                <MetricCard title="Toxic Link Warnings" value={target.authority?.toxicLinks || 0} color="rose" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest-label mb-6">Highest Value Source Domains</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {target.authority?.topReferringDomains?.map((domain, i) => (
                        <div key={i} className="p-5 bg-black/40 border border-white/10 rounded-2xl text-[12px] font-bold text-indigo-400">
                          {domain}
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest-label mb-6">Priority Acquisition Gaps</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {target.authority?.highValueTargetLinks?.map((domain, i) => (
                        <div key={i} className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-[12px] font-bold text-rose-300 flex items-center justify-between">
                           <span>{domain}</span>
                           <span className="text-[8px] font-black bg-rose-500/20 px-2 py-1 rounded-full uppercase">High Impact</span>
                        </div>
                      ))}
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
                <h3 className="text-4xl font-extrabold mb-5 font-display tracking-tighter text-white">Full Offensive Content Roadmap</h3>
                <p className="text-slate-500 mb-12 text-lg max-w-lg mx-auto">Generate a 10-post, 30-day "Cluster and Conquer" strike plan to dominate the SERPs.</p>
                <button onClick={handleGenerateBlogPlan} className="btn-primary text-white font-black py-5 px-12 rounded-2xl transition-all uppercase text-xs tracking-widest-label">Synthesize Full Strategy</button>
              </div>
            )}
            {isGeneratingContent && (
              <div className="p-32 text-center">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-white font-black text-sm uppercase tracking-widest-label">Calculating Cluster Logic & Topic Gaps...</p>
              </div>
            )}
            {contentPlan && <BlogContentPlanView plan={contentPlan} />}
          </div>
        )}
      </div>
      
      <VirtualAssistant auditResult={result} />
    </div>
  );
};

const LighthouseGauge: React.FC<{ label: string, value: number }> = ({ label, value }) => {
  const color = value >= 90 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-6 group">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
          <circle 
            cx="56" cy="56" r="50" 
            stroke={color} 
            strokeWidth="8" 
            fill="transparent" 
            strokeDasharray="314.159" 
            strokeDashoffset={314.159 - (314.159 * value) / 100} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black font-display" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{label}</span>
    </div>
  );
};

const VitalsMetric: React.FC<{ label: string, value: string, threshold: string, description: string }> = ({ label, value, threshold, description }) => (
  <div className="space-y-2 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <span className="text-xs font-mono font-bold text-slate-500">Target &lt;{threshold}</span>
    </div>
    <p className="text-2xl font-black font-display text-white">{value}</p>
    <p className="text-[10px] text-slate-600 font-bold">{description}</p>
  </div>
);

const IntentBadge: React.FC<{ intent: string }> = ({ intent }) => {
   const lower = intent.toLowerCase();
   let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
   if (lower.includes('trans')) styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
   else if (lower.includes('comm')) styles = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
   else if (lower.includes('info')) styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
   return <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest-label border ${styles}`}>{intent}</span>;
};

const StrategicGapCard: React.FC<{ gap: StrategicGap }> = ({ gap }) => (
  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
    <div className="flex justify-between items-center mb-4">
      <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase text-slate-500 border border-white/5 tracking-widest-label">{gap.category}</span>
      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest-label border ${gap.impact === 'High' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 'text-amber-400 border-amber-500/20 bg-amber-500/5'}`}>{gap.impact} Impact</span>
    </div>
    <p className="text-sm font-bold text-white mb-3">{gap.description}</p>
    <div className="mt-4 pt-4 border-t border-white/5">
      <p className="text-[9px] font-black text-rose-500 uppercase mb-2 tracking-widest-label">Remedy Roadmap</p>
      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{gap.remedy}</p>
    </div>
  </div>
);

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-4 rounded-2xl border border-transparent ${highlight ? 'bg-violet-500/5 border-violet-500/10' : 'hover:bg-white/5'}`}>
    <span className="text-xs font-bold text-slate-500">{label}</span>
    <span className={`text-[11px] font-black uppercase tracking-widest-label ${highlight ? 'text-violet-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
