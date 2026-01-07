
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
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest-label">{title}</h3>
        </div>
        <div className="divide-y divide-white/5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.01] transition-colors group">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200">{item.label}</span>
              <div className="flex items-center gap-6">
                <span className="text-slate-500 font-mono text-[10px] font-black uppercase tracking-widest">{item.value}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 flex flex-col gap-8 backdrop-blur-xl">
        <div className="flex-1">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest-label mb-6">Discovery Logs</h3>
          {details && details.length > 0 ? (
            <ul className="space-y-2.5">
              {details.slice(0, 6).map((log, i) => (
                <li key={i} className="flex gap-4 text-[11px] text-slate-500 p-3.5 bg-black/40 border border-white/5 rounded-xl font-medium leading-relaxed group hover:border-violet-500/20 transition-all">
                  <span className="text-violet-500 font-black tracking-tighter shrink-0">INTEL</span>
                  {log}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-700 italic text-[10px] font-bold uppercase tracking-widest-label">
              System clean. No issues found.
            </div>
          )}
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="pt-8 border-t border-white/5">
            <h3 className="text-[10px] font-black mb-6 text-cyan-400 flex items-center gap-2 uppercase tracking-widest-label">
              Recommended Fixes
            </h3>
            <ul className="space-y-2.5">
              {suggestions.map((sug, i) => (
                <li key={i} className="flex gap-4 text-[11px] text-cyan-100/70 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10 font-bold leading-relaxed">
                  <span className="text-cyan-500 uppercase font-black text-[9px] tracking-widest-label shrink-0">Action</span>
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
    success: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
    warning: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    error: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest-label border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default AuditSection;
