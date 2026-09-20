'use client';

import { StepSchema } from '@/lib/stepsSchema';
import { 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Building,
  Filter
} from 'lucide-react';
import { useState } from 'react';

interface ReviewPanelProps {
  step: StepSchema | undefined;
}

// Mock exception data
const mockExceptions = [
  { 
    id: 'exc-1', 
    vendor: 'Acme Corporation', 
    amount: 125000, 
    reason: 'Amount exceeds standard threshold',
    risk: 'medium',
    category: 'Spend Variance'
  },
  { 
    id: 'exc-2', 
    vendor: 'TechGlobal Inc', 
    amount: 89500, 
    reason: 'New vendor - requires verification',
    risk: 'high',
    category: 'New Vendor'
  },
  { 
    id: 'exc-3', 
    vendor: 'DataSystems Ltd', 
    amount: 215000, 
    reason: 'Pricing deviation from benchmark',
    risk: 'medium',
    category: 'Pricing'
  },
  { 
    id: 'exc-4', 
    vendor: 'CloudServices Pro', 
    amount: 67800, 
    reason: 'Missing industry classification',
    risk: 'low',
    category: 'Data Quality'
  },
];

const riskColors = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-100 text-red-400' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
  low: { bg: 'bg-slate-50/50', border: 'border-slate-200/60', text: 'text-slate-400', badge: 'bg-slate-100 text-slate-400' },
};

export default function ReviewPanel({ step }: ReviewPanelProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  if (!step) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/60 h-full flex items-center justify-center">
        <span className="text-slate-400 text-sm">No step selected</span>
      </div>
    );
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === filteredExceptions.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredExceptions.map(e => e.id)));
    }
  };

  const filteredExceptions = filter === 'all' 
    ? mockExceptions 
    : mockExceptions.filter(e => e.risk === filter);

  const totalAmount = filteredExceptions.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-800">Exceptions for Review</h3>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-400">
            {mockExceptions.length} Items
          </span>
        </div>
        
        {/* Stats bar */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-400">High: {mockExceptions.filter(e => e.risk === 'high').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Medium: {mockExceptions.filter(e => e.risk === 'medium').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-slate-400">Low: {mockExceptions.filter(e => e.risk === 'low').length}</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200/60 rounded px-2 py-1 text-slate-400"
          >
            <option value="all">All Risks</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
        
        <button 
          onClick={selectAll}
          className="text-xs text-blue-400 hover:text-blue-700"
        >
          {selectedItems.size === filteredExceptions.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Exception list */}
      <div className="flex-1 overflow-auto">
        {filteredExceptions.map((exception) => {
          const colors = riskColors[exception.risk as keyof typeof riskColors];
          const isExpanded = expandedItem === exception.id;
          const isSelected = selectedItems.has(exception.id);
          
          return (
            <div 
              key={exception.id}
              className={`border-b border-slate-100 last:border-0 ${isSelected ? 'bg-blue-50/50' : ''}`}
            >
              <div 
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedItem(isExpanded ? null : exception.id)}
              >
                {/* Checkbox */}
                <input 
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(exception.id);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-400 focus:ring-blue-500"
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {exception.vendor}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colors.badge}`}>
                      {exception.risk.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{exception.reason}</p>
                </div>
                
                {/* Amount */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <DollarSign className="w-3.5 h-3.5" />
                    {exception.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">{exception.category}</span>
                </div>
                
                {/* Expand icon */}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
              
              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-3 pl-11">
                  <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <p className="text-xs text-slate-400 mb-3">{exception.reason}</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-slate-900 rounded hover:bg-emerald-700 transition-colors flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200/60 text-slate-400 rounded hover:bg-slate-50 transition-colors flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Flag for Review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {selectedItems.size} of {filteredExceptions.length} selected
          <span className="mx-2">|</span>
          Total: <span className="font-semibold text-slate-700">${totalAmount.toLocaleString()}</span>
        </div>
        <button 
          disabled={selectedItems.size === 0}
          className="px-4 py-1.5 text-xs font-medium bg-emerald-600 text-slate-900 rounded hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve Selected ({selectedItems.size})
        </button>
      </div>
    </div>
  );
}
