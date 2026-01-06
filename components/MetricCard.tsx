
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'slate';
  comparison?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down';
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, color = 'slate', comparison }) => {
  const colors = {
    green: 'border-green-500/30 bg-green-500/[0.03] text-green-400',
    red: 'border-red-500/30 bg-red-500/[0.03] text-red-400',
    yellow: 'border-yellow-500/30 bg-yellow-500/[0.03] text-yellow-400',
    blue: 'border-blue-500/30 bg-blue-500/[0.03] text-blue-400',
    slate: 'border-white/5 bg-slate-900/50 text-slate-100',
  };

  return (
    <div className={`p-7 rounded-[32px] border ${colors[color]} transition-all hover:translate-y-[-4px] duration-500 backdrop-blur-sm group`}>
      <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest-label mb-3">{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold font-display tracking-tight-data group-hover:text-white transition-colors">{value}</span>
      </div>
      {subtitle && <p className="text-slate-500 text-[11px] mt-2 font-bold tracking-tight uppercase opacity-80">{subtitle}</p>}
      
      {comparison && (
        <div className="mt-5 pt-5 border-t border-white/5 flex justify-between items-center">
          <div className="text-[9px] text-slate-600 uppercase font-black tracking-widest-label">{comparison.label}</div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-300 font-display">{comparison.value}</span>
            {comparison.trend && (
              <svg 
                className={`w-3.5 h-3.5 ${comparison.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                  d={comparison.trend === 'up' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
