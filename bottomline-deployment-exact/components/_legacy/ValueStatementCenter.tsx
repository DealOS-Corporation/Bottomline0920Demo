'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calculator,
  DollarSign,
  TrendingUp,
  BarChart3,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Table,
  Layers,
  Tag,
} from 'lucide-react';
import PricingRecommendationTab from './PricingRecommendationTab';

type TabId = 'summary' | 'pricing' | 'booking' | 'arr';

// Mock value statement data
const summaryMetrics = [
  { label: 'Total Addressable Vendors', value: '1,245', detail: 'After exclusions' },
  { label: 'Estimated Card Volume', value: '$145M', detail: 'Annual card-eligible spend' },
  { label: 'Projected Rebate Revenue', value: '$2.4M', detail: 'Year 1 estimate' },
  { label: 'ARR Booking Value', value: '$254,600', detail: 'Annual recurring revenue' },
  { label: 'Conversion Rate Applied', value: '12.0%', detail: 'Based on historical avg' },
  { label: 'ROI Payback Period', value: '4.2 months', detail: 'Break-even estimate' },
];

const bookingCalcRows = [
  { metric: 'Total Spend Analyzed', current: '$892M', year1: '$892M', year2: '$892M', year3: '$892M' },
  { metric: 'Card-Eligible Spend', current: '$0', year1: '$145M', year2: '$185M', year3: '$215M' },
  { metric: 'Conversion Rate', current: '0%', year1: '12.0%', year2: '15.5%', year3: '18.0%' },
  { metric: 'Card Volume Converted', current: '$0', year1: '$17.4M', year2: '$28.7M', year3: '$38.7M' },
  { metric: 'Rebate Rate', current: '—', year1: '1.95%', year2: '2.05%', year3: '2.15%' },
  { metric: 'Gross Rebate Revenue', current: '$0', year1: '$339K', year2: '$588K', year3: '$832K' },
  { metric: 'Bottomline License Fee', current: '—', year1: '$254,600', year2: '$254,600', year3: '$254,600' },
  { metric: 'Net ROI to Client', current: '—', year1: '$84,400', year2: '$333,400', year3: '$577,400' },
  { metric: 'Cumulative ROI', current: '—', year1: '33%', year2: '131%', year3: '227%' },
];

const arrRows = [
  { component: 'Software License', year1: '$120,000', year2: '$120,000', year3: '$120,000', notes: 'Per-user pricing × 50 users' },
  { component: 'Implementation Fee', year1: '$45,000', year2: '$0', year3: '$0', notes: 'One-time setup' },
  { component: 'Card Processing Fee', year1: '$54,600', year2: '$54,600', year3: '$54,600', notes: 'Per-transaction fee' },
  { component: 'Premium Support', year1: '$35,000', year2: '$35,000', year3: '$35,000', notes: '24/7 support tier' },
  { component: 'Total ARR', year1: '$254,600', year2: '$209,600', year3: '$209,600', notes: 'Excluding implementation' },
  { component: 'Gross Margin', year1: '72%', year2: '78%', year3: '80%', notes: 'Target > 75%' },
];

export default function ValueStatementCenter({ customer, channel }: { customer?: string; channel?: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'summary', label: 'Value Summary', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing Recommendation', icon: Tag },
    { id: 'booking', label: 'Booking Calculator', icon: Calculator },
    { id: 'arr', label: 'ARR Revenue', icon: DollarSign },
  ];

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100">
            <Download className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Internal Value Statement
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'summary' && <SummaryTab />}
        {activeTab === 'pricing' && <PricingRecommendationTab customer={customer} channel={channel} />}
        {activeTab === 'booking' && <BookingTab />}
        {activeTab === 'arr' && <ARRTab />}
      </div>
    </div>
  );
}

