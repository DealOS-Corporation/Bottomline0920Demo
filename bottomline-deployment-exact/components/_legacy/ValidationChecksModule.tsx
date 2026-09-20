'use client';

import { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export interface ValidationCheck {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: string;
}

export interface ValidationChecksState {
  checks: ValidationCheck[];
}

interface ValidationChecksModuleProps {
  state: ValidationChecksState;
  onChange: (state: ValidationChecksState) => void;
}

const categoryColors: Record<string, { dot: string; bg: string }> = {
  completeness: { dot: 'bg-red-500', bg: 'bg-red-50' },
  ambiguity: { dot: 'bg-amber-500', bg: 'bg-amber-50' },
  mapping: { dot: 'bg-blue-600', bg: 'bg-blue-50' },
  shape: { dot: 'bg-slate-500', bg: 'bg-slate-50' },
  multifile: { dot: 'bg-cyan-600', bg: 'bg-cyan-50' },
  aggregation: { dot: 'bg-emerald-600', bg: 'bg-emerald-50' },
  address: { dot: 'bg-orange-500', bg: 'bg-orange-50' },
  payment: { dot: 'bg-[#16345e]', bg: 'bg-slate-50' },
};

export default function ValidationChecksModule({ state, onChange }: ValidationChecksModuleProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleCheck = (checkId: string) => {
    onChange({
      checks: state.checks.map(c =>
        c.id === checkId ? { ...c, enabled: !c.enabled } : c
      ),
    });
  };

  const enabledCount = state.checks.filter(c => c.enabled).length;

  const toggleAll = () => {
    const allEnabled = state.checks.every(c => c.enabled);
    onChange({
      checks: state.checks.map(c => ({ ...c, enabled: !allEnabled })),
    });
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">C · Validation Checks</span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-200 text-emerald-800 rounded-full">
            {enabledCount}/{state.checks.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-2">
          {/* Select All toggle */}
          <button
            onClick={toggleAll}
            className="text-[10px] text-slate-500 hover:text-slate-700 underline"
          >
            {state.checks.every(c => c.enabled) ? 'Deselect All' : 'Select All'}
          </button>

          {/* Check list */}
          <div className="space-y-1">
            {state.checks.map(check => {
              const color = categoryColors[check.category] || { dot: 'bg-slate-400', bg: 'bg-slate-50' };
              return (
                <label
                  key={check.id}
                  className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                    check.enabled
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={check.enabled}
                    onChange={() => toggleCheck(check.id)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 focus:ring-offset-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                      <span className="text-xs font-medium text-slate-700">{check.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{check.description}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Output note */}
          <div className="px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Each check produces: <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Green</span> · <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Yellow</span> · <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Red</span> + explanation + confidence %
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
