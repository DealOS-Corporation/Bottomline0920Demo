'use client';

import { useState } from 'react';
import {
  Cpu,
  Database,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Circle,
  Loader2,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';

import { SubStep } from '@/lib/stepsSchema';

interface ROCLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface ProcessingCenterProps {
  subSteps: SubStep[];
  progress: number;
  estimatedMinutes: number;
  logs: ROCLog[];
  onRetry: () => void;
  onEscalate: () => void;
}

const stepStatusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'done': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  'running': { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  'ready': { icon: PlayCircle, color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  'blocked': { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  'not-started': { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
  'error': { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

export default function ProcessingCenter({
  subSteps,
  progress,
  estimatedMinutes,
  logs,
  onRetry,
  onEscalate,
}: ProcessingCenterProps) {
  const [showLogs, setShowLogs] = useState(true);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'logs'>('pipeline');

  const completedSteps = subSteps.filter(s => s.status === 'done').length;
  const totalSteps = subSteps.length;
  const currentStep = subSteps.find(s => s.status === 'running');

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            Pipeline Status
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Processing Logs
          </button>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
          Processing Orchestration
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'pipeline' ? (
          <div className="h-full flex flex-col">
            {/* Progress overview */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Alteryx + ROC Pipeline</p>
                    <p className="text-xs text-slate-500">
                      {completedSteps}/{totalSteps} steps complete
                      {currentStep && <span className="text-blue-600 ml-2">• {currentStep.label}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{Math.round(progress)}%</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> ~{estimatedMinutes} min remaining
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Sub-steps timeline */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-slate-200" />
                
                <div className="space-y-0">
                  {(subSteps || []).map((step, i) => {
                    const cfg = stepStatusConfig[step.status] || stepStatusConfig['not-started'];
                    const Icon = cfg.icon;
                    const isRunning = step.status === 'running';
                    const isDone = step.status === 'done';
                    
                    return (
                      <div key={step.id} className="relative flex items-start gap-4 pb-5">
                        {/* Icon */}
                        <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cfg.bg} ${
                          isRunning ? 'ring-4 ring-blue-100' : ''
                        }`}>
                          <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                        </div>
                        
                        {/* Content */}
                        <div className={`flex-1 ${i === subSteps.length - 1 ? '' : 'pb-2'}`}>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${isDone ? 'text-slate-600' : isRunning ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                            <div className="flex items-center gap-2">
                              {step.timestamp && (
                                <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                              )}
                              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${cfg.bg} ${cfg.color}`}>
                                {step.status === 'done' ? 'Complete' : step.status === 'running' ? 'In Progress' : step.status === 'error' ? 'Error' : 'Waiting'}
                              </span>
                            </div>
                          </div>
                          {step.message && (
                            <p className={`text-xs mt-1 ${isRunning ? 'text-blue-600' : 'text-slate-500'}`}>
                              {step.message}
                            </p>
                          )}
                          {isRunning && (
                            <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden w-48">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex-shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Failed
                </button>
                <button 
                  onClick={onEscalate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Escalate
                </button>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">
                <ExternalLink className="w-3.5 h-3.5" />
                Open ROC Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Logs view */
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 font-mono text-sm">
              {logs.map(log => {
                const levelColors = {
                  info: 'text-blue-600',
                  warn: 'text-amber-600',
                  error: 'text-red-600',
                };
                return (
                  <div key={log.id} className="flex gap-3 py-1 hover:bg-slate-100">
                    <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`flex-shrink-0 w-12 ${levelColors[log.level]}`}>{log.level.toUpperCase()}</span>
                    <span className="text-slate-700">{log.message}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 py-1 text-slate-500">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>Listening for new events...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
