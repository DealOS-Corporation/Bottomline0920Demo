'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import IntelligenceDashboard from './IntelligenceDashboard';

export default function DashboardButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#16345e] text-white hover:bg-[#1d4373] transition-colors"
      >
        <Activity className="w-3.5 h-3.5" />
        Analytics
      </button>
      <IntelligenceDashboard isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
