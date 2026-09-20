'use client';

import { Deal } from '@/lib/mockDeals';
import { StepSchema } from '@/lib/stepsSchema';
import { Briefcase, Building2, User, Calendar, TrendingUp } from 'lucide-react';

interface DealHeaderProps {
  deal: Deal;
  currentStep: StepSchema | undefined;
}

export default function DealHeader({ deal, currentStep }: DealHeaderProps) {
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    'on-hold': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Deal Name & Customer */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <h1 className="text-sm font-bold text-slate-900 truncate tracking-tight">{deal.name}</h1>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 truncate font-medium">{deal.customer}</span>
        </div>
        
        {/* Info Items */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600 font-medium">{deal.owner}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">{deal.value}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-100">
            <div className="w-4 h-4 rounded-full bg-[#16345e] flex items-center justify-center text-[10px] text-white font-bold">
              {currentStep?.order || '?'}
            </div>
            <span className="text-xs text-slate-700 font-medium">{currentStep?.label || 'Unknown'}</span>
          </div>
          
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusColors[deal.status]}`}>
            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
