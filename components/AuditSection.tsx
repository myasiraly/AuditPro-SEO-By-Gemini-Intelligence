
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
}

const AuditSection: React.FC<AuditSectionProps> = ({ title, data, details }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-800/20">
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="divide-y divide-slate-800">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
              <span className="text-slate-300 font-medium">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-200 font-mono text-sm">{item.value}</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-400">Findings & Logs</h3>
        {details && details.length > 0 ? (
          <ul className="space-y-3">
            {details.map((log, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-blue-500">•</span>
                {log}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 italic">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No major technical issues identified.
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'success' | 'warning' | 'error' }> = ({ status }) => {
  const styles = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default AuditSection;
