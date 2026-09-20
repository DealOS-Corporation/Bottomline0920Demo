'use client';

import { Loader2 } from 'lucide-react';

export type GateStatus = 'idle' | 'running' | 'done';

interface StepGateProps {
  status: GateStatus;
  onRun: () => void;
  title: string;
  description: string;
  actionLabel: string;
  runningLabel?: string;
  runningDetail?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

/**
 * Gates a step's output behind an explicit trigger.
 *   idle    → empty state with a primary "run" button
 *   running → spinner + indeterminate progress bar
 *   done    → renders the actual panel
 */
export default function StepGate({
  status,
  onRun,
  title,
  description,
  actionLabel,
  runningLabel = 'Generating…',
  runningDetail = 'Processing inputs and assembling results…',
  icon: Icon,
  children,
}: StepGateProps) {
  if (status === 'done') {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-md border border-slate-200 h-full flex flex-col items-center justify-center p-8 animate-fade-in">
      {status === 'idle' ? (
        <>
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1.5 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 text-center max-w-md mb-6 leading-relaxed">{description}</p>
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-[#16345e] text-white hover:bg-[#1d4373] transition-colors"
          >
            <Icon className="w-4 h-4" />
            {actionLabel}
          </button>
          <p className="text-[11px] text-slate-400 mt-3">Nothing runs until you start it.</p>
        </>
      ) : (
        <>
          <Loader2 className="w-12 h-12 text-[#16345e] animate-spin mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-slate-800 mb-1.5 tracking-tight">{runningLabel}</h3>
          <p className="text-sm text-slate-500 text-center max-w-md mb-5 leading-relaxed">{runningDetail}</p>
          <div className="w-60 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#16345e] rounded-full animate-gate-progress" />
          </div>
        </>
      )}
    </div>
  );
}
