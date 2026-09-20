'use client';

import { useState } from 'react';
import { 
  LineChart, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Info,
  Target,
  Clock,
  Users,
  MessageSquare,
  FileOutput
} from 'lucide-react';

interface DealIntelligenceProps {
  dealData?: {
    customerName: string;
    price: number;
    transactions: number;
    paybackMonths: number;
    threeYearSavings: number;
    efficiencyGain: number;
  };
}

const defaultDealData = {
  customerName: 'Acme Corporation',
  price: 125000,
  transactions: 12500,
  paybackMonths: 8,
  threeYearSavings: 2400000,
  efficiencyGain: 78,
};

export default function DealIntelligencePanel({ dealData = defaultDealData }: DealIntelligenceProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('roi');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const talkingPoints = [
    {
      id: 'roi',
      trigger: 'Why should we invest now?',
      response: `Based on your transaction volume of ${dealData.transactions.toLocaleString()}/month, you'll see full payback in just ${dealData.paybackMonths} months. Waiting another quarter means leaving $${Math.round(dealData.threeYearSavings / 36 * 3).toLocaleString()} on the table.`
    },
    {
      id: 'price',
      trigger: 'Can you do better on price?',
      response: `This pricing already reflects a volume-based discount for your ${dealData.transactions.toLocaleString()} monthly transactions. At $${(dealData.price / dealData.transactions / 12).toFixed(3)} per transaction, you're getting rates typically reserved for enterprise clients.`
    },
    {
      id: 'compare',
      trigger: 'How does this compare to others?',
      response: `Similar clients in your industry typically see ${dealData.efficiencyGain}% efficiency gains. Companies like TechGlobal and DataSystems achieved full ROI within ${dealData.paybackMonths} months of implementation.`
    },
    {
      id: 'risk',
      trigger: 'What if it doesn\'t deliver?',
      response: `We've built in quarterly business reviews to track your ROI metrics. The $${(dealData.threeYearSavings / 3).toLocaleString()} annual savings is based on conservative estimates �?most clients exceed these numbers.`
    },
  ];

  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
            <LineChart className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Deal Intelligence</h3>
            <p className="text-[10px] text-slate-500">Sales negotiation kit</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Price Summary */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quoted Price</span>
            <span className="text-xs text-emerald-700 font-medium">Optimized</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 tnum">${dealData.price.toLocaleString()}</span>
            <span className="text-sm text-slate-500">/year</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on {dealData.transactions.toLocaleString()} txn/month · Tier 2 volume discount
          </p>
        </div>

        {/* ROI Story - Expandable */}
        <div className="border-b border-slate-100">
          <button 
            onClick={() => toggleSection('roi')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span className="text-sm font-medium text-slate-700">ROI Story</span>
            </div>
            {expandedSection === 'roi' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'roi' && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="border border-slate-200 rounded p-3 text-center">
                  <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-slate-900 tnum">{dealData.paybackMonths}</p>
                  <p className="text-[10px] text-slate-500">Months to Payback</p>
                </div>
                <div className="border border-slate-200 rounded p-3 text-center">
                  <DollarSign className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-slate-900 tnum">${(dealData.threeYearSavings / 1000000).toFixed(1)}M</p>
                  <p className="text-[10px] text-slate-500">3-Year Savings</p>
                </div>
                <div className="border border-slate-200 rounded p-3 text-center">
                  <Target className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-slate-900 tnum">{dealData.efficiencyGain}%</p>
                  <p className="text-[10px] text-slate-500">Efficiency Gain</p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded p-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>The story:</strong> "For every $1 you invest, you'll see $
                  {Math.round(dealData.threeYearSavings / dealData.price / 3)} back in annual savings. 
                  That's a {Math.round((dealData.threeYearSavings / dealData.price - 1) * 100)}% ROI over 3 years, 
                  with full payback in under {dealData.paybackMonths} months."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Talking Points - Expandable */}
        <div className="border-b border-slate-100">
          <button 
            onClick={() => toggleSection('talking')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Objection Handlers</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 rounded tnum">
                {talkingPoints.length}
              </span>
            </div>
            {expandedSection === 'talking' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'talking' && (
            <div className="px-4 pb-4 space-y-3">
              {talkingPoints.map((point) => (
                <div key={point.id} className="bg-slate-50 border border-slate-100 rounded p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      "{point.trigger}"
                    </span>
                    <button
                      onClick={() => copyToClipboard(point.response, point.id)}
                      className="p-1 hover:bg-white rounded transition-colors"
                      title="Copy response"
                    >
                      {copiedItem === point.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {point.response}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why This Price - Expandable */}
        <div className="border-b border-slate-100">
          <button 
            onClick={() => toggleSection('price')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Price Rationale</span>
            </div>
            {expandedSection === 'price' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'price' && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Base rate</span>
                  <span className="text-xs font-medium text-slate-700">$0.012/txn</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Volume discount (Tier 2)</span>
                  <span className="text-xs font-medium text-emerald-700 tnum">-15%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Annual commitment</span>
                  <span className="text-xs font-medium text-emerald-700 tnum">-5%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-medium text-slate-700">Effective rate</span>
                  <span className="text-xs font-bold text-slate-800 tnum">$0.0083/txn</span>
                </div>
              </div>
              
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[11px] text-slate-600">
                  This rate is 22% below industry average for similar transaction volumes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Comparable Deals - Expandable */}
        <div>
          <button 
            onClick={() => toggleSection('comps')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Similar Wins</span>
            </div>
            {expandedSection === 'comps' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {expandedSection === 'comps' && (
            <div className="px-4 pb-4 space-y-2">
              {[
                { name: 'TechGlobal Inc', industry: 'SaaS', size: '$110K', time: '6 mo payback' },
                { name: 'DataSystems Ltd', industry: 'FinTech', size: '$145K', time: '7 mo payback' },
                { name: 'CloudServ Pro', industry: 'Enterprise', size: '$98K', time: '9 mo payback' },
              ].map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{comp.name}</p>
                    <p className="text-[10px] text-slate-500">{comp.industry}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700 tnum">{comp.size}</p>
                    <p className="text-[10px] text-emerald-700">{comp.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <button className="w-full py-2 px-3 bg-[#16345e] text-white text-xs font-medium rounded hover:bg-[#1d4373] transition-colors flex items-center justify-center gap-2">
          <FileOutput className="w-3.5 h-3.5" />
          Generate Full Sales Kit
        </button>
      </div>
    </div>
  );
}
