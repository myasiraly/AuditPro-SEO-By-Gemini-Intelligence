
import React from 'react';

interface AuditCheck {
  label: string;
  value: string | number;
  status: 'success' | 'warning' | 'error';
}

interface AuditSectionProps {
  title: string;
  data: AuditCheck[];
  details?: string[];
  suggestions?: string[];
}

const AuditSection: React.FC<AuditSectionProps> = ({ title, data, details, suggestions }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-bold font-display tracking-tight text-white">{title}</h3>
        </div>
        <div className="divide-y divide-white/5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group">
              <span className="text-slate-400 font-bold text-sm tracking-tight group-hover:text-slate-200">{item.label}</span>
              <div className="flex items-center gap-5">
                <span className="text-slate-300 font-mono text-[11px] font-bold">{item.value}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 flex flex-col gap-8 backdrop-blur-sm">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label mb-6">Technical Discovery Logs</h3>
          {details && details.length > 0 ? (
            <ul className="space-y-3">
              {details.slice(0, 8).map((log, i) => (
                <li key={i} className="flex gap-4 text-[12px] text-slate-400 p-4 bg-slate-900/80 rounded-2xl border border-white/5 font-medium leading-relaxed group hover:border-blue-500/20 transition-all">
                  <span className="text-blue-500 font-black">LOG</span>
                  {log}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 italic font-medium">
              No critical system logs recorded.
            </div>
          )}
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="mt-auto pt-8 border-t border-white/5">
            <h3 className="text-xs font-black mb-6 text-emerald-400 flex items-center gap-2 uppercase tracking-widest-label">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Intelligence Fix Recommendation
            </h3>
            <ul className="space-y-3">
              {suggestions.map((sug, i) => (
                <li key={i} className="flex gap-4 text-sm text-emerald-100/90 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 font-bold leading-relaxed shadow-sm">
                  <span className="text-emerald-500 uppercase font-black text-[9px] tracking-widest-label mt-1">Fix</span>
                  {sug}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'success' | 'warning' | 'error' }> = ({ status }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest-label border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default AuditSection;
