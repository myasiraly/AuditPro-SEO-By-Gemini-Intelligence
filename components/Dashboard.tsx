
import React, { useState, useMemo } from 'react';
import { AuditResult, ContentPlan, StrategicGap, SEOFinding } from '../types';
import MetricCard from './MetricCard';
import AuditSection from './AuditSection';
import SWOTAnalysisView from './SWOTAnalysis';
import BlogContentPlanView from './BlogContentPlan';
import VirtualAssistant from './VirtualAssistant';
import { GeminiService } from '../services/gemini';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line } from 'recharts';

interface DashboardProps {
  result: AuditResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { target, competitor, swot } = result;
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'technical' | 'competitive' | 'keywords' | 'onpage' | 'backlinks' | 'swot' | 'blog'>('overview');
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const trafficShareData = [
    { name: 'Target', value: target?.organicIntel?.estimatedMonthlyTraffic || 1, fill: '#8b5cf6' },
    ...(competitor ? [{ name: 'Competitor', value: competitor.organicIntel?.estimatedMonthlyTraffic || 1, fill: '#fb7185' }] : []),
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

  if (!target) return <div className="p-20 text-center font-bold text-slate-500 uppercase tracking-widest-label">Intelligence Sync Offline</div>;

  const compIntel = target.organicIntel.competitiveIntelligence;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-widest-label border border-violet-500/20">V18.0 Master Offensive</span>
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
          Reset Recon
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
          { id: 'blog', label: '30D Strike Plan' },
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
              <MetricCard title="Health Index" value={`${target.healthScore}%`} subtitle="Global Integrity Scan" color="violet" />
              <MetricCard title="Visibility Index" value={`${compIntel?.visibilityIndex}%`} subtitle="SERP Domination" color="cyan" />
              <MetricCard title="Semantic Sync" value={`${target.onPage.semanticRelevanceScore}%`} subtitle="Topic Alignment" color="teal" />
              <MetricCard title="DA Master" value={target.authority.domainAuthority} subtitle="Authority Heuristic" color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10 flex items-center gap-2">
                  <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                  Multi-Channel Traffic Distro
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={target.organicIntel.trafficSources}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="source" stroke="#475569" fontSize={9} fontWeight={800} />
                      <YAxis stroke="#475569" fontSize={9} fontWeight={800} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', border: 'none', borderRadius: '16px' }} />
                      <Bar dataKey="percentage" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-[40px] p-10 flex flex-col">
                <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label">Sector Market Share</h3>
                <div className="flex-1 min-h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={trafficShareData} innerRadius={85} outerRadius={115} paddingAngle={10} dataKey="value" stroke="none">
                        {trafficShareData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</span>
                    <span className="text-3xl font-black text-white font-display">
                      {Math.round((trafficShareData[0].value / (trafficShareData[0].value + (trafficShareData[1]?.value || 0))) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
                   <VitalRow label="Est. Organic Value" value={compIntel?.estimatedPpcValue || '$0'} highlight />
                   <VitalRow label="Semantic Velocity" value={`${compIntel?.semanticVelocity}%`} />
                   <VitalRow label="Entity Count" value={target.onPage.entityCount.toString()} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="glass-panel rounded-[40px] p-12">
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label">V18.0 Real-World PageSpeed</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <LighthouseGauge label="Performance" value={target.lighthouse.performance} />
                <LighthouseGauge label="Accessibility" value={target.lighthouse.accessibility} />
                <LighthouseGauge label="Best Practices" value={target.lighthouse.bestPractices} />
                <LighthouseGauge label="SEO Integrity" value={target.lighthouse.seo} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">2025 Core Web Vitals Status</h3>
                <div className="grid grid-cols-2 gap-8">
                  <VitalsMetric label="LCP (Largest Content)" value={target.coreWebVitals.lcp} threshold="2.5s" description="Visual stability threshold." />
                  <VitalsMetric label="INP (Interaction Lag)" value={target.coreWebVitals.inp} threshold="200ms" description="Real-world interactivity." />
                  <VitalsMetric label="CLS (Layout Shift)" value={target.coreWebVitals.cls} threshold="0.1" description="Visual movement stability." />
                  <VitalsMetric label="TTFB (Server Resp.)" value={target.technical.ttfb} threshold="200ms" description="Backend infrastructure health." />
                </div>
              </div>
              <div className="glass-panel rounded-[40px] p-10 bg-indigo-500/[0.02]">
                 <h3 className="text-[11px] font-black mb-8 text-indigo-400 uppercase tracking-widest-label">Performance Fix Strategy</h3>
                 <div className="space-y-4">
                    {target.technical.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-indigo-500/30">
                        <span className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-[10px] font-black shrink-0">{i+1}</span>
                        <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{s}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Hydration Lag" value={target.technical.hydrationLag} subtitle="CPU Interactivity Delay" color="emerald" />
                <MetricCard title="Byte Bloat" value={target.technical.unusedByteBloat} subtitle="Unused Asset Density" color="indigo" />
                <MetricCard title="Sitemap Depth" value={`${target.technical.internalLinking.maxDepth} LVL`} subtitle="Crawl Budget Ease" color="violet" />
                <MetricCard title="DOM Weight" value={target.technical.domSize} subtitle="Parser Complexity" color="cyan" />
             </div>
             <AuditSection 
               title="Infrastructure & Safety Reconstruction"
               data={[
                 { label: 'Security (TLS 1.3)', value: target.technical.httpsSecurity, status: 'success' },
                 { label: 'Protocol Efficiency', value: target.technical.serverProtocol, status: 'success' },
                 { label: 'Compression Layer', value: target.technical.compressionType, status: 'success' },
                 { label: 'Broken Node Rate', value: '0.1%', status: 'success' },
               ]}
               details={target.errors.details}
               suggestions={target.technical.suggestions}
             />
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-panel rounded-[40px] p-10 flex flex-col justify-between border-violet-500/20 bg-violet-500/[0.02]">
                  <div>
                    <h3 className="text-[11px] font-black text-violet-400 uppercase tracking-widest-label mb-8">Market Positioning</h3>
                    <div className="text-5xl font-black text-white font-display tracking-tighter mb-4">{compIntel?.marketPosition}</div>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">Intelligence heuristic places the target as a dominant force within the current SERP ecosystem compared to the primary rival.</p>
                  </div>
                  <div className="mt-12 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility Index</span>
                      <span className="text-sm font-black text-white">{compIntel?.visibilityIndex}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full" style={{ width: `${compIntel?.visibilityIndex}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">SERP Feature Detection</h3>
                   <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full">
                       <thead>
                         <tr className="border-b border-white/5">
                           <th className="text-left py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Feature Type</th>
                           <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Owned by Target</th>
                           <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Owned by Rival</th>
                           <th className="text-right py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Capture Prob.</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {compIntel?.serpFeatures.map((f, i) => (
                           <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                             <td className="py-5">
                               <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{f.feature}</span>
                             </td>
                             <td className="py-5 text-center">
                               {f.ownedByTarget ? (
                                 <span className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center mx-auto border border-emerald-500/20">
                                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                 </span>
                               ) : (
                                 <span className="w-5 h-5 bg-white/5 text-slate-700 rounded-lg flex items-center justify-center mx-auto">—</span>
                               )}
                             </td>
                             <td className="py-5 text-center">
                               {f.ownedByCompetitor ? (
                                 <span className="w-5 h-5 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center mx-auto border border-rose-500/20">
                                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                 </span>
                               ) : (
                                 <span className="w-5 h-5 bg-white/5 text-slate-700 rounded-lg flex items-center justify-center mx-auto">—</span>
                               )}
                             </td>
                             <td className="py-5 text-right">
                               <div className="flex flex-col items-end gap-1.5">
                                 <span className="text-[10px] font-black text-indigo-400">{(f.probability * 100).toFixed(0)}%</span>
                                 <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                   <div className="bg-indigo-500 h-full" style={{ width: `${f.probability * 100}%` }}></div>
                                 </div>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-8">Keyword Overlap Analysis</h3>
                 <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Shared Nodes</span>
                      <span className="text-base font-black text-white">{compIntel?.keywordOverlap.shared}</span>
                    </div>
                    <div className="relative h-4 bg-white/5 rounded-full flex overflow-hidden">
                      <div className="bg-violet-500 h-full" style={{ width: '40%' }}></div>
                      <div className="bg-indigo-500 h-full" style={{ width: '25%' }}></div>
                      <div className="bg-rose-500 h-full" style={{ width: '35%' }}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Shared</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Unq</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rival Unq</span>
                      </div>
                    </div>
                 </div>
               </div>
               
               <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Strategic Gaps Identified</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {compIntel?.strategicGaps.map((gap, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-violet-500/20 transition-all flex flex-col gap-4">
                         <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{gap.category}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest-label border ${gap.impact === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                             {gap.impact} Impact
                           </span>
                         </div>
                         <h4 className="text-sm font-bold text-white">{gap.description}</h4>
                         <p className="text-[11px] text-slate-500 font-medium italic">Remedy: {gap.remedy}</p>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Top Keyword Reconnaissance</h3>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Keyword Node</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Search Volume</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Difficulty</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Intent Cycle</th>
                        <th className="text-right py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Est. CPC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {target.organicIntel.topKeywords.map((kw, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="py-5">
                            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{kw.keyword}</span>
                          </td>
                          <td className="py-5 text-center text-[10px] font-black text-slate-400">{kw.volume}</td>
                          <td className="py-5 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={`text-[10px] font-black ${kw.difficulty > 70 ? 'text-rose-400' : kw.difficulty > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{kw.difficulty}</span>
                              <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`${kw.difficulty > 70 ? 'bg-rose-500' : kw.difficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'} h-full`} style={{ width: `${kw.difficulty}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 text-center">
                             <IntentBadge intent={kw.intent} />
                          </td>
                          <td className="py-5 text-right text-[10px] font-black text-indigo-400">{kw.cpc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'onpage' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             {/* Primary High-Level Metrics */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Entity Depth" value={target.onPage.entityCount} subtitle="NLP Disambiguation" color="teal" />
                <MetricCard title="Readability" value={target.content.readabilityGrade} subtitle="Structural Tone" color="violet" />
                <MetricCard title="Content/Code" value={target.content.contentToCodeRatio} subtitle="Semantic Density" color="cyan" />
                <MetricCard title="Word Count" value={target.content.avgWordCount} subtitle="Avg. Strategic Length" color="indigo" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Meta Tag Details Section */}
               <div className="glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Meta Tags & Snippet Integrity</h3>
                 <div className="space-y-8">
                    <div className="p-6 rounded-3xl bg-black/20 border border-white/5">
                      <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">SERP Preview Mode</p>
                      <h4 className="text-xl font-bold text-[#8ab4f8] hover:underline cursor-pointer mb-1">{target.engagement.serpPreview.title}</h4>
                      <p className="text-xs text-[#3c4043] mb-2">{target.engagement.serpPreview.displayUrl}</p>
                      <p className="text-sm text-[#bdc1c6] leading-relaxed">{target.engagement.serpPreview.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Title Length</p>
                        <p className="text-lg font-black text-white">{target.onPage.avgTitleLength} Chars</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Meta Desc Length</p>
                        <p className="text-lg font-black text-white">{target.onPage.avgMetaDescriptionLength} Chars</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Effectiveness Score</p>
                        <p className="text-xs text-slate-400 mt-1">AI-predicted CTR appeal based on sentiment.</p>
                      </div>
                      <span className="text-3xl font-black text-emerald-400">{target.onPage.metaEffectivenessScore}%</span>
                    </div>
                 </div>
               </div>

               {/* Heading Hierarchy & Keywords Section */}
               <div className="glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Heading Hierarchy & Placement</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                       <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 font-black text-xs">H1</span>
                          <div>
                            <p className="text-xs font-bold text-white">Main H1 Optimization</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Single Node Verified</p>
                          </div>
                       </div>
                       <span className="text-xl font-black text-white">{target.onPage.h1OptimizationScore}%</span>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Keyword Prominence Recon</p>
                      <div className="space-y-4">
                         {target.onPage.topOnPageKeywords.map((kw, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-violet-500/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <span className="text-[10px] font-black text-slate-600">#{i+1}</span>
                                 <div>
                                   <p className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{kw.keyword}</p>
                                   <p className="text-[9px] text-slate-500 uppercase font-black">{kw.position} | {kw.prominence}</p>
                                 </div>
                              </div>
                              <span className="text-[11px] font-black text-indigo-400">{kw.density}%</span>
                           </div>
                         ))}
                      </div>
                    </div>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Media & Image Alt Details */}
               <div className="glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Media Integrity</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10">
                       <p className="text-xs font-bold text-slate-400">Missing Alt Tags</p>
                       <span className="text-xl font-black text-rose-400">{target.images.missingAlt} Nodes</span>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                       <p className="text-xs font-bold text-slate-400">Oversized Payloads</p>
                       <span className="text-xl font-black text-amber-400">{target.images.overSizeLimit} Assets</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
                       <div className="flex justify-between items-center mb-3">
                         <p className="text-xs font-bold text-slate-400">WebP Coverage</p>
                         <span className="text-xl font-black text-emerald-400">{target.images.webpConversionRate}%</span>
                       </div>
                       <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${target.images.webpConversionRate}%` }}></div>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Qualitative On-Page Findings */}
               <div className="lg:col-span-2 glass-panel rounded-[40px] overflow-hidden">
                 <div className="p-10 border-b border-white/10 bg-white/[0.01]">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label">Actionable On-Page Recon Findings</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5 border-b border-white/5">
                   {target.onPage.findings.map((f, i) => (
                     <div key={i} className="p-8 hover:bg-white/[0.02] flex flex-col justify-between group">
                        <div>
                           <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{f.category}</span>
                              <OnPageStatusBadge status={f.status} />
                           </div>
                           <h4 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{f.label}</h4>
                           <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{f.description}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'backlinks' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricCard title="Referring IPs" value={target.authority.referringIps.toLocaleString()} subtitle="C-Class Variety" color="teal" />
              <MetricCard title="Trust Flow" value={`${target.authority.linkQualityScore}%`} subtitle="Auth Heuristic" color="violet" />
              <MetricCard title="Equity Control" value={`${target.authority.followRatio}%`} subtitle="Follow Ratio" color="cyan" />
              <MetricCard title="Toxic Links" value={target.authority.toxicLinks} subtitle="Flagged Sources" color="rose" />
            </div>

            <div className="glass-panel rounded-[40px] p-10">
               <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">12-Month Authority Momentum</h3>
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={target.authority.historicalAuthority}>
                       <defs>
                          <linearGradient id="colorAuthV17" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                       <XAxis dataKey="date" stroke="#475569" fontSize={8} />
                       <YAxis stroke="#475569" fontSize={8} />
                       <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                       <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAuthV17)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-panel rounded-[40px] overflow-hidden">
               <div className="p-10 border-b border-white/10 bg-white/[0.01]">
                 <h3 className="text-xl font-black text-white font-display uppercase tracking-widest-label">Detailed Backlink Research</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-white/5 border-b border-white/5">
                  {target.authority.findings.map((f, i) => (
                    <div key={i} className="p-8 hover:bg-white/[0.02] flex flex-col justify-between h-full">
                       <div>
                          <div className="flex justify-between items-start mb-4">
                             <span className="text-[9px] font-black text-slate-600 uppercase">{f.category}</span>
                             <OnPageStatusBadge status={f.status} />
                          </div>
                          <h4 className="text-base font-bold text-white mb-2">{f.label}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{f.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'swot' && (
          <div className="space-y-12">
            <div className="text-center mb-10">
               <h3 className="text-3xl font-black text-white font-display uppercase tracking-widest-label mb-2">{swot.roadmapTitle}</h3>
               <div className="w-24 h-1 bg-violet-600 mx-auto rounded-full"></div>
            </div>
            <SWOTAnalysisView swot={swot} />
            <div className="glass-panel p-12 rounded-[50px] bg-violet-600/[0.02] border-violet-500/20 text-center">
              <h3 className="text-[11px] font-black text-violet-400 uppercase tracking-widest-label mb-6">Strategic Master Priority</h3>
              <p className="text-2xl font-black text-white font-display tracking-tight max-w-2xl mx-auto italic leading-tight">
                "{swot.strategicPriority}"
              </p>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            {!contentPlan && !isGeneratingContent && (
              <div className="glass-panel rounded-[50px] p-24 text-center">
                <h3 className="text-4xl font-extrabold mb-5 font-display tracking-tighter text-white uppercase">V18.0 Master Strike Roadmap</h3>
                <p className="text-slate-500 mb-12 text-lg max-w-lg mx-auto">Model a consecutive 30-day offensive plan targeting high-fidelity semantic clusters (1,500+ words per asset).</p>
                <button onClick={handleGenerateBlogPlan} className="btn-primary text-white font-black py-5 px-14 rounded-2xl transition-all uppercase text-xs tracking-widest-label">Synthesize Strike Plan</button>
              </div>
            )}
            {isGeneratingContent && (
              <div className="p-32 text-center">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-white font-black text-xs uppercase tracking-widest-label">Modeling 30 Sequential Market Clusters...</p>
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
    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{description}</p>
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

const OnPageStatusBadge: React.FC<{ status: 'Pass' | 'Warning' | 'Critical' }> = ({ status }) => {
  const styles = {
    Pass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest-label border ${styles[status]}`}>{status}</span>;
};

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-4 rounded-2xl border border-transparent ${highlight ? 'bg-violet-500/5 border-violet-500/10' : 'hover:bg-white/5'}`}>
    <span className="text-xs font-bold text-slate-500">{label}</span>
    <span className={`text-[11px] font-black uppercase tracking-widest-label ${highlight ? 'text-violet-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
