
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
    green: 'border-green-500/50 bg-green-500/5 text-green-500',
    red: 'border-red-500/50 bg-red-500/5 text-red-500',
    yellow: 'border-yellow-500/50 bg-yellow-500/5 text-yellow-500',
    blue: 'border-blue-500/50 bg-blue-500/5 text-blue-500',
    slate: 'border-slate-800 bg-slate-900/50 text-slate-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} transition-all hover:scale-[1.02] duration-300`}>
      <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
      </div>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      
      {comparison && (
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{comparison.label}</div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-slate-300">{comparison.value}</span>
            {comparison.trend && (
              <svg 
                className={`w-4 h-4 ${comparison.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} 
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
