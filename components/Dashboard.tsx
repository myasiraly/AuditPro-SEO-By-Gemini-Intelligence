
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
  const CHART_COLORS = ['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#fb7185'];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-widest-label border border-violet-500/20">V24.0 Master Domination</span>
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
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="glass-panel rounded-[40px] p-12">
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label">Real-World PageSpeed Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <LighthouseGauge label="Performance" value={target.lighthouse.performance} />
                <LighthouseGauge label="Accessibility" value={target.lighthouse.accessibility} />
                <LighthouseGauge label="Best Practices" value={target.lighthouse.bestPractices} />
                <LighthouseGauge label="SEO Integrity" value={target.lighthouse.seo} />
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
             
             <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Technical Debt Ledger</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {target.technical.technicalDebtLedger.map((debt, i) => (
                    <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-violet-500/20 transition-all group">
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{debt.issue}</h4>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase">{debt.impact} Impact</span>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{debt.recommendation}</p>
                       <div className="flex justify-between items-center pt-4 border-t border-white/5">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Effort Score</span>
                          <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{debt.effort}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="glass-panel rounded-[40px] p-10 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-violet-600 rounded-full"></span>
                    Deep Keyword Intelligence
                  </h3>
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[9px] font-black uppercase tracking-widest-label">
                    Research accuracy verified V24.0
                  </div>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-4 px-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Keyword Node</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Volume</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Difficulty</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Conversion</th>
                        <th className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Trend</th>
                        <th className="text-right py-4 px-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Research Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {target.organicIntel.topKeywords.map((kw, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="py-6 px-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{kw.keyword}</span>
                              <div className="flex gap-2">
                                <IntentBadge intent={kw.intent} />
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest-label">{kw.cpc} CPC</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 text-center text-[10px] font-black text-slate-400">{kw.volume}</td>
                          <td className="py-6 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={`text-[10px] font-black ${kw.difficulty > 70 ? 'text-rose-400' : kw.difficulty > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{kw.difficulty}</span>
                              <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`${kw.difficulty > 70 ? 'bg-rose-500' : kw.difficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'} h-full`} style={{ width: `${kw.difficulty}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 text-center">
                             <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[10px] font-black text-cyan-400">{kw.conversionPotential}%</span>
                                <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                                   <div className="bg-cyan-500 h-full" style={{ width: `${kw.conversionPotential}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="py-6 text-center">
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest-label border ${
                               kw.trendingStatus === 'Rising' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                               kw.trendingStatus === 'Declining' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                               'bg-slate-500/10 text-slate-400 border-slate-500/20'
                             }`}>
                               {kw.trendingStatus}
                             </span>
                          </td>
                          <td className="py-6 text-right px-2">
                             <p className="text-[10px] text-slate-500 italic max-w-[200px] ml-auto leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                               {kw.competitiveAnalysis}
                             </p>
                          </td>
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
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Entity Depth" value={target.onPage.entityCount} subtitle="NLP Disambiguation" color="teal" />
                <MetricCard title="Readability" value={target.content.readabilityGrade} subtitle="Structural Tone" color="violet" />
                <MetricCard title="Content/Code" value={target.content.contentToCodeRatio} subtitle="Semantic Density" color="cyan" />
                <MetricCard title="Word Count" value={target.content.avgWordCount} subtitle="Avg. Strategic Length" color="indigo" />
             </div>

             <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Semantic Map Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {target.onPage.semanticMapInsights.map((map, i) => (
                    <div key={i} className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                       <h4 className="text-sm font-black text-white uppercase tracking-tight">{map.topic}</h4>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Authority Coverage</span>
                             <span className="text-[10px] font-black text-violet-400">{map.coverage}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-violet-600 h-full" style={{ width: `${map.coverage}%` }}></div>
                          </div>
                       </div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Gap Importance: <span className="text-cyan-400">{map.gapImportance}</span></p>
                    </div>
                  ))}
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
          </div>
        )}

        {activeTab === 'swot' && (
          <div className="space-y-12">
            <div className="text-center mb-10">
               <h3 className="text-3xl font-black text-white font-display uppercase tracking-widest-label mb-2">{swot.roadmapTitle}</h3>
               <div className="w-24 h-1 bg-violet-600 mx-auto rounded-full"></div>
            </div>
            <SWOTAnalysisView swot={swot} />
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            {!contentPlan && !isGeneratingContent && (
              <div className="glass-panel rounded-[50px] p-24 text-center">
                <h3 className="text-4xl font-extrabold mb-5 font-display tracking-tighter text-white uppercase">Master Strike Roadmap</h3>
                <p className="text-slate-500 mb-12 text-lg max-w-lg mx-auto">Model a consecutive 30-day offensive plan targeting high-fidelity semantic clusters (1,800+ words per asset).</p>
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

// ... Sub-components remain the same ...
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

const IntentBadge: React.FC<{ intent: string }> = ({ intent }) => {
   const lower = intent.toLowerCase();
   let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
   if (lower.includes('trans')) styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
   else if (lower.includes('comm')) styles = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
   else if (lower.includes('info')) styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
   return <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest-label border ${styles}`}>{intent}</span>;
};

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-4 rounded-2xl border border-transparent ${highlight ? 'bg-violet-500/5 border-violet-500/10' : 'hover:bg-white/5'}`}>
    <span className="text-xs font-bold text-slate-500">{label}</span>
    <span className={`text-[11px] font-black uppercase tracking-widest-label ${highlight ? 'text-violet-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
