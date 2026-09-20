'use client';

import { Engine, ENGINE_LABEL } from '@/lib/pipeline';

export type EngineState = 'idle' | 'busy' | 'ok' | 'error';

export interface EngineStatus {
  engine: Engine;
  state: EngineState;
  note: string;
}

const color: Record<EngineState, string> = {
  idle: 'bg-slate-300',
  busy: 'bg-amber-500 animate-pulse',
  ok: 'bg-emerald-500',
  error: 'bg-rose-500',
};

export default function EngineMonitor({ statuses }: { statuses: EngineStatus[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
        Connected systems
      </div>
      <div className="divide-y divide-slate-100">
        {statuses.map((s) => (
          <div key={s.engine} className="flex items-center gap-2 px-3 py-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color[s.state]}`} />
            <span className="w-20 shrink-0 text-[12px] font-medium text-slate-700">
              {ENGINE_LABEL[s.engine]}
            </span>
            <span className="truncate text-[11px] text-slate-400">{s.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
