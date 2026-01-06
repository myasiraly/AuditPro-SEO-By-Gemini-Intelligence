
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
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'onpage' | 'backlinks' | 'swot' | 'blog'>('overview');
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
      ['Orphan Pages', target.technical.internalLinking.orphanPagesCount],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seo_audit_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const getCombinedTechnicalDetails = () => {
    const details = [...(target.errors?.details || [])];
    target.technical.brokenInternalLinks?.list.forEach(url => details.push(`Broken Internal (404): ${url}`));
    target.technical.brokenExternalLinks?.list.forEach(url => details.push(`Broken External (404): ${url}`));
    target.technical.internalLinking?.orphanPagesList.forEach(url => details.push(`Orphan Page: ${url}`));
    if (target.technical.mixedContentUrls?.length) {
      target.technical.mixedContentUrls.forEach(url => details.push(`Mixed Content Asset: ${url}`));
    }
    return details;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit for {new URL(target.url).hostname}</h2>
          <p className="text-slate-400">Competitive Analysis & Health Check</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button onClick={onReset} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors">
            New Audit
          </button>
        </div>
      </div>

      <nav className="flex space-x-2 border-b border-slate-800 overflow-x-auto custom-scrollbar pb-1">
        {['overview', 'technical', 'onpage', 'backlinks', 'swot', 'blog'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-all capitalize whitespace-nowrap ${
              activeTab === tab 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'blog' ? 'Blog Strategy' : tab}
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
                title="External 404s" 
                value={target.technical.brokenExternalLinks.count} 
                subtitle="Outbound Broken Links" 
                color={target.technical.brokenExternalLinks.count > 0 ? 'orange' : 'green'} 
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6 text-blue-400">Competitive Benchmark</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">Technical Vitals</h3>
            <div className="space-y-4">
               <VitalRow label="Mobile Friendly" value={target.technical.mobileFriendly ? 'Pass' : 'Fail'} highlight={target.technical.mobileFriendly} />
               <VitalRow label="Orphan Pages" value={target.technical.internalLinking.orphanPagesCount.toString()} highlight={target.technical.internalLinking.orphanPagesCount > 0} />
               <VitalRow label="Link Score" value={`${target.technical.internalLinking.internalLinkScore}/100`} />
               <VitalRow label="HTTPS Status" value={target.technical.httpsSecurity} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-8">
          <AuditSection 
            title="Technical Audit Summary" 
            data={[
              { label: 'Broken Internal', value: target.technical.brokenInternalLinks.count, status: target.technical.brokenInternalLinks.count > 0 ? 'error' : 'success' },
              { label: 'Broken External', value: target.technical.brokenExternalLinks.count, status: target.technical.brokenExternalLinks.count > 0 ? 'error' : 'success' },
              { label: 'Orphan Pages', value: target.technical.internalLinking.orphanPagesCount, status: target.technical.internalLinking.orphanPagesCount > 0 ? 'warning' : 'success' },
              { label: 'Redirect Chains', value: target.technical.redirectChains, status: target.technical.redirectChains > 0 ? 'warning' : 'success' },
              { label: 'robots.txt Status', value: target.technical.robotsTxtStatus, status: target.technical.robotsTxtStatus.toLowerCase().includes('missing') ? 'error' : 'success' },
              { label: 'HTTPS Security', value: target.technical.httpsSecurity, status: target.technical.httpsSecurity.toLowerCase().includes('insecure') ? 'error' : 'success' },
              { label: 'Mixed Content', value: target.technical.mixedContent ? 'Detected' : 'Clean', status: target.technical.mixedContent ? 'error' : 'success' },
              { label: 'Mobile Score', value: target.technical.mobileFriendly ? 'Pass' : 'Fail', status: target.technical.mobileFriendly ? 'success' : 'error' },
            ]}
            details={getCombinedTechnicalDetails()}
            suggestions={target.technical.suggestions}
          />

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Detailed 404 Error Report
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-red-900/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Internal Broken Links</h4>
                    <p className="text-xs text-slate-500">Links pointing to missing pages on your domain</p>
                  </div>
                  <span className="text-2xl font-bold text-white">{target.technical.brokenInternalLinks.count}</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {target.technical.brokenInternalLinks.list.length > 0 ? (
                    target.technical.brokenInternalLinks.list.map((url, i) => (
                      <div key={i} className="group relative flex items-center gap-2">
                        <div className="flex-1 text-[11px] font-mono bg-red-500/5 p-3 rounded-lg border border-red-500/10 text-red-200 truncate" title={url}>
                          {url}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(url)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy URL"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-600 italic border-2 border-dashed border-slate-800 rounded-xl text-sm">
                      Zero internal 404s detected. Clean crawl!
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-orange-900/5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">External Broken Links</h4>
                    <p className="text-xs text-slate-500">Outbound links pointing to dead resources</p>
                  </div>
                  <span className="text-2xl font-bold text-white">{target.technical.brokenExternalLinks.count}</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {target.technical.brokenExternalLinks.list.length > 0 ? (
                    target.technical.brokenExternalLinks.list.map((url, i) => (
                      <div key={i} className="group relative flex items-center gap-2">
                        <div className="flex-1 text-[11px] font-mono bg-orange-500/5 p-3 rounded-lg border border-orange-500/10 text-orange-200 truncate" title={url}>
                          {url}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(url)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy URL"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-600 italic border-2 border-dashed border-slate-800 rounded-xl text-sm">
                      All outbound links are healthy.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {competitor && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Competitor Broken Link Exposure</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                   <div className="text-xs text-slate-500 mb-1">Competitor Internal 404s</div>
                   <div className="text-xl font-bold text-slate-300">{competitor.technical?.brokenInternalLinks?.count || 0}</div>
                 </div>
                 <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                   <div className="text-xs text-slate-500 mb-1">Competitor External 404s</div>
                   <div className="text-xl font-bold text-slate-300">{competitor.technical?.brokenExternalLinks?.count || 0}</div>
                 </div>
               </div>
             </div>
          )}
        </div>
      )}

      {activeTab === 'onpage' && (
        <div className="space-y-6">
          <AuditSection title="On-Page Audit" data={[
            { label: 'Keyword Optimization', value: `${target.onPage.keywordOptimizationScore}%`, status: target.onPage.keywordOptimizationScore > 75 ? 'success' : 'warning' },
            { label: 'Missing Titles', value: target.onPage.missingTitles, status: target.onPage.missingTitles > 0 ? 'error' : 'success' },
            { label: 'Missing Meta Desc', value: target.onPage.missingMetaDescriptions, status: target.onPage.missingMetaDescriptions > 0 ? 'warning' : 'success' },
          ]} details={target.warnings.details} />
        </div>
      )}

      {activeTab === 'backlinks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Backlinks & Authority Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard title="Target Domains" value={target.authority.referringDomains} color="blue" />
              {competitor && <MetricCard title="Competitor Domains" value={competitor.authority.referringDomains} color="red" />}
              <MetricCard title="Toxic Links" value={target.authority.toxicLinks} color="red" />
              <MetricCard title="Domain Authority" value={target.authority.domainAuthority} color="blue" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'swot' && <SWOTAnalysisView swot={swot} />}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {!contentPlan && !isGeneratingContent && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <h3 className="text-2xl font-bold mb-2">AI Content Roadmap</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">Generate a content strategy to eliminate competition and fill semantic gaps.</p>
              <button onClick={handleGenerateBlogPlan} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/10">
                Create 30-Day Strategy
              </button>
            </div>
          )}
          {isGeneratingContent && <div className="p-20 text-center animate-pulse text-blue-400 font-medium">Mapping cluster opportunities...</div>}
          {contentPlan && <BlogContentPlanView plan={contentPlan} />}
        </div>
      )}
    </div>
  );
};

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center p-2 rounded-lg ${highlight ? 'bg-blue-500/10' : ''}`}>
    <span className="text-sm font-medium text-slate-400">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-blue-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

export default Dashboard;
