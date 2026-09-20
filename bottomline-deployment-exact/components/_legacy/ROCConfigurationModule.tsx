'use client';

import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, CreditCard, UserCircle, FileText, SlidersHorizontal } from 'lucide-react';

export interface ROCConfigState {
  payerProfile: 'existing' | 'create-new';
  payerProfileName: string;
  templateSelection: string;
  cardType: string;
  additionalParams: Record<string, string>;
}

interface ROCConfigurationModuleProps {
  state: ROCConfigState;
  onChange: (state: ROCConfigState) => void;
}

const additionalParamOptions: { id: string; label: string; options: string[] }[] = [
  { id: 'processingMode', label: 'Processing Mode', options: ['Standard', 'Express', 'Batch'] },
  { id: 'validationLevel', label: 'Validation Level', options: ['Basic', 'Enhanced', 'Full'] },
  { id: 'outputFormat', label: 'Output Format', options: ['Standard ROC', 'Extended', 'Custom'] },
];

export default function ROCConfigurationModule({ state, onChange }: ROCConfigurationModuleProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">ROC Configuration</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Payer Profile */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              <UserCircle className="w-3.5 h-3.5" /> Payer Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChange({ ...state, payerProfile: 'existing' })}
                className={`px-2.5 py-2 text-xs rounded border text-center transition-colors ${
                  state.payerProfile === 'existing'
                    ? 'border-blue-700/40 bg-blue-50 text-blue-800 font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Existing
              </button>
              <button
                onClick={() => onChange({ ...state, payerProfile: 'create-new' })}
                className={`px-2.5 py-2 text-xs rounded border text-center transition-colors ${
                  state.payerProfile === 'create-new'
                    ? 'border-blue-700/40 bg-blue-50 text-blue-800 font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Create New
              </button>
            </div>
            {state.payerProfile === 'create-new' && (
              <div className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-700">
                ⚠ Flagged for manual creation — will not auto-write to ROC/ROCK
              </div>
            )}
            {state.payerProfile === 'existing' && (
              <input
                type="text"
                value={state.payerProfileName}
                onChange={(e) => onChange({ ...state, payerProfileName: e.target.value })}
                placeholder="Search payer profile..."
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5" /> Template
            </label>
            <select
              value={state.templateSelection}
              onChange={(e) => onChange({ ...state, templateSelection: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            >
              <option value="">Select template...</option>
              <option value="template-a">Template A — Standard Payments</option>
              <option value="template-b">Template B — Card Processing</option>
              <option value="template-c">Template C — ACH / Check</option>
            </select>
          </div>

          {/* Card Type */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              <CreditCard className="w-3.5 h-3.5" /> Card Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Visa', 'MasterCard', 'Other'].map(type => (
                <button
                  key={type}
                  onClick={() => onChange({ ...state, cardType: type })}
                  className={`px-2 py-1.5 text-[11px] rounded border text-center transition-colors ${
                    state.cardType === type
                      ? 'border-blue-700/40 bg-blue-50 text-blue-800 font-medium'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Additional ROC Parameters */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Additional ROC Parameters
            </label>
            <div className="space-y-2 p-2.5 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              {additionalParamOptions.map(param => (
                <div key={param.id} className="space-y-1">
                  <label className="text-[10px] text-slate-500">{param.label}</label>
                  <select
                    value={state.additionalParams[param.id] || ''}
                    onChange={(e) =>
                      onChange({
                        ...state,
                        additionalParams: { ...state.additionalParams, [param.id]: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600/40"
                  >
                    <option value="">Select...</option>
                    {param.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
              <p className="text-[9px] text-slate-400 italic mt-1">
                Placeholder — additional parameters to be defined by Doug&apos;s team
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
