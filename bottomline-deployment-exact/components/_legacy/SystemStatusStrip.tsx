'use client';

import { Activity, CheckCircle2, AlertCircle, Clock, Wifi, Database, Cloud, Server } from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency?: string;
}

const systemStatuses: SystemStatus[] = [
  { name: 'ROC Engine', status: 'online', latency: '45ms' },
  { name: 'Alteryx Server', status: 'online', latency: '120ms' },
  { name: 'Salesforce API', status: 'online', latency: '89ms' },
  { name: 'Data Lake', status: 'online', latency: '23ms' },
];

const statusConfig = {
  online: {
    icon: <CheckCircle2 className="w-3 h-3 text-green-600" />,
    className: 'text-green-600',
    dotClass: 'bg-green-500',
  },
  degraded: {
    icon: <Clock className="w-3 h-3 text-amber-600" />,
    className: 'text-amber-600',
    dotClass: 'bg-amber-500',
  },
  offline: {
    icon: <AlertCircle className="w-3 h-3 text-red-600" />,
    className: 'text-red-600',
    dotClass: 'bg-red-500',
  },
};

const systemIcons: Record<string, React.ReactNode> = {
  'ROC Engine': <Database className="w-3.5 h-3.5 text-slate-400" />,
  'Alteryx Server': <Server className="w-3.5 h-3.5 text-slate-400" />,
  'Salesforce API': <Cloud className="w-3.5 h-3.5 text-slate-400" />,
  'Data Lake': <Wifi className="w-3.5 h-3.5 text-slate-400" />,
};

export default function SystemStatusStrip() {
  const allOnline = systemStatuses.every(s => s.status === 'online');
  
  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <Activity className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">System Status</h3>
        <span className={`ml-auto flex items-center gap-1.5 text-xs ${allOnline ? 'text-green-600' : 'text-amber-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${allOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
          {allOnline ? 'All systems operational' : 'Some issues detected'}
        </span>
      </div>
      
      {/* Status list */}
      <div className="p-3 space-y-2">
        {systemStatuses.map((system) => {
          const config = statusConfig[system.status];
          return (
            <div 
              key={system.name}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-50"
            >
              <div className="flex items-center gap-2">
                {systemIcons[system.name]}
                <span className="text-xs text-slate-600">{system.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {system.latency && (
                  <span className="text-[10px] text-slate-400">{system.latency}</span>
                )}
                <span className={`flex items-center gap-1 ${config.className}`}>
                  {config.icon}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
