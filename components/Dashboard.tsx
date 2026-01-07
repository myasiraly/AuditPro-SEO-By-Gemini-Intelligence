
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
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Common Keywords</p>
                <p className="text-2xl font-black text-rose-400 font-display">{competitor?.organicIntel?.competitiveIntelligence?.keywordOverlap?.shared || '0'}</p>
              </div>
              <div className="p-8 glass-panel rounded-3xl border-emerald-500/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Market Position</p>
                <p className="text-2xl font-black text-emerald-400 font-display">{competitor?.organicIntel?.competitiveIntelligence?.marketPosition || 'N/A'}</p>
              </div>
            </div>

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
                       <th className="px-8 py-5">Keyword</th>
                       <th className="px-8 py-5">Rival Rank</th>
                       <th className="px-8 py-5">Target Rank</th>
                       <th className="px-8 py-5">Opportunity Score</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {competitor?.organicIntel?.competitiveIntelligence?.keywordGaps?.map((gap, i) => (
                       <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-8 py-6 font-bold text-slate-200">{gap.keyword}</td>
                         <td className="px-8 py-6"><span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-black">#{gap.competitorRank}</span></td>
                         <td className="px-8 py-6 text-slate-500 text-xs font-bold">{gap.targetRank}</td>
                         <td className="px-8 py-6"><span className="text-[10px] font-black text-cyan-400">{gap.opportunityScore}%</span></td>
                       </tr>
                     )) || <tr><td colSpan={4} className="p-10 text-center text-slate-600 font-bold uppercase tracking-widest">No Gap Data Identified</td></tr>}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="animate-in fade-in duration-500">
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
          </div>
        )}

        {activeTab === 'onpage' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Detailed On-Page Performance Comparison */}
                <div className="glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label flex items-center gap-3">
                    <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                    Metadata Optimization Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest-label">Avg. Title Tag Length</p>
                      <div className="flex items-end gap-4">
                        <span className={`text-4xl font-extrabold font-display ${target.onPage.avgTitleLength >= 50 && target.onPage.avgTitleLength <= 60 ? 'text-teal-400' : 'text-rose-400'}`}>
                          {target.onPage.avgTitleLength}
                        </span>
                        <span className="text-slate-500 text-xs font-bold pb-2">characters</span>
                      </div>
                      <p className="mt-4 text-[10px] font-bold text-slate-600 uppercase">Goal: 50-60 Characters</p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest-label">Meta Effectiveness Index</p>
                      <div className="flex items-end gap-4">
                        <span className="text-4xl font-extrabold font-display text-cyan-400">
                          {target.onPage.metaEffectivenessScore}%
                        </span>
                      </div>
                      <p className="mt-4 text-[10px] font-bold text-slate-600 uppercase">Avg. Length: {target.onPage.avgMetaDescriptionLength} chars</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest-label mb-4">Semantic Comparison (Target vs Rival)</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-violet-500/5 rounded-2xl border border-violet-500/10">
                           <p className="text-[9px] font-black text-violet-400 uppercase mb-2">Target H1 Optimization</p>
                           <p className="text-lg font-extrabold text-white font-display">{target.onPage.h1OptimizationScore}%</p>
                        </div>
                        <div className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                           <p className="text-[9px] font-black text-rose-400 uppercase mb-2">Rival H1 Optimization</p>
                           <p className="text-lg font-extrabold text-white font-display">{competitor?.onPage.h1OptimizationScore || '0'}%</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Top Semantic Keywords Analysis */}
                <div className="glass-panel rounded-[40px] p-10">
                   <h3 className="text-[11px] font-black mb-10 text-slate-500 uppercase tracking-widest-label">Top On-Page Keyword Analysis</h3>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead>
                         <tr className="text-[10px] font-black uppercase text-slate-600 border-b border-white/5">
                           <th className="pb-5 px-2">Keyword Cluster</th>
                           <th className="pb-5 px-2">Density</th>
                           <th className="pb-5 px-2">Prominence (Placement)</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {target.onPage.topOnPageKeywords?.map((kw, i) => (
                           <tr key={i} className="group hover:bg-white/[0.02]">
                             <td className="py-5 px-2 text-sm font-bold text-slate-200">{kw.keyword}</td>
                             <td className="py-5 px-2 text-xs font-mono text-cyan-400">{kw.density}%</td>
                             <td className="py-5 px-2">
                                <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full uppercase text-slate-400 border border-white/5">
                                  {kw.prominence}
                                </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Actionable Suggestions */}
                <div className="glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black mb-10 text-rose-400 uppercase tracking-widest-label flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Critical On-Page Fixes
                  </h3>
                  <div className="space-y-4">
                    {target.onPage.actionableSuggestions.map((sug, i) => (
                      <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all flex gap-4">
                        <span className="text-rose-500 font-black text-xs">#0{i+1}</span>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{sug}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest-label">Global Health Impact</p>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${target.onPage.keywordOptimizationScore}%` }}></div>
                     </div>
                     <p className="text-right text-[10px] font-black text-violet-400">{target.onPage.keywordOptimizationScore}% Optimized</p>
                  </div>
                </div>
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

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-5 rounded-3xl border border-transparent transition-all ${highlight ? 'bg-violet-500/5 border-violet-500/10' : 'hover:bg-white/5'}`}>
    <span className="text-xs font-bold text-slate-500">{label}</span>
    <span className={`text-[11px] font-black uppercase tracking-widest-label ${highlight ? 'text-violet-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
