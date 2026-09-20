'use client';

import { StepSchema } from '@/lib/stepsSchema';
import { 
  Table, 
  Download, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { useState } from 'react';

interface DataPreviewPanelProps {
  step: StepSchema | undefined;
}

// Mock data based on step
const mockDataByStep: Record<string, { headers: string[]; rows: (string | number)[][] }> = {
  'intake': {
    headers: ['Payer', 'Request Type', 'Amount', 'Status', 'Missing Fields'],
    rows: [
      ['Acme Corp', 'New Pricing', '$125,000', 'Valid', '—'],
      ['TechStart Inc', 'Renewal', '$89,500', 'Valid', '—'],
      ['Global Systems', 'New Pricing', '$245,000', 'Flagged', 'Industry Code'],
      ['DataPro LLC', 'Expansion', '$67,800', 'Valid', '—'],
      ['CloudServ', 'New Pricing', '$312,000', 'Flagged', 'Contact Email'],
    ],
  },
  'campaign-classification': {
    headers: ['Vendor', 'Industry', 'Campaign Type', 'Confidence', 'Excluded?'],
    rows: [
      ['Acme Corp', 'Technology', 'Premium', '98%', 'No'],
      ['TechStart Inc', 'SaaS', 'Card', '95%', 'No'],
      ['Global Systems', 'Manufacturing', 'Card', '91%', 'No'],
      ['DataPro LLC', 'Services', 'ACH', '84%', 'No'],
      ['CloudServ', 'Technology', 'Premium', '96%', 'No'],
    ],
  },
  'external-roi': {
    headers: ['Slide', 'Title', 'Content Type', 'Template', 'Status'],
    rows: [
      ['1', 'Executive Summary', 'Overview', 'Channel-Specific', 'Complete'],
      ['2', 'ROI Projection', 'Financial Model', 'Standard', 'Complete'],
      ['3', 'Cost Savings', 'Table', 'Standard', 'Complete'],
      ['4', 'Card Rebates', 'Chart', 'Channel-Specific', 'Complete'],
      ['5', 'Next Steps', 'CTA', 'Channel-Specific', 'Complete'],
    ],
  },
};

const defaultData = {
  headers: ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'],
  rows: [
    ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'],
    ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'],
    ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'],
  ],
};

export default function DataPreviewPanel({ step }: DataPreviewPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

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
            <Table className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-700 mb-2">No Data Yet</h4>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            Run the step to generate data preview. Use the actions on the left to get started.
          </p>
        </div>
      </div>
    );
  }

  const data = mockDataByStep[step.id] || defaultData;
  const totalRows = data.rows.length;
  const flaggedCount = data.rows.filter(row => row.includes('Flagged')).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-800">{step.label} Data</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-400 rounded-full">
              {totalRows} rows
            </span>
            {flaggedCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {flaggedCount} flagged
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>
          <button className="px-3 py-2 text-sm text-slate-400 border border-slate-200/60 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50 sticky top-0">
            <tr>
              {data.headers.map((header, idx) => (
                <th 
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200/60"
                >
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => {
              const isFlagged = row.includes('Flagged');
              
              return (
                <tr 
                  key={rowIdx}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isFlagged ? 'bg-amber-50/50' : ''}`}
                >
                  {row.map((cell, colIdx) => {
                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;
                    const cellValue = String(cell);
                    const isFlaggedCell = cellValue === 'Flagged';
                    const isValidCell = cellValue === 'Valid';
                    const isCheckmark = cellValue === '—';
                    
                    return (
                      <td 
                        key={colIdx}
                        className="px-4 py-3 text-sm text-slate-700"
                        onDoubleClick={() => setEditingCell({ row: rowIdx, col: colIdx })}
                      >
                        {isEditing ? (
                          <input 
                            type="text"
                            defaultValue={cellValue}
                            autoFocus
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        ) : isFlaggedCell ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                            {cellValue}
                          </span>
                        ) : isValidCell ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-400 rounded">
                            {cellValue}
                          </span>
                        ) : isCheckmark ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          cellValue
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <button className="p-1 text-slate-400 hover:text-slate-400 hover:bg-slate-100 rounded transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="px-4 py-3 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing {totalRows} of {totalRows} records
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded border border-slate-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 px-2">Page {currentPage} of 1</span>
          <button 
            disabled={currentPage === 1}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded border border-slate-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
