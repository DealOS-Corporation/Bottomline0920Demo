'use client';

import { StepSchema, StepStatus } from '@/lib/stepsSchema';
import { Lock, CheckCircle2, Clock, AlertCircle, PlayCircle, Circle } from 'lucide-react';

interface StepBarProps {
  steps: StepSchema[];
  activeStepId: string;
  onStepClick: (stepId: string) => void;
}

// Status badge styling
const statusConfig: Record<StepStatus, { label: string; className: string; icon: React.ReactNode }> = {
  'not-started': {
    label: 'Not started',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
    icon: <Circle className="w-3 h-3" />,
  },
  'ready': {
    label: 'Ready',
    className: 'bg-blue-50 text-blue-600 border border-blue-200',
    icon: <Clock className="w-3 h-3" />,
  },
  'running': {
    label: 'Running',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <PlayCircle className="w-3 h-3" />,
  },
  'blocked': {
    label: 'Blocked',
    className: 'bg-red-50 text-red-600 border border-red-200',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  'done': {
    label: 'Done',
    className: 'bg-green-50 text-green-600 border border-green-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  'error': {
    label: 'Error',
    className: 'bg-red-50 text-red-700 border border-red-300',
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

// Owner badge styling removed — steps show status only.

export default function StepBar({ steps, activeStepId, onStepClick }: StepBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-2 py-3 w-full">
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isDone = step.status === 'done';
          const status = statusConfig[step.status];
          
          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              {/* Step Item */}
              <button
                onClick={() => onStepClick(step.id)}
                className={`flex flex-col items-start p-2.5 px-3.5 rounded transition-colors w-full ${
                  isActive 
                    ? 'bg-blue-50/70 ring-1 ring-blue-700/30' 
                    : isDone
                    ? 'bg-slate-50 hover:bg-slate-100'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Step number and label */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold transition-colors ${
                    isActive 
                      ? 'bg-[#16345e] text-white' 
                      : isDone 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : step.order}
                  </span>
                  <span className={`text-sm font-semibold truncate tracking-tight ${
                    isActive ? 'text-[#16345e]' : isDone ? 'text-slate-700' : 'text-slate-600'
                  }`}>
                    {step.label.replace(' (Locked)', '')}
                  </span>
                  {step.isLocked && (
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
                
                {/* Status badge */}
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
              </button>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className={`w-4 h-0.5 mx-0.5 rounded-full transition-colors ${
                  step.status === 'done' ? 'bg-emerald-400' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
