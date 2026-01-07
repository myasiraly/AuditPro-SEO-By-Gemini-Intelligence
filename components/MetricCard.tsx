
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'teal' | 'rose' | 'amber' | 'violet' | 'cyan' | 'indigo' | 'slate';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, color = 'slate' }) => {
  const colors = {
    teal: 'border-teal-500/30 bg-teal-500/[0.03] text-teal-400',
    rose: 'border-rose-500/30 bg-rose-500/[0.03] text-rose-400',
    amber: 'border-amber-500/30 bg-amber-500/[0.03] text-amber-400',
    violet: 'border-violet-500/30 bg-violet-500/[0.03] text-violet-400',
    cyan: 'border-cyan-500/30 bg-cyan-500/[0.03] text-cyan-400',
    indigo: 'border-indigo-500/30 bg-indigo-500/[0.03] text-indigo-400',
    slate: 'border-white/10 bg-white/[0.02] text-slate-100',
  };

  const accentGlow = {
    teal: 'shadow-teal-500/10',
    rose: 'shadow-rose-500/10',
    amber: 'shadow-amber-500/10',
    violet: 'shadow-violet-500/10',
    cyan: 'shadow-cyan-500/10',
    indigo: 'shadow-indigo-500/10',
    slate: 'shadow-white/5',
  };

  return (
    <div className={`p-10 rounded-[40px] border ${colors[color]} ${accentGlow[color]} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group relative overflow-hidden backdrop-blur-sm`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.05] blur-3xl -mr-12 -mt-12 group-hover:opacity-[0.1] transition-opacity"></div>
      <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest-label mb-6">{title}</h4>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-extrabold font-display tracking-tighter group-hover:text-white transition-colors">{value}</span>
      </div>
      {subtitle && <p className="text-slate-600 text-[10px] font-bold tracking-widest-label uppercase opacity-80 leading-relaxed">{subtitle}</p>}
      <div className="mt-8 flex justify-end">
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-current group-hover:text-black transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
