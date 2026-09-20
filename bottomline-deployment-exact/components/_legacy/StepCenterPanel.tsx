'use client';

import { useState } from 'react';
import { ValidationCheck } from './ValidationChecksModule';
import { CheckResultItem } from './CheckStatusBoard';
import {
  Eye,
  ClipboardCheck,
  Table,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// ── Preview table data ──
export interface PreviewTableData {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
}

interface StepCenterPanelProps {
  stepId: string;
  stepLabel: string;
  // Check results
  checks: ValidationCheck[];
  checkResults: CheckResultItem[];
  onApplyFix: (checkId: string, fixIndex: number) => void;
  onDraftClarification: (checkId: string) => void;
  // Preview data
  previewTable: PreviewTableData;
}

export default function StepCenterPanel({
  stepId,
  stepLabel,
  checks,
  checkResults,
  onApplyFix,
  onDraftClarification,
  previewTable,
}: StepCenterPanelProps) {
  const [activeTab, setActiveTab] = useState<'checks' | 'preview'>('checks');

  // Summary counts
  const greenCount = checkResults.filter(r => r.status === 'green').length;
  const yellowCount = checkResults.filter(r => r.status === 'yellow').length;
  const redCount = checkResults.filter(r => r.status === 'red').length;

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Tab header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-gradient-header">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('checks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'checks'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Check Results
            {/* Mini summary badges */}
            {checkResults.length > 0 && (
              <span className="flex items-center gap-1 ml-1">
                {greenCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {yellowCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                {redCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            <Table className="w-4 h-4" />
            Data Preview
          </button>
        </div>
        {/* Step context label */}
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
          {stepLabel}
        </span>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'checks' ? (
          <CheckResultsTab
            checks={checks}
            checkResults={checkResults}
            onApplyFix={onApplyFix}
            onDraftClarification={onDraftClarification}
          />
        ) : (
          <DataPreviewTab previewTable={previewTable} />
        )}
      </div>
    </div>
  );
}

// ── Check Results Tab ──
function CheckResultsTab({
  checks,
  checkResults,
  onApplyFix,
  onDraftClarification,
}: {
  checks: ValidationCheck[];
  checkResults: CheckResultItem[];
  onApplyFix: (checkId: string, fixIndex: number) => void;
  onDraftClarification: (checkId: string) => void;
}) {
  const greenCount = checkResults.filter(r => r.status === 'green').length;
  const yellowCount = checkResults.filter(r => r.status === 'yellow').length;
  const redCount = checkResults.filter(r => r.status === 'red').length;

  return (
    <div className="h-full flex flex-col">
      {/* Summary bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
        <span className="text-xs text-slate-500">{checkResults.length} checks</span>
        <div className="flex items-center gap-2">
          {greenCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-700">
              <CheckCircle2 className="w-3 h-3" /> {greenCount} passed
            </span>
          )}
          {yellowCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700">
              <AlertTriangle className="w-3 h-3" /> {yellowCount} warnings
            </span>
          )}
          {redCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-red-700">
              <XCircle className="w-3 h-3" /> {redCount} failed
            </span>
          )}
        </div>
      </div>
      {/* Check cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {checkResults.map(result => (
          <CheckCard
            key={result.checkId}
            result={result}
            onApplyFix={(fixIdx) => onApplyFix(result.checkId, fixIdx)}
            onDraftClarification={() => onDraftClarification(result.checkId)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Inline CheckCard (same as CheckStatusBoard but reused) ──
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Wrench,
  MessageSquare,
} from 'lucide-react';

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string; border: string }> = {
  green: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Passed', border: 'border-green-200' },
  yellow: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Warning', border: 'border-amber-200' },
  red: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed', border: 'border-red-200' },
  running: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Running', border: 'border-blue-200' },
  pending: { icon: Loader2, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Pending', border: 'border-slate-200' },
};

function CheckCard({ result, onApplyFix, onDraftClarification }: {
  result: CheckResultItem;
  onApplyFix: (fixIndex: number) => void;
  onDraftClarification: () => void;
}) {
  const [expanded, setExpanded] = useState(result.status === 'yellow' || result.status === 'red');
  const config = statusConfig[result.status] || statusConfig.pending;
  const Icon = config.icon;
  const isRunning = result.status === 'running';

  return (
    <div className={`rounded-lg border ${config.border} overflow-hidden transition-all`}>
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
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {expanded && (result.issues.length > 0 || result.suggestedFixes.length > 0 || result.clarificationQuestions.length > 0) && (
        <div className="px-4 py-3 space-y-3 bg-white">
          {result.issues.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Issues Found
              </h5>
              <ul className="space-y-1">
                {result.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-slate-400 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestedFixes.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> Suggested Fixes
              </h5>
              <div className="space-y-1.5">
                {result.suggestedFixes.map((fix, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-600 flex-1">{fix}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onApplyFix(i); }}
                      className="px-2 py-0.5 text-[10px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.clarificationQuestions.length > 0 && (
            <div>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Needs Clarification
              </h5>
              <ul className="space-y-1 mb-2">
                {result.clarificationQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded">
                    <span className="text-amber-500 mt-0.5">?</span>
                    {q}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => { e.stopPropagation(); onDraftClarification(); }}
                className="w-full px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-1.5"
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

// ── Data Preview Tab — clean Excel-style table ──
function DataPreviewTab({ previewTable }: { previewTable: PreviewTableData }) {
  return (
    <div className="h-full flex flex-col">
      {/* Table info bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-800">{previewTable.title}</span>
          <span className="text-xs text-slate-400 ml-2">{previewTable.subtitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Excel-style table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 w-10">
                #
              </th>
              {previewTable.headers.map((header, i) => (
                <th
                  key={i}
                  className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewTable.rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                <td className="py-2 px-4 text-xs text-slate-400 border-r border-slate-100 font-mono">
                  {i + 1}
                </td>
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-4 text-slate-700 border-r border-slate-100 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {previewTable.rows.length} rows × {previewTable.headers.length} columns
        </span>
        <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Data validated
        </span>
      </div>
    </div>
  );
}
