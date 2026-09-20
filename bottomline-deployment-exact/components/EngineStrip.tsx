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

/** Real brand marks, where one exists for the connected system. */
const ENGINE_LOGO: Partial<Record<Engine, string>> = {
  salesforce: '/logos/salesforce.png',
};

/** One-line connected-systems indicator that lives in the header. */
export default function EngineStrip({ statuses }: { statuses: EngineStatus[] }) {
  return (
    <div className="flex items-center gap-3">
      {statuses.map((s) => (
        <div key={s.engine} className="flex items-center gap-1.5" title={s.note}>
          <span className={`h-1.5 w-1.5 rounded-full ${color[s.state]}`} />
          {ENGINE_LOGO[s.engine] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ENGINE_LOGO[s.engine]} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
          )}
          <span className="text-[11px] text-slate-500">{ENGINE_LABEL[s.engine]}</span>
        </div>
      ))}
    </div>
  );
}
