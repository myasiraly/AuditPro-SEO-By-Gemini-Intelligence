
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

  const exportToCSV = () => {
    const rows = [
      ['Metric', 'Target Value'],
      ['URL', target.url],
      ['Health Score', target.healthScore.toFixed(2)],
      ['Total Pages', target.totalPages],
      ['Errors', target.errors.count],
      ['Warnings', target.warnings.count],
      ['Notices', target.notices.count],
      ['Domain Authority', target.authority.domainAuthority],
      ['LCP', target.coreWebVitals.lcp],
      ['TTI', target.coreWebVitals.tti],
      ['Broken Internal Links', target.technical.brokenInternalLinks.count],
      ['Broken External Links', target.technical.brokenExternalLinks.count],
      ['Mixed Content Count', target.technical.mixedContentUrls.length],
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
    const details = [...target.errors.details];
    
    target.technical.brokenInternalLinks.list.forEach(url => 
      details.push(`Broken Internal (404): ${url}`)
    );
    
    target.technical.brokenExternalLinks.list.forEach(url => 
      details.push(`Broken External (404): ${url}`)
    );

    if (target.technical.mixedContentUrls.length > 0) {
      target.technical.mixedContentUrls.forEach(url => {
        details.push(`Mixed Content Resource (HTTP): ${url}`);
      });
    } else if (target.technical.mixedContent) {
      details.push(`Insecure content detected on page (Mixed Content)`);
    }

    return details;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Audit Result for {new URL(target.url).hostname}</h2>
          <p className="text-slate-400">Comparison with {competitor ? new URL(competitor.url).hostname : 'No Competitor Set'}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
          >
            New Audit
          </button>
        </div>
      </div>

      {/* Tabs */}
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
              <MetricCard 
                title="Health Score" 
                value={`${target.healthScore.toFixed(1)}%`}
                subtitle="Overall Site Health"
                color={target.healthScore > 80 ? 'green' : target.healthScore > 50 ? 'yellow' : 'red'}
                comparison={competitor ? { 
                  value: `${competitor.healthScore.toFixed(1)}%`, 
                  label: 'Competitor',
                  trend: target.healthScore > competitor.healthScore ? 'up' : 'down'
                } : undefined}
              />
              <MetricCard 
                title="Domain Authority" 
                value={target.authority.domainAuthority}
                subtitle="OpenPageRank Score"
                color="blue"
                comparison={competitor ? { 
                  value: competitor.authority.domainAuthority, 
                  label: 'Competitor'
                } : undefined}
              />
              <MetricCard 
                title="Toxic Links" 
                value={target.authority.toxicLinks}
                subtitle="Potential Spam Links"
                color={target.authority.toxicLinks > 5 ? 'red' : 'green'}
              />
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Health Comparison
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
              <div className="space-y-4">
                <VitalRow label="LCP" value={target.coreWebVitals.lcp} />
                <VitalRow label="FID" value={target.coreWebVitals.fid} />
                <VitalRow label="CLS" value={target.coreWebVitals.cls} />
                <VitalRow label="TTI" value={target.coreWebVitals.tti} highlight />
                {competitor && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">vs Competitor</p>
                    <VitalRow label="TTI" value={competitor.coreWebVitals.tti} />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Content Intelligence</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Thin Content Pages</span>
                  <span className={`font-bold ${target.content.thinContentCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {target.content.thinContentCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Duplicate Content</span>
                  <span className="font-bold text-slate-200">{target.content.duplicateContentHashes} groups</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Avg. Word Count</span>
                  <span className="font-bold text-slate-200">{target.content.avgWordCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-6">
          <AuditSection 
            title="Technical Audit" 
            data={[
              { label: 'Redirect Chains', value: target.technical.redirectChains, status: target.technical.redirectChains > 0 ? 'warning' : 'success' },
              { label: 'Robots.txt', value: target.technical.robotsTxtStatus, status: target.technical.robotsTxtStatus.toLowerCase().includes('ok') ? 'success' : 'error' },
              { label: 'HTTPS Security', value: target.technical.httpsSecurity, status: 'success' },
              { label: 'Mixed Content', value: target.technical.mixedContent ? 'Found' : 'Clean', status: target.technical.mixedContent ? 'error' : 'success' },
              { label: 'Broken Internal Links', value: target.technical.brokenInternalLinks.count, status: target.technical.brokenInternalLinks.count > 0 ? 'error' : 'success' },
              { label: 'Broken External Links', value: target.technical.brokenExternalLinks.count, status: target.technical.brokenExternalLinks.count > 0 ? 'warning' : 'success' },
            ]}
            details={getCombinedTechnicalDetails()}
            suggestions={target.technical.suggestions}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(target.technical.brokenInternalLinks.count > 0 || target.technical.brokenExternalLinks.count > 0) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Broken Link Report
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Internal 404s</h4>
                    <ul className="space-y-1">
                      {target.technical.brokenInternalLinks.list.length > 0 ? target.technical.brokenInternalLinks.list.map((url, i) => (
                        <li key={i} className="text-[10px] font-mono text-red-300 bg-red-500/10 p-1.5 rounded truncate hover:whitespace-normal transition-all" title={url}>{url}</li>
                      )) : <li className="text-xs text-slate-500 italic">None found</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">External 404s</h4>
                    <ul className="space-y-1">
                      {target.technical.brokenExternalLinks.list.length > 0 ? target.technical.brokenExternalLinks.list.map((url, i) => (
                        <li key={i} className="text-[10px] font-mono text-orange-300 bg-orange-500/10 p-1.5 rounded truncate hover:whitespace-normal transition-all" title={url}>{url}</li>
                      )) : <li className="text-xs text-slate-500 italic">None found</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {target.technical.mixedContent && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Insecure Resource Audit
                </h3>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Mixed Content Resource URLs (HTTP)</h4>
                  <ul className="space-y-2">
                    {target.technical.mixedContentUrls.length > 0 ? target.technical.mixedContentUrls.map((url, i) => (
                      <li key={i} className="flex flex-col gap-1 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded">
                        <span className="text-[10px] font-mono text-yellow-300 break-all">{url}</span>
                        <span className="text-[8px] uppercase tracking-tighter text-slate-500">Resource: {url.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</span>
                      </li>
                    )) : (
                      <li className="text-xs text-slate-500 italic">No specific resource URLs captured, but insecure requests were detected.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'onpage' && (
        <AuditSection 
          title="On-Page SEO & Assets" 
          data={[
            { label: 'Missing Titles', value: target.onPage.missingTitles, status: target.onPage.missingTitles > 0 ? 'error' : 'success' },
            { label: 'Missing Meta Desc', value: target.onPage.missingMetaDescriptions, status: target.onPage.missingMetaDescriptions > 0 ? 'warning' : 'success' },
            { label: 'Missing H1s', value: target.onPage.missingH1s, status: target.onPage.missingH1s > 0 ? 'warning' : 'success' },
            { label: 'Oversize Images (>100kb)', value: target.images.overSizeLimit, status: target.images.overSizeLimit > 5 ? 'warning' : 'success' },
            { label: 'Images Missing Alt', value: target.images.missingAlt, status: target.images.missingAlt > 0 ? 'warning' : 'success' },
          ]}
          details={target.warnings.details}
        />
      )}

      {activeTab === 'backlinks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Backlink & Authority Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard title="Referring Domains" value={target.authority.referringDomains} color="blue" />
              <MetricCard title="Page Rank" value={target.authority.pageRank} color="blue" />
              <MetricCard title="Toxic Links" value={target.authority.toxicLinks} color="red" />
              <MetricCard title="Domain Authority" value={target.authority.domainAuthority} color="green" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-4 text-blue-400">Top Referring Domains</h4>
                <ul className="space-y-3">
                  {target.authority.topReferringDomains.map((domain, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800 transition-hover hover:border-blue-500/50">
                      <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-bold">
                        {domain[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-mono text-slate-300">{domain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-4 text-yellow-500">Authority Insights</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Referring domains represent the number of unique websites linking to yours. High-quality domains (DA 60+) contribute more significantly to your PageRank.
                </p>
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                  <p className="text-xs text-yellow-200 italic">
                    <span className="font-bold">Pro Tip:</span> Diversity of anchor text and top-level domains (TLDs) is key for a natural-looking backlink profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'swot' && (
        <SWOTAnalysisView swot={swot} />
      )}

      {activeTab === 'blog' && (
        <div className="space-y-6">
          {!contentPlan && !isGeneratingContent && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Blog Strategist</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Generate a 30-day blog content calendar designed to rank for your niche's most valuable keywords.
              </p>
              <button
                onClick={handleGenerateBlogPlan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
              >
                Create 30-Day Blog Strategy
              </button>
            </div>
          )}

          {isGeneratingContent && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-blue-400 font-medium animate-pulse">Consulting Content Strategist...</p>
              <p className="text-slate-500 text-sm">Mapping topics, keywords, and funnel stages for your growth.</p>
            </div>
          )}

          {contentPlan && (
            <BlogContentPlanView plan={contentPlan} />
          )}
        </div>
      )}
    </div>
  );
};

const VitalRow: React.FC<{ label: string, value: string, highlight?: boolean }> = ({ label, value, highlight }) => {
  return (
    <div className={`flex justify-between items-center p-2 rounded-lg ${highlight ? 'bg-blue-500/10' : ''}`}>
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-blue-400' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}

export default Dashboard;
