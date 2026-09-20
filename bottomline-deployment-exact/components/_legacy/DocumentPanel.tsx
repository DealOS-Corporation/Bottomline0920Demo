'use client';

import { StepSchema, StepStatus } from '@/lib/stepsSchema';
import { 
  FileText, 
  Download, 
  Edit3, 
  RefreshCw,
  CheckCircle,
  FileCheck,
  Eye
} from 'lucide-react';
import { useState } from 'react';

interface DocumentPanelProps {
  step: StepSchema | undefined;
}

export default function DocumentPanel({ step }: DocumentPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!step) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/60 h-full flex items-center justify-center">
        <span className="text-slate-400 text-sm">No step selected</span>
      </div>
    );
  }

  // If step hasn't run yet, show placeholder
  if (step.status === 'not-started') {
    return (
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden h-full flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{step.label}</h3>
          <p className="text-sm text-slate-500 mt-1">{step.description}</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-700 mb-2">Ready to Generate</h4>
          <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
            Click "Generate Statement" to create your value statement document based on the deal data.
          </p>
          <button className="px-4 py-2 bg-[#16345e] text-white text-sm font-medium rounded hover:bg-[#1d4373] transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Statement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-800">Value Statement</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-400 rounded-full">
              Generated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">value_statement_acme_2026.pdf</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition-colors ${isEditing ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document preview */}
      <div className="flex-1 overflow-auto p-5 bg-slate-50/50">
        <div className={`bg-white rounded-lg shadow-sm border border-slate-200/60 p-8 max-w-2xl mx-auto ${isEditing ? 'ring-2 ring-blue-200' : ''}`}>
          {/* Document header */}
          <div className="text-center border-b border-slate-100 pb-6 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-900 font-bold text-lg">BL</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-1">Value Statement</h1>
            <p className="text-sm text-slate-500">Prepared for Acme Corporation</p>
            <p className="text-xs text-slate-400 mt-1">January 23, 2026</p>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Executive Summary</h2>
            <p className={`text-sm text-slate-400 leading-relaxed ${isEditing ? 'bg-yellow-50 p-2 rounded' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
              Based on our comprehensive analysis of your payment processing data, we have identified significant opportunities for cost optimization and operational efficiency. Our platform can deliver an estimated <strong className="text-slate-800">$2.4M</strong> in annual savings through streamlined payment processing and vendor consolidation.
            </p>
          </div>

          {/* Key Findings */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Key Findings</h2>
            <div className="space-y-3">
              {[
                { metric: 'Total Spend Analyzed', value: '$45.2M', change: '' },
                { metric: 'Identified Savings', value: '$2.4M', change: '+5.3%' },
                { metric: 'Vendor Consolidation', value: '34 �?12', change: '-65%' },
                { metric: 'Processing Time', value: '2.1 days', change: '-78%' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-400">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                    {item.change && (
                      <span className={`text-xs px-1.5 py-0.5 rounded tnum ${item.change.startsWith('+') || item.change.startsWith('-') && item.metric !== 'Identified Savings' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {item.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Section */}
          <div className="bg-emerald-50 rounded-md p-4 border border-emerald-200">
            <h2 className="text-sm font-semibold text-emerald-900 mb-3">Projected ROI</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-800 tnum">340%</p>
                <p className="text-xs text-emerald-700">3-Year ROI</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-800 tnum">8</p>
                <p className="text-xs text-emerald-700">Months to Payback</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">$7.2M</p>
                <p className="text-xs text-emerald-400">Total Value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-slate-200/60 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200/60 text-slate-400 rounded-lg hover:bg-slate-50 transition-colors">
            Save as Draft
          </button>
          <button className="px-4 py-1.5 text-xs font-medium bg-emerald-600 text-slate-900 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Approve & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
