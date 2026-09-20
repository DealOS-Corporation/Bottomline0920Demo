'use client';

import { useState } from 'react';
import { Bell, ChevronDown, ChevronUp, Mail, MessageSquare, Monitor, AlertCircle, RotateCw, UserCog } from 'lucide-react';

export interface MonitoringAlertsState {
  notifyUploadComplete: boolean;
  notifyExecutionComplete: boolean;
  notifyExecutionFailed: boolean;
  alertChannels: ('inApp' | 'email' | 'teams')[];
  failureHandling: 'auto-logs' | 'prompt-logs' | 'retry' | 'escalate';
}

interface MonitoringAlertsModuleProps {
  state: MonitoringAlertsState;
  onChange: (state: MonitoringAlertsState) => void;
}

export default function MonitoringAlertsModule({ state, onChange }: MonitoringAlertsModuleProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleNotify = (key: 'notifyUploadComplete' | 'notifyExecutionComplete' | 'notifyExecutionFailed') => {
    onChange({ ...state, [key]: !state[key] });
  };

  const toggleChannel = (channel: 'inApp' | 'email' | 'teams') => {
    const channels = state.alertChannels.includes(channel)
      ? state.alertChannels.filter(c => c !== channel)
      : [...state.alertChannels, channel];
    onChange({ ...state, alertChannels: channels });
  };

  const notifyItems: { key: 'notifyUploadComplete' | 'notifyExecutionComplete' | 'notifyExecutionFailed'; label: string; description: string }[] = [
    { key: 'notifyUploadComplete', label: 'Upload complete', description: 'When files are successfully uploaded to ROC' },
    { key: 'notifyExecutionComplete', label: 'Execution complete', description: 'When ROC processing finishes' },
    { key: 'notifyExecutionFailed', label: 'Execution failed', description: 'When ROC encounters an error' },
  ];

  const channelItems: { key: 'inApp' | 'email' | 'teams'; label: string; icon: typeof Monitor; available: boolean }[] = [
    { key: 'inApp', label: 'In-app', icon: Monitor, available: true },
    { key: 'email', label: 'Email', icon: Mail, available: true },
    { key: 'teams', label: 'Teams / Slack', icon: MessageSquare, available: false },
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Monitoring & Alerts</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
        )}
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Notify When */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Notify When</label>
            <div className="space-y-1">
              {notifyItems.map(item => (
                <label
                  key={item.key}
                  className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                    state[item.key]
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={state[item.key]}
                    onChange={() => toggleNotify(item.key)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-700 accent-[#16345e] focus:ring-blue-600/30 focus:ring-offset-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-700">{item.label}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Alert Channel */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Alert Channel</label>
            <div className="grid grid-cols-3 gap-1.5">
              {channelItems.map(channel => {
                const ChannelIcon = channel.icon;
                const isSelected = state.alertChannels.includes(channel.key);
                return (
                  <button
                    key={channel.key}
                    onClick={() => channel.available && toggleChannel(channel.key)}
                    disabled={!channel.available}
                    className={`flex flex-col items-center gap-1 px-2 py-2 text-[10px] rounded-lg border text-center transition-all ${
                      !channel.available
                        ? 'opacity-40 cursor-not-allowed border-dashed border-slate-200 text-slate-400'
                        : isSelected
                          ? 'border-blue-700/40 bg-blue-50 text-blue-800 font-medium'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ChannelIcon className="w-3.5 h-3.5" />
                    <span>{channel.label}</span>
                    {!channel.available && <span className="text-[8px]">(soon)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Failure Handling */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Failure Handling</label>
            <div className="space-y-1.5">
              <button
                onClick={() => onChange({ ...state, failureHandling: 'auto-logs' })}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-all ${
                  state.failureHandling === 'auto-logs'
                    ? 'border-blue-700/40 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <AlertCircle className={`w-3.5 h-3.5 ${state.failureHandling === 'auto-logs' ? 'text-blue-700' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-medium text-slate-700">Auto-capture logs</span>
                  <p className="text-[10px] text-slate-500">Automatically grab error logs for review</p>
                </div>
              </button>
              <button
                onClick={() => onChange({ ...state, failureHandling: 'retry' })}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-all ${
                  state.failureHandling === 'retry'
                    ? 'border-blue-700/40 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${state.failureHandling === 'retry' ? 'text-blue-700' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-medium text-slate-700">Suggest Retry</span>
                  <p className="text-[10px] text-slate-500">Prompt to retry with current parameters</p>
                </div>
              </button>
              <button
                onClick={() => onChange({ ...state, failureHandling: 'escalate' })}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-left transition-all ${
                  state.failureHandling === 'escalate'
                    ? 'border-blue-700/40 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <UserCog className={`w-3.5 h-3.5 ${state.failureHandling === 'escalate' ? 'text-blue-700' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-medium text-slate-700">Escalate to ROC Admin</span>
                  <p className="text-[10px] text-slate-500">Flag for manual intervention</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
