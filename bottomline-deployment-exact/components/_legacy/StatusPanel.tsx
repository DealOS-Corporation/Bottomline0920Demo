'use client';

import { StepSchema, StepStatus, SubStep } from '@/lib/stepsSchema';
import { 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Lock,
  ChevronRight,
  Circle
} from 'lucide-react';

interface StatusPanelProps {
  step: StepSchema | undefined;
  progress?: number;
}

const statusConfig: Record<StepStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  'done': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  'running': { icon: Loader2, color: 'text-blue-800', bg: 'bg-blue-50', label: 'Running' },
  'ready': { icon: Circle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Ready' },
  'blocked': { icon: Lock, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Locked' },
  'not-started': { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Not Started' },
  'error': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Error' },
};

function SubStepItem({ subStep, isLast }: { subStep: SubStep; isLast: boolean }) {
  const config = statusConfig[subStep.status];
  const Icon = config.icon;
  const isRunning = subStep.status === 'running';
  
  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded flex items-center justify-center ${config.bg} border border-slate-200 transition-colors duration-300`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-slate-200 my-1" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${subStep.status === 'done' ? 'text-slate-700' : subStep.status === 'running' ? 'text-blue-800' : 'text-slate-400'}`}>
            {subStep.label}
          </span>
          {subStep.timestamp && (
            <span className="text-xs text-slate-400">{subStep.timestamp}</span>
          )}
        </div>
        {subStep.message && (
          <p className="text-xs text-slate-500 mt-1">{subStep.message}</p>
        )}
      </div>
    </div>
  );
}

export default function StatusPanel({ step, progress = 0 }: StatusPanelProps) {
  if (!step) {
    return (
      <div className="bg-white rounded-md border border-slate-200 h-full flex items-center justify-center">
        <span className="text-slate-400 text-sm">No step selected</span>
      </div>
    );
  }

  const config = statusConfig[step.status];
  const Icon = config.icon;
  const isRunning = step.status === 'running';

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">{step.label}</h3>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.color} border border-slate-200`}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-slate-500">{step.description}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 p-5 overflow-auto">
        {/* Overall progress (for running steps) */}
        {isRunning && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 font-medium">Overall Progress</span>
              <span className="text-sm text-slate-800 font-semibold tnum">{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sub-steps timeline */}
        {step.subSteps && step.subSteps.length > 0 && (
          <div className="space-y-0">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Processing Steps
            </h4>
            {step.subSteps.map((subStep, idx) => (
              <SubStepItem 
                key={subStep.id} 
                subStep={subStep} 
                isLast={idx === step.subSteps!.length - 1}
              />
            ))}
          </div>
        )}

        {/* Locked message */}
        {step.isLocked && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <h5 className="text-sm font-semibold text-slate-700">Automated Process</h5>
                <p className="text-xs text-slate-500 mt-1">
                  This step is fully automated and cannot be manually controlled. The system will proceed automatically when complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
