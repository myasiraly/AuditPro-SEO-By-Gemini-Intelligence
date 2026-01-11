
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
            <span className="px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-widest-label border border-violet-500/20">V25.0 Master Research</span>
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
              <h3 className="text-[11px] font-black mb-12 text-slate-500 uppercase tracking-widest-label">Expert-Grade Core Web Vitals</h3>
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
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Technical Debt Ledger</h3>
                  <div className="space-y-6">
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
                <div className="glass-panel rounded-[40px] p-10 bg-indigo-500/[0.02] border-indigo-500/10">
                   <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest-label mb-10">Rendering Analysis</h3>
                   <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                     "{target.technical.renderingStrategyInsight}"
                   </p>
                   <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                      <VitalRow label="Server Protocol" value={target.technical.serverProtocol} />
                      <VitalRow label="Caching Layer" value={target.technical.cachingStatus} />
                      <VitalRow label="Compression" value={target.technical.compressionType} />
                   </div>
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
                    Deep Research Intelligence
                  </h3>
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[9px] font-black uppercase tracking-widest-label">
                    Research accuracy verified V25.0
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
                <MetricCard title="Information Gain" value={target.onPage.informationGainScore} subtitle="Semantic Differentiation" color="teal" />
                <MetricCard title="Readability" value={target.content.readabilityGrade} subtitle="Structural Tone" color="violet" />
                <MetricCard title="Entity Depth" value={target.onPage.entityCount} subtitle="NLP Entity Count" color="cyan" />
                <MetricCard title="Word Count" value={target.content.avgWordCount} subtitle="Avg. Pillar Length" color="indigo" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel rounded-[40px] p-10">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Deep Semantic Mapping</h3>
                  <div className="space-y-8">
                    {target.onPage.semanticMapInsights.map((map, i) => (
                      <div key={i} className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{map.topic}</h4>
                          <span className="text-[10px] font-black text-violet-400">{map.coverage}% Match</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-violet-600 h-full" style={{ width: `${map.coverage}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Strategic Gap: <span className="text-cyan-400">{map.gapImportance}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-panel rounded-[40px] p-10 bg-white/[0.01]">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Detailed On-Page Findings</h3>
                   <div className="space-y-4">
                      {target.onPage.findings.map((f, i) => (
                        <div key={i} className="p-5 border border-white/5 bg-black/40 rounded-3xl group">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{f.category}</span>
                              <OnPageStatusBadge status={f.status as any} />
                           </div>
                           <h5 className="text-xs font-bold text-white mb-2">{f.label}</h5>
                           <p className="text-[11px] text-slate-500 leading-relaxed">{f.description}</p>
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
              <MetricCard title="Ref. Domains" value={target.authority.referringDomains.toLocaleString()} subtitle="Unique Root Sources" color="indigo" />
              <MetricCard title="Referring IPs" value={target.authority.referringIps.toLocaleString()} subtitle="C-Class Variety" color="teal" />
              <MetricCard title="Trust Flow" value={`${target.authority.linkQualityScore}%`} subtitle="Auth Heuristic" color="violet" />
              <MetricCard title="Equity Control" value={`${target.authority.followRatio}%`} subtitle="Dofollow Ratio" color="cyan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10 flex items-center gap-2">
                  <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                  Authority Growth Momentum
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={target.authority.linkGrowthTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="date" stroke="#475569" fontSize={8} />
                        <YAxis stroke="#475569" fontSize={8} />
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-[40px] p-10 bg-rose-500/[0.02] border-rose-500/10">
                 <h3 className="text-[11px] font-black text-rose-400 uppercase tracking-widest-label mb-10">Toxic Risk Assessment</h3>
                 <div className="flex flex-col items-center justify-center h-48 relative">
                    <div className="text-5xl font-black text-white font-display">{(target.authority.toxicLinkProbability * 100).toFixed(1)}%</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Probability of Penalty</div>
                    <div className="w-full bg-white/5 h-2 rounded-full mt-8 overflow-hidden">
                       <div className="bg-rose-500 h-full" style={{ width: `${target.authority.toxicLinkProbability * 100}%` }}></div>
                    </div>
                 </div>
                 <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flagged Links</span>
                      <span className="text-xs font-black text-rose-400">{target.authority.toxicLinks} Nodes</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      Heuristic scan detected low-quality neighborhood footprints. Manual disavow of top {target.authority.toxicLinks} sources recommended.
                    </p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass-panel rounded-[40px] p-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Anchor Text Integrity</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={target.authority.anchorTextProfile} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="label" type="category" stroke="#475569" fontSize={9} width={80} fontWeight={700} />
                         <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none' }} />
                         <Bar dataKey="percentage" fill="#6366f1" radius={[0, 8, 8, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Link Tiers (TLD)</h3>
                 <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={target.authority.tldDistribution} dataKey="percentage" nameKey="tld" innerRadius={60} outerRadius={85} paddingAngle={8} stroke="none">
                           {target.authority.tldDistribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="glass-panel rounded-[40px] p-10">
                 <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label mb-10">Target Outreach Nodes</h3>
                 <div className="space-y-4">
                    {(target.authority.highValueTargetLinks || []).map((site, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-violet-500/30 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-500 text-[10px] font-black border border-violet-500/20">S</div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{site}</p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">High Potential</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-700 group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </div>
                    ))}
                    {(!target.authority.highValueTargetLinks || target.authority.highValueTargetLinks.length === 0) && (
                      <div className="text-center py-10 text-slate-600 text-[10px] font-black uppercase tracking-widest">No outreach targets identified.</div>
                    )}
                 </div>
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
                <h3 className="text-4xl font-extrabold mb-5 font-display tracking-tighter text-white uppercase">Master Strike Roadmap</h3>
                <p className="text-slate-500 mb-12 text-lg max-w-lg mx-auto">Model a consecutive 30-day offensive plan targeting high-fidelity semantic clusters.</p>
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

// ... Status Badge Helpers ...
const OnPageStatusBadge: React.FC<{ status: 'Pass' | 'Warning' | 'Critical' }> = ({ status }) => {
  const styles = {
    Pass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest-label border ${styles[status]}`}>{status}</span>;
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
