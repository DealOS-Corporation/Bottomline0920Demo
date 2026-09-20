'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCw,
  UserCog,
  Bell,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type ROCPhase = 'uploading' | 'executing' | 'waiting' | 'complete' | 'failed';

export interface ROCLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface WaitingTimeCopilotProps {
  phase: ROCPhase;
  progress: number;
  estimatedMinutes: number;
  startedAt: string;
  logs: ROCLog[];
  onRetry: () => void;
  onEscalate: () => void;
  onViewLogs: () => void;
}

const phaseConfig: Record<ROCPhase, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  uploading: { label: 'Uploading Files', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Loader2 },
  executing: { label: 'Executing ROC', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200', icon: Loader2 },
  waiting: { label: 'Waiting for ROC', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  complete: { label: 'Processing Complete', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  failed: { label: 'Execution Failed', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
};

const logLevelColors: Record<string, string> = {
  info: 'text-slate-500',
  warn: 'text-amber-600',
  error: 'text-red-600',
};

export default function WaitingTimeCopilot({
  phase,
  progress,
  estimatedMinutes,
  startedAt,
  logs,
  onRetry,
  onEscalate,
  onViewLogs,
}: WaitingTimeCopilotProps) {
  const [logsExpanded, setLogsExpanded] = useState(false);
  const config = phaseConfig[phase];
  const PhaseIcon = config.icon;
  const isActive = phase === 'uploading' || phase === 'executing' || phase === 'waiting';

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-800">ROC Processing Monitor</h3>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color} border ${config.border} rounded-full`}>
          {config.label}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Phase & Progress Hero */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-20 h-20 ${config.bg} rounded-full flex items-center justify-center mb-4 border-2 ${config.border}`}>
            <PhaseIcon className={`w-10 h-10 ${config.color}`} />
          </div>

          <h4 className={`text-lg font-semibold ${config.color} mb-1`}>{config.label}</h4>

          {isActive && (
            <p className="text-sm text-slate-500 max-w-sm">
              ROC is processing this deal. You will be notified through your configured channels when it completes.
            </p>
          )}

          {phase === 'complete' && (
            <p className="text-sm text-emerald-700">All processing completed successfully. Ready for next step.</p>
          )}

          {phase === 'failed' && (
            <p className="text-sm text-red-600">An error occurred. Review logs below for details.</p>
          )}
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Overall Progress</span>
              <span className="text-sm text-slate-700 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  phase === 'uploading' ? 'bg-blue-500' : 'bg-blue-700'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Time info strip */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Started</p>
            <p className="text-sm font-medium text-slate-700">{startedAt}</p>
          </div>
          <div className="px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Est. Remaining</p>
            <p className="text-sm font-medium text-slate-700">
              {phase === 'complete' ? 'Done' : phase === 'failed' ? '—' : `~${estimatedMinutes} min`}
            </p>
          </div>
        </div>

        {/* Notifications banner */}
        {isActive && (
          <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded mb-6">
            <Bell className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-700">Notifications enabled</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                You will be alerted through your selected channels when ROC completes or if an error occurs.
              </p>
            </div>
          </div>
        )}

        {/* Failure actions */}
        {phase === 'failed' && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={onEscalate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <UserCog className="w-4 h-4" />
              Escalate to ROC Admin
            </button>
          </div>
        )}

        {/* View Logs — prominent button */}
        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors mb-3"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">View Logs</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200 text-slate-600 rounded-full">
              {logs.length}
            </span>
          </div>
          {logsExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Logs table */}
        {logsExpanded && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mb-3">
            <div className="max-h-[200px] overflow-y-auto p-3 font-mono text-xs space-y-1">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-slate-500 flex-shrink-0">{log.timestamp}</span>
                  <span className={`flex-shrink-0 w-12 ${logLevelColors[log.level]}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-slate-700">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* "Open in external" action if user wants full ROC view */}
        <button
          onClick={onViewLogs}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Open full ROC dashboard (external)
        </button>
      </div>
    </div>
  );
}
