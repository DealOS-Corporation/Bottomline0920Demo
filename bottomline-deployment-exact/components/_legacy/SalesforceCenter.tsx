'use client';

import { useState, useEffect } from 'react';
import {
  Cloud,
  CloudOff,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Download,
  Search,
  Filter,
  Link2,
  Shield,
  Clock,
  FileText,
} from 'lucide-react';

type SyncStatus = 'synced' | 'pending' | 'error' | 'skipped';

interface FieldMapping {
  id: string;
  sourceField: string;
  sourceValue: string;
  sfObject: string;
  sfField: string;
  syncStatus: SyncStatus;
  notes: string;
}

const mockFieldMappings: FieldMapping[] = [
  { id: '1', sourceField: 'Deal Name', sourceValue: 'Acme Corp - Payer Pricing', sfObject: 'Opportunity', sfField: 'Name', syncStatus: 'synced', notes: 'Auto-generated' },
  { id: '2', sourceField: 'Amount', sourceValue: '$254,600', sfObject: 'Opportunity', sfField: 'Amount', syncStatus: 'synced', notes: 'Annual contract value' },
  { id: '3', sourceField: 'Stage', sourceValue: 'Proposal', sfObject: 'Opportunity', sfField: 'StageName', syncStatus: 'synced', notes: 'Auto-set from workflow' },
  { id: '4', sourceField: 'Close Date', sourceValue: '2026-03-15', sfObject: 'Opportunity', sfField: 'CloseDate', syncStatus: 'synced', notes: 'Estimated' },
  { id: '5', sourceField: 'ROI Deck', sourceValue: 'roi_deck_v3.pptx', sfObject: 'Attachment', sfField: 'File', syncStatus: 'synced', notes: 'Auto-attached' },
  { id: '6', sourceField: 'Value Statement', sourceValue: 'value_statement_v2.xlsx', sfObject: 'Attachment', sfField: 'File', syncStatus: 'synced', notes: 'Auto-attached' },
  { id: '7', sourceField: 'Card Type', sourceValue: 'Visa', sfObject: 'Custom Field', sfField: 'Card_Type__c', syncStatus: 'synced', notes: 'From processing output' },
  { id: '8', sourceField: 'Campaign Targets', sourceValue: '1,245', sfObject: 'Custom Field', sfField: 'Target_Count__c', syncStatus: 'synced', notes: 'Classified vendors' },
  { id: '9', sourceField: 'Rebate Rate', sourceValue: '1.95%', sfObject: 'Custom Field', sfField: 'Rebate_Rate__c', syncStatus: 'synced', notes: 'Blended avg' },
  { id: '10', sourceField: 'Channel', sourceValue: 'Bank of America', sfObject: 'Opportunity', sfField: 'Channel__c', syncStatus: 'synced', notes: 'From intake' },
  { id: '11', sourceField: 'Conversion Rate', sourceValue: '12.0%', sfObject: 'Custom Field', sfField: 'Conversion_Rate__c', syncStatus: 'pending', notes: 'Pending custom field creation' },
  { id: '12', sourceField: 'ARR Value', sourceValue: '$254,600', sfObject: 'Custom Field', sfField: 'ARR__c', syncStatus: 'pending', notes: 'Pending custom field creation' },
  { id: '13', sourceField: 'Priority', sourceValue: 'High', sfObject: 'Opportunity', sfField: 'Priority__c', syncStatus: 'synced', notes: 'Auto-mapped' },
  { id: '14', sourceField: 'Win Probability', sourceValue: '72%', sfObject: 'Opportunity', sfField: 'Probability', syncStatus: 'error', notes: 'Field type mismatch' },
  { id: '15', sourceField: 'Industry Code', sourceValue: 'NAICS-5112', sfObject: 'Account', sfField: 'Industry_Code__c', syncStatus: 'skipped', notes: 'Custom field not exists' },
];

const syncStatusConfig: Record<SyncStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  synced: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Synced' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Pending' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Error' },
  skipped: { icon: AlertTriangle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', label: 'Skipped' },
};

export default function SalesforceCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SyncStatus | 'all'>('all');
  const [syncProgress, setSyncProgress] = useState(87);

  const filteredMappings = mockFieldMappings.filter(m => {
    if (filterStatus !== 'all' && m.syncStatus !== filterStatus) return false;
    if (searchQuery && !m.sourceField.toLowerCase().includes(searchQuery.toLowerCase()) && !m.sfField.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const syncedCount = mockFieldMappings.filter(m => m.syncStatus === 'synced').length;
  const pendingCount = mockFieldMappings.filter(m => m.syncStatus === 'pending').length;
  const errorCount = mockFieldMappings.filter(m => m.syncStatus === 'error').length;
  const totalFields = mockFieldMappings.length;

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">Salesforce Field Sync</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Salesforce Sync</span>
      </div>

      {/* Connection Status & Progress */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-4">
        {/* Connection indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs font-medium text-emerald-700">Connected to Production</span>
          <Shield className="w-3 h-3 text-emerald-500" />
        </div>

        {/* Sync progress */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">Sync Progress</span>
              <span className="text-xs font-semibold text-slate-800">{syncedCount}/{totalFields} fields</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${(syncedCount / totalFields) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status counts */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" />{syncedCount}</span>
          <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3 h-3" />{pendingCount}</span>
          <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3 h-3" />{errorCount}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['all', 'synced', 'pending', 'error', 'skipped'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Field Mapping Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Source Field</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Value</th>
              <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">SF Object</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">SF Field</th>
              <th className="text-center py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredMappings.map(mapping => {
              const statusCfg = syncStatusConfig[mapping.syncStatus];
              const StatusIcon = statusCfg.icon;

              return (
                <tr key={mapping.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  mapping.syncStatus === 'error' ? 'bg-red-50/20' : mapping.syncStatus === 'pending' ? 'bg-amber-50/20' : ''
                }`}>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{mapping.sourceField}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">{mapping.sourceValue}</td>
                  <td className="py-2.5 px-3 text-center">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-600">{mapping.sfObject}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 font-mono text-xs">{mapping.sfField}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">{mapping.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400">
            Showing {filteredMappings.length} of {totalFields} fields (of 142 total in full sync)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Failed
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#16345e] rounded hover:bg-[#1d4373]">
            <Cloud className="w-3.5 h-3.5" />
            Sync Now
          </button>
        </div>
      </div>

      {/* Audit Log (collapsed) */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
        <details className="group">
          <summary className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700">
            <FileText className="w-3 h-3" />
            Sync Audit Log
            <span className="text-[10px] text-slate-400">(last 5 events)</span>
          </summary>
          <div className="mt-2 space-y-1 pl-5">
            {[
              { time: '10:45:30', msg: 'Synced 12 Opportunity fields to Production', level: 'success' },
              { time: '10:45:28', msg: 'Attached roi_deck_v3.pptx to Opportunity', level: 'success' },
              { time: '10:45:25', msg: 'Field type mismatch: Win Probability (text vs number)', level: 'error' },
              { time: '10:45:22', msg: 'Created custom field mapping for Card_Type__c', level: 'success' },
              { time: '10:45:20', msg: 'API connection established to Production org', level: 'success' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400 font-mono">{log.time}</span>
                <span className={log.level === 'error' ? 'text-red-600' : 'text-slate-600'}>{log.msg}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
