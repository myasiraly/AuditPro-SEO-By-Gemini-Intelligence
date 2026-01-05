
import React from 'react';
import { SWOTAnalysis } from '../types';

interface SWOTAnalysisProps {
  swot: SWOTAnalysis;
}

const SWOTAnalysisView: React.FC<SWOTAnalysisProps> = ({ swot }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SWOTCard 
        title="Strengths" 
        items={swot.strengths} 
        color="green" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
      />
      <SWOTCard 
        title="Weaknesses" 
        items={swot.weaknesses} 
        color="red" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
      />
      <SWOTCard 
        title="Opportunities" 
        items={swot.opportunities} 
        color="blue" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
      />
      <SWOTCard 
        title="Threats" 
        items={swot.threats} 
        color="yellow" 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
      />
    </div>
  );
};

const SWOTCard: React.FC<{ title: string, items: string[], color: 'green' | 'red' | 'blue' | 'yellow', icon: React.ReactNode }> = ({ title, items, color, icon }) => {
  const styles = {
    green: 'border-green-500/20 bg-green-500/5 text-green-500',
    red: 'border-red-500/20 bg-red-500/5 text-red-500',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-500',
    yellow: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-500',
  };

  return (
    <div className={`p-6 rounded-2xl border ${styles[color]}`}>
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
        <h3 className="text-xl font-bold uppercase tracking-wide">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SWOTAnalysisView;
