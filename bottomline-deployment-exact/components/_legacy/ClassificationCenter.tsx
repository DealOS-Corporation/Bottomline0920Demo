'use client';

import { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Flag,
} from 'lucide-react';

interface ClassificationRow {
  id: string;
  vendor: string;
  industry: string;
  campaignType: string;
  confidence: number;
  excluded: boolean;
  excludeReason?: string;
  revenue: string;
  entityMatch: 'Exact' | 'Fuzzy' | 'None';
  overrideStatus: 'none' | 'pending' | 'approved';
}

// Mock classification data
const mockClassifications: ClassificationRow[] = [
  { id: 'V-10001', vendor: 'Office Supplies Co.', industry: 'Retail', campaignType: 'Card', confidence: 96, excluded: false, revenue: '$24M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10002', vendor: 'Tech Solutions Inc.', industry: 'Technology', campaignType: 'Premium', confidence: 98, excluded: false, revenue: '$480M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10003', vendor: 'Industrial Parts LLC', industry: 'Manufacturing', campaignType: 'Card', confidence: 91, excluded: false, revenue: '$89M', entityMatch: 'Fuzzy', overrideStatus: 'none' },
  { id: 'V-10004', vendor: 'Marketing Agency Pro', industry: 'Services', campaignType: 'ACH', confidence: 84, excluded: false, revenue: '$12M', entityMatch: 'Fuzzy', overrideStatus: 'pending' },
  { id: 'V-10005', vendor: 'Logistics Partners', industry: 'Transportation', campaignType: 'Card', confidence: 95, excluded: false, revenue: '$312M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10006', vendor: 'Adult Entertain Corp', industry: 'Entertainment', campaignType: 'N/A', confidence: 99, excluded: true, excludeReason: 'restricted-adult', revenue: '$8M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10007', vendor: 'Green Energy Ltd', industry: 'Energy', campaignType: 'Premium', confidence: 92, excluded: false, revenue: '$67M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10008', vendor: 'Casino Gaming LLC', industry: 'Gambling', campaignType: 'N/A', confidence: 97, excluded: true, excludeReason: 'restricted-gambling', revenue: '$45M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10009', vendor: 'Cloud Services Corp', industry: 'Technology', campaignType: 'Premium', confidence: 96, excluded: false, revenue: '$156M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10010', vendor: 'Regional Insurance Co', industry: 'Insurance', campaignType: 'N/A', confidence: 94, excluded: true, excludeReason: 'restricted-insurance', revenue: '$220M', entityMatch: 'Exact', overrideStatus: 'none' },
  { id: 'V-10011', vendor: 'Data Analytics Inc', industry: 'Technology', campaignType: 'Card', confidence: 78, excluded: false, revenue: '$34M', entityMatch: 'Fuzzy', overrideStatus: 'pending' },
  { id: 'V-10012', vendor: 'Healthcare Partners', industry: 'Healthcare', campaignType: 'ACH', confidence: 88, excluded: false, revenue: '$145M', entityMatch: 'Exact', overrideStatus: 'none' },
];

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 80 ? 'bg-blue-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = value >= 90 ? 'text-emerald-700' : value >= 80 ? 'text-blue-700' : value >= 70 ? 'text-amber-700' : 'text-red-700';
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-semibold ${textColor}`}>{value}%</span>
    </div>
  );
}

export default function ClassificationCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterView, setFilterView] = useState<'all' | 'flagged' | 'excluded' | 'low-conf'>('all');
  const [classifications, setClassifications] = useState(mockClassifications);

  const filteredRows = classifications.filter(row => {
    if (filterView === 'flagged') return row.overrideStatus === 'pending';
    if (filterView === 'excluded') return row.excluded;
    if (filterView === 'low-conf') return row.confidence < 85;
    return true;
  }).filter(row => 
    searchQuery === '' || row.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || row.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = classifications.length;
  const excludedCount = classifications.filter(c => c.excluded).length;
  const lowConfCount = classifications.filter(c => c.confidence < 85).length;
  const flaggedCount = classifications.filter(c => c.overrideStatus === 'pending').length;
  const avgConfidence = Math.round(classifications.reduce((sum, c) => sum + c.confidence, 0) / totalCount);

  const handleToggleExclude = (id: string) => {
    setClassifications(prev => prev.map(c => c.id === id ? { ...c, excluded: !c.excluded, excludeReason: c.excluded ? undefined : 'manual-override' } : c));
  };

  const handleApproveCampaign = (id: string, type: string) => {
    setClassifications(prev => prev.map(c => c.id === id ? { ...c, campaignType: type, overrideStatus: 'approved' as const } : c));
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">Classification Results</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Campaign Classification</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-4">
        <span className="text-xs text-slate-500">{totalCount} vendors classified</span>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs text-slate-600">Avg conf: <span className="font-semibold">{avgConfidence}%</span></span>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs text-red-600">{excludedCount} excluded</span>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs text-amber-600">{lowConfCount} low confidence</span>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs text-blue-600">{flaggedCount} pending review</span>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors or industries..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {([
            { id: 'all', label: 'All' },
            { id: 'flagged', label: `Flagged (${flaggedCount})` },
            { id: 'excluded', label: `Excluded (${excludedCount})` },
            { id: 'low-conf', label: `Low Conf (${lowConfCount})` },
          ] as const).map(f => (
            <button
              key={f.id}
              onClick={() => setFilterView(f.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterView === f.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Campaign Type</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
              <th className="text-center py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Excluded</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
              <th className="text-center py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Match</th>
              <th className="text-center py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                row.excluded ? 'bg-red-50/30' : row.overrideStatus === 'pending' ? 'bg-amber-50/30' : ''
              }`}>
                <td className="py-2.5 px-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.vendor}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{row.id}</p>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-sm text-slate-700">{row.industry}</td>
                <td className="py-2.5 px-4">
                  {row.excluded ? (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-50 text-red-600 border border-red-200">N/A</span>
                  ) : (
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                      row.campaignType === 'Premium' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      row.campaignType === 'Card' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>{row.campaignType}</span>
                  )}
                </td>
                <td className="py-2.5 px-4"><ConfidenceBar value={row.confidence} /></td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    onClick={() => handleToggleExclude(row.id)}
                    title={row.excluded ? 'Click to include' : 'Click to exclude'}
                  >
                    {row.excluded ? (
                      <div className="flex flex-col items-center">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-[9px] text-red-500 mt-0.5">{row.excludeReason?.replace('restricted-', '')}</span>
                      </div>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                  </button>
                </td>
                <td className="py-2.5 px-4 text-sm text-slate-700">{row.revenue}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    row.entityMatch === 'Exact' ? 'bg-green-50 text-green-700' :
                    row.entityMatch === 'Fuzzy' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>{row.entityMatch}</span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  {row.overrideStatus === 'pending' ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        onClick={() => handleApproveCampaign(row.id, 'Card')}
                        className="px-2 py-0.5 text-[10px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleToggleExclude(row.id)}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                      >
                        Exclude
                      </button>
                    </div>
                  ) : row.overrideStatus === 'approved' ? (
                    <span className="text-[10px] text-green-600 font-medium">Approved</span>
                  ) : (
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Showing {filteredRows.length} of {totalCount} vendors
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">
            Card: {classifications.filter(c => c.campaignType === 'Card' && !c.excluded).length} •
            ACH: {classifications.filter(c => c.campaignType === 'ACH' && !c.excluded).length} •
            Premium: {classifications.filter(c => c.campaignType === 'Premium' && !c.excluded).length}
          </span>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <RefreshCw className="w-3 h-3" />
            Re-classify All
          </button>
        </div>
      </div>
    </div>
  );
}
