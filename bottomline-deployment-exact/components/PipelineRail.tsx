'use client';

import { Check, Loader2, Lock, AlertTriangle, X, Minus } from 'lucide-react';
import { pipeline, StageStatus, ENGINE_LABEL } from '@/lib/pipeline';

const dot: Record<StageStatus, string> = {
  locked: 'bg-slate-300',
  ready: 'bg-sky-500',
  running: 'bg-amber-500',
  'needs-review': 'bg-amber-500',
  done: 'bg-emerald-500',
  skipped: 'bg-slate-300',
  error: 'bg-rose-500',
};

function StatusIcon({ status }: { status: StageStatus }) {
  if (status === 'done') return <Check className="w-3 h-3" />;
  if (status === 'running') return <Loader2 className="w-3 h-3 animate-spin" />;
  if (status === 'needs-review') return <AlertTriangle className="w-3 h-3" />;
  if (status === 'error') return <X className="w-3 h-3" />;
  if (status === 'skipped') return <Minus className="w-3 h-3" />;
  if (status === 'locked') return <Lock className="w-3 h-3" />;
  return null;
}

interface Props {
  statuses: Record<string, StageStatus>;
  activeId: string;
  onSelect: (id: string) => void;
}

export default function PipelineRail({ statuses, activeId, onSelect }: Props) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex items-stretch overflow-x-auto px-3">
        {pipeline.map((stage, i) => {
          const status = statuses[stage.id] ?? 'locked';
          const active = stage.id === activeId;
          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              className={`group relative flex min-w-[124px] flex-1 flex-col gap-1 border-b-2 px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${dot[status]}`}
                >
                  {status === 'ready' || status === 'locked' ? i + 1 : <StatusIcon status={status} />}
                </span>
                <span
                  className={`truncate text-[12.5px] font-semibold ${
                    active ? 'text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {stage.short}
                </span>
              </div>
              <span className="truncate pl-[22px] text-[10.5px] uppercase tracking-wide text-slate-400">
                {ENGINE_LABEL[stage.engine]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
