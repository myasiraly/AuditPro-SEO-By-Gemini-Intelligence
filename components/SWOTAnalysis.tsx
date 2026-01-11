
import React from 'react';
import { SWOTAnalysis } from '../types';

interface SWOTAnalysisProps {
  swot: SWOTAnalysis;
}

const SWOTAnalysisView: React.FC<SWOTAnalysisProps> = ({ swot }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SWOTCard 
        title="Strengths" 
        items={swot.strengths} 
        color="teal" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
      />
      <SWOTCard 
        title="Weaknesses" 
        items={swot.weaknesses} 
        color="rose" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
      />
      <SWOTCard 
        title="Opportunities" 
        items={swot.opportunities} 
        color="cyan" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />}
      />
      <SWOTCard 
        title="Threats" 
        items={swot.threats} 
        color="amber" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
      />
    </div>
  );
};

const SWOTCard: React.FC<{ title: string, items: string[], color: 'teal' | 'rose' | 'cyan' | 'amber', icon: React.ReactNode }> = ({ title, items, color, icon }) => {
  const styles = {
    teal: 'border-teal-500/20 bg-teal-500/[0.01] text-teal-400',
    rose: 'border-rose-500/20 bg-rose-500/[0.01] text-rose-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/[0.01] text-cyan-400',
    amber: 'border-amber-500/20 bg-amber-500/[0.01] text-amber-400',
  };

  return (
    <div className={`p-8 rounded-[40px] border ${styles[color]} transition-all hover:scale-[1.01] duration-500 backdrop-blur-xl group relative overflow-hidden shadow-2xl shadow-black`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] blur-3xl -mr-16 -mt-16`}></div>
      <div className="flex items-center gap-4 mb-10">
        <div className="p-2.5 rounded-2xl border border-current opacity-60 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <h3 className="text-xl font-black font-display tracking-widest-label uppercase group-hover:text-white transition-colors">{title}</h3>
      </div>
      <ul className="space-y-5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 text-[13px] text-slate-300 leading-relaxed font-semibold">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-40"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SWOTAnalysisView;