function SummaryTab() {
  return (
    <div className="p-5 space-y-5">
      {/* File info */}
      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-800">internal_value_statement.xlsx</p>
          <p className="text-xs text-emerald-600">Generated from processing output • 140+ data fields populated</p>
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Ready
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        {summaryMetrics.map((m, i) => (
          <div key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-xl font-bold text-slate-900">{m.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{m.detail}</p>
          </div>
        ))}
      </div>

      {/* Key assumptions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Key Assumptions</h3>
        <div className="space-y-2">
          {[
            { assumption: 'Card Conversion Rate', value: '12.0%', source: 'Historical 90-day trailing average', editable: true },
            { assumption: 'Average Rebate Rate', value: '1.95%', source: 'Channel blended average', editable: true },
            { assumption: 'Implementation Timeline', value: '8 weeks', source: 'Standard deployment', editable: true },
            { assumption: 'Year-over-Year Growth', value: '28%', source: 'Conservative estimate', editable: true },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex-1">
                <p className="text-sm text-slate-700">{a.assumption}</p>
                <p className="text-[10px] text-slate-400">{a.source}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{a.value}</span>
                {a.editable && (
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200">
                    <Eye className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-slate-800">Booking Calculator</span>
          <span className="text-xs text-slate-400 ml-1">3-year projection</span>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 rounded">
          <RefreshCw className="w-3 h-3" />
          Recalculate
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 w-[200px]">Metric</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100">Current State</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-blue-600 uppercase tracking-wider border-r border-slate-100 bg-blue-50/30">Year 1</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-blue-600 uppercase tracking-wider border-r border-slate-100 bg-blue-50/30">Year 2</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50/30">Year 3</th>
            </tr>
          </thead>
          <tbody>
            {bookingCalcRows.map((row, i) => {
              const isTotal = row.metric.includes('ROI') || row.metric.includes('Net') || row.metric.includes('Cumulative');
              return (
                <tr key={i} className={`border-b border-slate-100 hover:bg-blue-50/20 ${isTotal ? 'bg-slate-50 font-semibold' : ''}`}>
                  <td className="py-2.5 px-4 text-slate-700 border-r border-slate-100">{row.metric}</td>
                  <td className="py-2.5 px-4 text-right text-slate-500 border-r border-slate-100">{row.current}</td>
                  <td className="py-2.5 px-4 text-right text-slate-800 border-r border-slate-100">{row.year1}</td>
                  <td className="py-2.5 px-4 text-right text-slate-800 border-r border-slate-100">{row.year2}</td>
                  <td className="py-2.5 px-4 text-right text-slate-800">{row.year3}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex-shrink-0 px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {bookingCalcRows.length} metrics • 3-year horizon
        </span>
        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Cumulative 3Y ROI: 227%
        </span>
      </div>
    </div>
  );
}

function ARRTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-slate-800">ARR Revenue Breakdown</span>
          <span className="text-xs text-slate-400 ml-1">Annual licensing & services</span>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded">
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 w-[180px]">Component</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100">Year 1</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100">Year 2</th>
              <th className="text-right py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100">Year 3</th>
              <th className="text-left py-2.5 px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {arrRows.map((row, i) => {
              const isTotal = row.component.includes('Total') || row.component.includes('Margin');
              return (
                <tr key={i} className={`border-b border-slate-100 hover:bg-emerald-50/20 ${isTotal ? 'bg-emerald-50/30 font-semibold' : ''}`}>
                  <td className="py-2.5 px-4 text-slate-700 border-r border-slate-100">{row.component}</td>
                  <td className="py-2.5 px-4 text-right text-slate-800 border-r border-slate-100">{row.year1}</td>
                  <td className="py-2.5 px-4 text-right text-slate-800 border-r border-slate-100">{row.year2}</td>
                  <td className="py-2.5 px-4 text-right text-slate-800 border-r border-slate-100">{row.year3}</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">{row.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex-shrink-0 px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {arrRows.length} line items
        </span>
        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Year 1 ARR: $254,600
        </span>
      </div>
    </div>
  );
}
