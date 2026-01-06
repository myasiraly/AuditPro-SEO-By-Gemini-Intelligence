
import React from 'react';
import { SWOTAnalysis } from '../types';

interface SWOTAnalysisProps {
  swot: SWOTAnalysis;
}

const SWOTAnalysisView: React.FC<SWOTAnalysisProps> = ({ swot }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SWOTCard 
        title="Strengths" 
        items={swot.strengths} 
        color="green" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
      />
      <SWOTCard 
        title="Weaknesses" 
        items={swot.weaknesses} 
        color="red" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
      />
      <SWOTCard 
        title="Opportunities" 
        items={swot.opportunities} 
        color="blue" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />}
      />
      <SWOTCard 
        title="Threats" 
        items={swot.threats} 
        color="yellow" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
      />
    </div>
  );
};

const SWOTCard: React.FC<{ title: string, items: string[], color: 'green' | 'red' | 'blue' | 'yellow', icon: React.ReactNode }> = ({ title, items, color, icon }) => {
  const styles = {
    green: 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400 shadow-emerald-500/5',
    red: 'border-rose-500/20 bg-rose-500/[0.03] text-rose-400 shadow-rose-500/5',
    blue: 'border-blue-500/20 bg-blue-500/[0.03] text-blue-400 shadow-blue-500/5',
    yellow: 'border-amber-500/20 bg-amber-500/[0.03] text-amber-400 shadow-amber-500/5',
  };

  return (
    <div className={`p-8 rounded-[32px] border ${styles[color]} shadow-2xl transition-all hover:scale-[1.01] duration-500 backdrop-blur-sm group`}>
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-2.5 rounded-xl border border-current opacity-60 group-hover:opacity-100 transition-opacity`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <h3 className="text-2xl font-black font-display tracking-tight uppercase group-hover:text-white transition-colors">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4 text-[14px] text-slate-300 leading-relaxed font-medium">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-40"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SWOTAnalysisView;
