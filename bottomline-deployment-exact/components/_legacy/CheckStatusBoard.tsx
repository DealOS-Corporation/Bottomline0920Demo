'use client';

import { useState } from 'react';
import { ValidationCheck } from './ValidationChecksModule';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wrench,
  MessageSquare,
  Eye,
} from 'lucide-react';

// Result status for each check
export type CheckResult = 'green' | 'yellow' | 'red' | 'running' | 'pending';

export interface CheckResultItem {
  checkId: string;
  checkLabel: string;
  status: CheckResult;
  confidence: number;
  issues: string[];
  suggestedFixes: string[];
  clarificationQuestions: string[];
}

interface CheckStatusBoardProps {
  checks: ValidationCheck[];
  results: CheckResultItem[];
  onApplyFix: (checkId: string, fixIndex: number) => void;
  onDraftClarification: (checkId: string) => void;
}

const statusConfig: Record<CheckResult, { icon: typeof CheckCircle2; color: string; bg: string; label: string; border: string }> = {
  green: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Passed', border: 'border-emerald-500/30' },
  yellow: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Warning', border: 'border-amber-500/30' },
  red: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed', border: 'border-red-500/30' },
  running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Running', border: 'border-blue-500/30' },
  pending: { icon: Loader2, color: 'text-slate-400', bg: 'bg-slate-50/50', label: 'Pending', border: 'border-slate-200/60' },
};

function CheckCard({ result, onApplyFix, onDraftClarification }: {
  result: CheckResultItem;
  onApplyFix: (fixIndex: number) => void;
  onDraftClarification: () => void;
}) {
  const [expanded, setExpanded] = useState(result.status === 'yellow' || result.status === 'red');
  const config = statusConfig[result.status];
  const Icon = config.icon;
  const isRunning = result.status === 'running';

  return (
    <div className={`rounded-lg border ${config.border} overflow-hidden transition-all`}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${config.bg} hover:opacity-90 transition-colors`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className="text-sm font-medium text-slate-800 flex-1 text-left">{result.checkLabel}</span>
        <div className="flex items-center gap-2">
          {result.status !== 'pending' && result.status !== 'running' && (
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${config.bg} ${config.color}`}>
              {result.confidence}%
            </span>
          )}
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${config.bg} ${config.color} border ${config.border}`}>
            {config.label}
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (result.issues.length > 0 || result.suggestedFixes.length > 0 || result.clarificationQuestions.length > 0) && (
        <div className="px-4 py-3 space-y-3 bg-white">
          {/* Issues */}
          {result.issues.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Issues Found
              </h5>
              <ul className="space-y-1">
                {result.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-slate-400 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested fixes */}
          {result.suggestedFixes.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> Suggested Fixes
              </h5>
              <div className="space-y-1.5">
                {result.suggestedFixes.map((fix, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50/50 rounded-lg">
                    <span className="text-xs text-slate-400 flex-1">{fix}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onApplyFix(i); }}
                      className="px-2 py-0.5 text-[10px] font-medium bg-[#16345e] text-white rounded hover:bg-[#1d4373] transition-colors flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clarification questions */}
          {result.clarificationQuestions.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Needs Clarification
              </h5>
              <ul className="space-y-1 mb-2">
                {result.clarificationQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded">
                    <span className="text-amber-500 mt-0.5">?</span>
                    {q}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => { e.stopPropagation(); onDraftClarification(); }}
                className="w-full px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3 h-3" />
                Draft Clarification Email
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckStatusBoard({ checks, results, onApplyFix, onDraftClarification }: CheckStatusBoardProps) {
  // Summary counts
  const greenCount = results.filter(r => r.status === 'green').length;
  const yellowCount = results.filter(r => r.status === 'yellow').length;
  const redCount = results.filter(r => r.status === 'red').length;
  const runningCount = results.filter(r => r.status === 'running').length;
  const pendingCount = results.filter(r => r.status === 'pending').length;

  const enabledChecks = checks.filter(c => c.enabled);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-800">Check Status Board</h3>
          <span className="text-[10px] text-slate-500">
            {enabledChecks.length} checks enabled
          </span>
        </div>
        <div className="flex items-center gap-2">
          {greenCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> {greenCount}
            </span>
          )}
          {yellowCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {yellowCount}
            </span>
          )}
          {redCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/30 rounded-full">
              <XCircle className="w-3 h-3" /> {redCount}
            </span>
          )}
          {runningCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full">
              <Loader2 className="w-3 h-3" /> {runningCount}
            </span>
          )}
        </div>
      </div>

      {/* Check cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Eye className="w-8 h-8 mb-3 text-slate-700" />
            <p className="text-sm">Enable validation checks on the left, then run to see results</p>
          </div>
        ) : (
          results.map(result => (
            <CheckCard
              key={result.checkId}
              result={result}
              onApplyFix={(fixIdx) => onApplyFix(result.checkId, fixIdx)}
              onDraftClarification={() => onDraftClarification(result.checkId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
