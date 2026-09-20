'use client';

import { useState } from 'react';
import { Mail, Upload, Wifi, WifiOff, Shield, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';

export interface IntakeSourceState {
  sourceType: 'outlook' | 'manual';
  outlookStatus: 'connected' | 'disconnected';
  emailBody: string;
  attachments: string[];
}

interface IntakeSourceModuleProps {
  state: IntakeSourceState;
  onChange: (state: IntakeSourceState) => void;
}

export default function IntakeSourceModule({ state, onChange }: IntakeSourceModuleProps) {
  const [expanded, setExpanded] = useState(true);

  const handleSourceChange = (sourceType: 'outlook' | 'manual') => {
    onChange({ ...state, sourceType });
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">A · Intake Source</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Source Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Source</label>
            <div className="grid grid-cols-1 gap-2">
              {/* Outlook Push */}
              <button
                onClick={() => handleSourceChange('outlook')}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                  state.sourceType === 'outlook'
                    ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Mail className={`w-4 h-4 mt-0.5 ${state.sourceType === 'outlook' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700">Outlook Add-in "Send to Pricing Ops"</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Auto-import email body + attachments</div>
                </div>
              </button>

              {/* Manual Input */}
              <button
                onClick={() => handleSourceChange('manual')}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                  state.sourceType === 'manual'
                    ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Upload className={`w-4 h-4 mt-0.5 ${state.sourceType === 'manual' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700">Manual Paste + Drag Attachments</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Copy/paste email & drag files</div>
                </div>
              </button>
            </div>
          </div>

          {/* Outlook Connection Status */}
          {state.sourceType === 'outlook' && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs ${
                state.outlookStatus === 'connected'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-amber-50 border border-amber-200 text-amber-700'
              }`}>
                {state.outlookStatus === 'connected' ? (
                  <Wifi className="w-3.5 h-3.5" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5" />
                )}
                <span className="font-medium">
                  {state.outlookStatus === 'connected' ? 'Connected' : 'Not Connected'}
                </span>
                {state.outlookStatus === 'connected' && (
                  <span className="ml-auto text-[10px] text-green-600">nolan@bottomline.com</span>
                )}
              </div>

              {/* Permission note */}
              <div className="flex items-start gap-2 px-2.5 py-2 bg-slate-50 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  <span className="font-medium text-slate-600">Permissions:</span> Read-only · Specified senders only · Current email thread only
                </div>
              </div>
            </div>
          )}

          {/* Manual mode - paste area */}
          {state.sourceType === 'manual' && (
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-500">Email Body</label>
              <textarea
                value={state.emailBody}
                onChange={(e) => onChange({ ...state, emailBody: e.target.value })}
                placeholder="Paste email content here..."
                className="w-full h-20 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
              />

              {/* Drag & drop zone */}
              <div className="flex items-center justify-center gap-2 px-3 py-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Drag & drop attachments here</span>
              </div>

              {/* Mock attachments */}
              {state.attachments.length > 0 && (
                <div className="space-y-1">
                  {state.attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded text-xs text-slate-600">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      {file}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
