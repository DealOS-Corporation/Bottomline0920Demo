'use client';

import { useState } from 'react';
import {
  X,
  TrendingUp,
  BarChart3,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Download,
  Shield,
  Layers,
  GitBranch,
  Clock,
  Globe,
  CreditCard,
  Building2,
  Info,
  Server,
  Briefcase,
  SlidersHorizontal,
  RotateCcw,
  Lock,
  Check,
} from 'lucide-react';
import {
  useStrategy,
  resolveStrategy,
  POSTURE_META,
  DEFAULT_STRATEGY,
  type StrategyPosture,
  type PricingTierLite,
} from '@/lib/strategyStore';

interface IntelligenceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   SHARED DESIGN PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

/** Donut / Ring chart */
function Donut({ value, max, size = 80, stroke = 6, color, trackColor = '#e2e8f0', children }: {
  value: number; max: number; size?: number; stroke?: number;
  color: string; trackColor?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/** Mini sparkline + gradient fill */
function Spark({ data, color = '#2563eb', h = 32, w = 110 }: {
  data: number[]; color?: string; h?: number; w?: number;
}) {
  if (!data.length) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 6) - 3}`).join(' ');
  const fill = `0,${h} ${pts} ${w},${h}`;
  const last = pts.split(' ').pop()!.split(',');
  return (
    <svg width={w} height={h} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={fill} fill={`url(#sg-${color.replace('#', '')})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

/** Status dot — static, no animation */
function Pulse({ status }: { status: 'live' | 'warn' | 'error' | 'idle' }) {
  const c = { live: 'bg-emerald-500', warn: 'bg-amber-500', error: 'bg-red-500', idle: 'bg-slate-400' };
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c[status]}`} />
    </span>
  );
}

/** KPI metric card — flat, data-first */
function KPI({ title, value, sub, trend, icon: Icon, spark }: {
  title: string; value: string; sub: string; trend: 'up' | 'down' | 'flat';
  icon?: React.ElementType; grad?: string; spark?: number[];
}) {
  const Arrow = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const tc = trend === 'up' ? 'text-emerald-700' : trend === 'down' ? 'text-red-700' : 'text-slate-500';
  return (
    <div className="bg-white rounded-md border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
          <p className="text-[11px] font-medium text-slate-500 truncate">{title}</p>
        </div>
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold tnum flex-shrink-0 ${tc}`}>
          <Arrow className="w-3 h-3" /> {sub}
        </span>
      </div>
      <p className="text-[24px] font-semibold tracking-tight leading-none text-slate-900 tnum">{value}</p>
      {spark ? (
        <div className="mt-3"><Spark data={spark} color={trend === 'down' ? '#b45309' : '#2563eb'} h={22} w={130} /></div>
      ) : (
        <div className="mt-3 h-[22px]" />
      )}
    </div>
  );
}

/** Section card wrapper */
function Card({ title, sub, badge, action, children }: {
  title: string; sub?: string; badge?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
            {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200 rounded bg-slate-50">{badge}</span>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/** Horizontal bar used in several tables */
function HBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-[6px] bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

/** Small metric pill for inline stats */
function Pill({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold tnum border ${
      good === true ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
      good === false ? 'bg-amber-50 text-amber-800 border-amber-200' :
      'bg-slate-50 text-slate-600 border-slate-200'
    }`}>
      <span className="text-slate-400 font-medium">{label}</span>
      {value}
    </div>
  );
}

/* Heat map cell */
function Heat({ v, mx }: { v: number; mx: number }) {
  const p = Math.min(v / mx, 1);
  const bg = p > 0.75 ? 'bg-blue-700 text-white' : p > 0.5 ? 'bg-blue-500 text-white' : p > 0.3 ? 'bg-blue-200 text-blue-900' : 'bg-blue-50 text-blue-800';
  return (
    <div className={`h-9 rounded flex items-center justify-center text-[10px] font-semibold tnum ${bg}`}>
      {v.toFixed(1)}%
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function IntelligenceDashboard({ isOpen, onClose }: IntelligenceDashboardProps) {
  const [view, setView] = useState('overview');
  const [range, setRange] = useState('90d');

  if (!isOpen) return null;

  const nav = [
    { id: 'overview',   label: 'Executive Overview',    icon: BarChart3,         badge: null },
    { id: 'strategy',   label: 'Strategy Engine',       icon: SlidersHorizontal, badge: null },
    { id: 'campaigns',  label: 'Campaign Analytics',    icon: Target,            badge: null },
    { id: 'conversion', label: 'Conversion Analysis',   icon: TrendingUp,        badge: '3' },
    { id: 'pricing',    label: 'Pricing Performance',   icon: DollarSign,        badge: null },
    { id: 'quality',    label: 'Data Quality',          icon: Shield,            badge: null },
    { id: 'rebates',    label: 'Rebate Alignment',      icon: CreditCard,        badge: '2' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      {/* panel */}
      <div className="relative ml-auto w-[90%] max-w-[1560px] h-full flex">

        {/* ── SIDEBAR ── */}
        <aside className="w-[218px] flex-shrink-0 bg-[#101b2d] flex flex-col overflow-hidden">
          {/* brand */}
          <div className="px-5 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white/[0.08] border border-white/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-slate-200" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white tracking-tight">Analytics</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Pricing Operations</p>
              </div>
            </div>
          </div>

          {/* nav */}
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pt-4">
            {nav.map(n => {
              const I = n.icon;
              const on = view === n.id;
              return (
                <button key={n.id} onClick={() => setView(n.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded text-left transition-colors ${
                    on ? 'bg-white/[0.08] text-white'
                       : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                  }`}>
                  <I className={`w-[15px] h-[15px] ${on ? 'text-blue-400' : ''}`} />
                  <span className="text-[11px] font-medium flex-1">{n.label}</span>
                  {n.badge && (
                    <span className={`min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-semibold rounded tnum ${
                      on ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'
                    }`}>{n.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* bottom status */}
          <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center">
                <Server className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest">Model Services</p>
                <p className="text-[11px] text-slate-300 font-medium">3 of 3 operational</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest">Alerts</p>
                <p className="text-[11px] text-slate-300 font-medium">5 active</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className="flex-1 bg-[#f6f7f9] flex flex-col overflow-hidden">
          {/* top bar */}
          <header className="flex-shrink-0 bg-white border-b border-slate-200 px-7 py-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                {nav.find(n => n.id === view)?.label}
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  {range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : range === 'YTD' ? 'Year to Date' : 'All Time'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Bottomline Technologies · Pricing Operations Analytics · Data as of Mar 3, 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded bg-white">
                {['30d', '90d', 'YTD', 'All'].map((r, idx) => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`px-3.5 py-[6px] text-[11px] font-medium transition-colors ${idx > 0 ? 'border-l border-slate-200' : ''} ${
                      range === r ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}>{r}</button>
                ))}
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><RefreshCw className="w-4 h-4" /></button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Download className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-slate-200 mx-0.5" />
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </header>

          {/* scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-7 max-w-[1300px]">
              {view === 'overview' && <OverviewView />}
              {view === 'strategy' && <StrategyView />}
              {view === 'campaigns' && <CampaignsView />}
              {view === 'conversion' && <ConversionView />}
              {view === 'pricing' && <PricingView />}
              {view === 'quality' && <QualityView />}
              {view === 'rebates' && <RebatesView />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: STRATEGY ENGINE  (the handle that drives recommendations)
   ═══════════════════════════════════════════════════════════════ */
const STRATEGY_SAMPLE_TIERS: (PricingTierLite & { name: string; price: number })[] = [
  { grade: 'A', name: 'Stretch target', price: 263200, discountPct: 6.0, marginPct: 74 },
  { grade: 'B', name: 'Suggested',      price: 254600, discountPct: 9.1, marginPct: 72 },
  { grade: 'C', name: 'Floor',          price: 243600, discountPct: 13.0, marginPct: 68 },
];

function StrategyView() {
  const { strategy, updateStrategy, resetStrategy } = useStrategy();
  const resolution = resolveStrategy(strategy, STRATEGY_SAMPLE_TIERS);
  const rec = STRATEGY_SAMPLE_TIERS.find(t => t.grade === resolution.grade)!;
  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;

  const postures: StrategyPosture[] = ['land', 'balanced', 'expand'];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-white rounded-md border border-slate-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded bg-[#16345e] flex items-center justify-center flex-shrink-0">
            <SlidersHorizontal className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-slate-900">Strategy Engine</h3>
            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed max-w-2xl">
              The single control that governs how pricing is recommended on every deal. Set your posture,
              guardrails, and approval authority here — the Pricing Recommendation on each deal recalculates
              automatically. Changes are saved instantly.
            </p>
          </div>
          <button
            onClick={resetStrategy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to default
          </button>
        </div>
      </div>

      {/* Posture selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">Strategic posture</h4>
          <span className="text-[11px] text-slate-400">— land vs. expand</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {postures.map(p => {
            const meta = POSTURE_META[p];
            const active = strategy.posture === p;
            return (
              <button
                key={p}
                onClick={() => updateStrategy({ posture: p })}
                className={`text-left rounded-md border p-4 transition-colors ${
                  active ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-semibold ${active ? 'text-[#16345e]' : 'text-slate-700'}`}>{meta.label}</span>
                  {active ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#16345e] text-white text-[9px] font-semibold uppercase tracking-wide">
                      <Check className="w-2.5 h-2.5" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Target {meta.targetGrade}</span>
                  )}
                </div>
                <p className={`text-[11px] font-medium mb-1.5 ${active ? 'text-blue-700' : 'text-slate-500'}`}>{meta.tagline}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{meta.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guardrails */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[12px] font-semibold text-slate-800">Approval threshold</label>
            <span className="text-[13px] font-bold text-[#16345e] tnum">{strategy.approvalThreshold}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Max discount a rep can quote before it routes to deal desk.</p>
          <input
            type="range" min={0} max={25} step={1}
            value={strategy.approvalThreshold}
            onChange={e => updateStrategy({ approvalThreshold: Number(e.target.value) })}
            className="w-full accent-[#16345e]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 tnum"><span>0%</span><span>25%</span></div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[12px] font-semibold text-slate-800">Margin floor</label>
            <span className="text-[13px] font-bold text-[#16345e] tnum">{strategy.marginFloor}%</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Quotes below this gross margin are blocked / escalated.</p>
          <input
            type="range" min={50} max={80} step={1}
            value={strategy.marginFloor}
            onChange={e => updateStrategy({ marginFloor: Number(e.target.value) })}
            className="w-full accent-[#16345e]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 tnum"><span>50%</span><span>80%</span></div>
        </div>
      </div>

      {/* Auto-apply + context */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-md border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-800">Auto-apply recommendation</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Apply the recommended tier to the quote automatically.</p>
            </div>
            <button
              role="switch"
              aria-checked={strategy.autoApply}
              onClick={() => updateStrategy({ autoApply: !strategy.autoApply })}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${strategy.autoApply ? 'bg-[#16345e]' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${strategy.autoApply ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 p-4">
          <label className="text-[12px] font-semibold text-slate-800">Tailored guidance</label>
          <p className="text-[11px] text-slate-500 mt-0.5 mb-2">Context applied to recommendations for this book of business.</p>
          <textarea
            value={strategy.context}
            onChange={e => updateStrategy({ context: e.target.value })}
            placeholder="e.g. Defend mid-market against competitor X this quarter; prioritize multi-year commits."
            rows={2}
            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-[12px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 resize-none"
          />
        </div>
      </div>

      {/* Live impact preview */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">Live impact preview</h4>
          <span className="text-[11px] text-slate-400">— sample enterprise deal · list {fmt(280000)}</span>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Recommended quote</p>
            <p className="text-[22px] font-bold text-[#16345e] tnum leading-none">{fmt(rec.price)}</p>
            <p className="text-[11px] text-slate-500 mt-1 tnum">Grade {rec.grade} · {rec.name} · {rec.discountPct.toFixed(1)}% off</p>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Gross margin</p>
            <p className={`text-[22px] font-bold tnum leading-none ${resolution.belowFloor ? 'text-red-600' : 'text-emerald-700'}`}>{rec.marginPct}%</p>
            <p className="text-[11px] text-slate-500 mt-1 tnum">Floor {strategy.marginFloor}%</p>
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">Approval</p>
            {resolution.needsApproval ? (
              <p className="text-[15px] font-semibold text-amber-700 flex items-center gap-1.5 leading-none mt-1"><Lock className="w-4 h-4" /> Deal desk</p>
            ) : (
              <p className="text-[15px] font-semibold text-emerald-700 flex items-center gap-1.5 leading-none mt-1"><CheckCircle2 className="w-4 h-4" /> Rep authority</p>
            )}
            <p className="text-[11px] text-slate-500 mt-1.5 tnum">Threshold {strategy.approvalThreshold}%</p>
          </div>
        </div>
        <div className="px-5 pb-4 -mt-1">
          {resolution.belowFloor ? (
            <div className="flex items-start gap-2 px-3 py-2 rounded bg-red-50 border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-700">
                The <span className="font-semibold">{POSTURE_META[strategy.posture].label}</span> posture lands below your {strategy.marginFloor}% margin floor — this quote would be escalated. Raise the posture or lower the floor.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 px-3 py-2 rounded bg-blue-50 border border-blue-200">
              <Info className="w-3.5 h-3.5 text-[#16345e] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-700">
                With <span className="font-semibold text-[#16345e]">{POSTURE_META[strategy.posture].label}</span> posture, deals open at Grade {rec.grade} ({rec.discountPct.toFixed(1)}% off).
                {resolution.needsApproval
                  ? ' This exceeds rep authority and routes to deal desk.'
                  : ' This is within rep authority — reps can send it directly.'}
                {strategy.autoApply ? ' Recommendation is auto-applied to the quote.' : ' Reps must apply it manually.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: EXECUTIVE OVERVIEW
   ═══════════════════════════════════════════════════════════════ */
function OverviewView() {
  return (
    <div className="space-y-7">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Card Conversion Rate" value="12.4%" sub="+0.6% QoQ" trend="up" icon={TrendingUp}
          spark={[10.2, 10.8, 11.1, 11.5, 11.8, 12.0, 12.4]} />
        <KPI title="Pipeline Revenue" value="$18.7M" sub="+$2.1M" trend="up" icon={DollarSign}
          spark={[14.1, 14.8, 15.2, 16.0, 16.6, 17.4, 18.7]} />
        <KPI title="Rebate Realization" value="94.0%" sub="-2.0%" trend="down" icon={CreditCard}
          spark={[96.2, 95.8, 95.4, 95.1, 94.6, 94.2, 94.0]} />
        <KPI title="Active Deals" value="47" sub="+5 this mo" trend="up" icon={Briefcase}
          spark={[35, 38, 40, 41, 42, 44, 47]} />
      </div>

      {/* Scorecards + Revenue */}
      <div className="grid grid-cols-12 gap-6">
        {/* Donut gauges */}
        <div className="col-span-4">
          <Card title="Key Performance Targets" sub="Current vs quarterly targets">
            <div className="flex items-center justify-around py-2">
              <Donut value={12.4} max={15} size={84} stroke={7} color="#2563eb">
                <span className="text-[15px] font-semibold text-slate-900 tnum">12.4%</span>
                <span className="text-[8px] text-slate-400 font-medium">Conv</span>
              </Donut>
              <Donut value={94} max={96} size={84} stroke={7} color="#b45309">
                <span className="text-[15px] font-semibold text-slate-900 tnum">94%</span>
                <span className="text-[8px] text-slate-400 font-medium">Rebate</span>
              </Donut>
              <Donut value={92} max={95} size={84} stroke={7} color="#15803d">
                <span className="text-[15px] font-semibold text-slate-900 tnum">92</span>
                <span className="text-[8px] text-slate-400 font-medium">DQ</span>
              </Donut>
            </div>
            <div className="grid grid-cols-3 mt-4 pt-3 border-t border-slate-100 text-center text-[10px]">
              {[['15.0%', 'Conv Target'], ['96.0%', 'Rebate Tgt'], ['95', 'DQ Target']].map(([v, l], i) => (
                <div key={i}><span className="text-slate-400">{l}</span><p className="font-bold text-slate-700">{v}</p></div>
              ))}
            </div>
          </Card>
        </div>

        {/* Revenue variance */}
        <div className="col-span-8">
          <Card title="Revenue vs Projection" sub="Quarterly variance analysis" badge="Q4 2025">
            <table className="w-full">
              <thead>
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3">Stream</th>
                  <th className="text-right pb-3">Actual</th>
                  <th className="text-right pb-3">Projected</th>
                  <th className="text-right pb-3">Variance</th>
                  <th className="text-right pb-3 w-20">Trend</th>
                  <th className="text-center pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {[
                  { s: 'Total Revenue', a: '$4.2M', p: '$4.1M', v: '+2.3%', d: [3.8, 3.9, 4.0, 4.1, 4.2], ok: true },
                  { s: 'Card Rebate Revenue', a: '$1.8M', p: '$1.92M', v: '-6.2%', d: [1.9, 1.88, 1.85, 1.82, 1.8], ok: false },
                  { s: 'ACH Processing', a: '$890K', p: '$850K', v: '+4.7%', d: [820, 840, 855, 870, 890], ok: true },
                  { s: 'Premium Deals', a: '$1.5M', p: '$1.3M', v: '+15.4%', d: [1.1, 1.2, 1.3, 1.35, 1.5], ok: true },
                ].map((r, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60">
                    <td className="py-3 font-semibold text-slate-800">{r.s}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{r.a}</td>
                    <td className="py-3 text-right text-slate-500">{r.p}</td>
                    <td className={`py-3 text-right font-bold ${r.v.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{r.v}</td>
                    <td className="py-3 text-right"><Spark data={r.d} color={r.ok ? '#15803d' : '#b91c1c'} h={20} w={60} /></td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded border ${
                        r.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {r.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {r.ok ? 'On Track' : 'Watch'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Models + Alerts */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Model Health" sub="Classification & entity resolution services" badge="Monitoring">
          <div className="space-y-2.5">
            {[
              { m: 'Vendor Classification v3.2', acc: 94.2, drift: 0.03, st: 'Stable' as const, train: 'Jan 15 \'26', sp: [93, 93.4, 93.8, 94, 94.1, 94.2] },
              { m: 'Campaign Type Predictor v2.1', acc: 91.8, drift: 0.08, st: 'Stable' as const, train: 'Dec 28 \'25', sp: [90.2, 90.8, 91, 91.2, 91.5, 91.8] },
              { m: 'Entity Resolution v1.9', acc: 88.5, drift: 0.12, st: 'Monitor' as const, train: 'Jan 2 \'26', sp: [90.1, 89.8, 89.4, 89, 88.7, 88.5] },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded border border-slate-200 hover:border-slate-300 transition-colors">
                <Donut value={m.acc} max={100} size={48} stroke={4} color={m.st === 'Stable' ? '#15803d' : '#b45309'}>
                  <span className="text-[10px] font-semibold text-slate-800 tnum">{m.acc}%</span>
                </Donut>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Pulse status={m.st === 'Stable' ? 'live' : 'warn'} />
                    <span className="text-[12px] font-semibold text-slate-800 truncate">{m.m}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${
                      m.st === 'Stable' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>{m.st}</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-[10px] text-slate-500 tnum">
                    <span>Drift: <b className={m.drift > 0.1 ? 'text-amber-700' : 'text-slate-700'}>{m.drift}</b></span>
                    <span>Last trained: <b className="text-slate-700">{m.train}</b></span>
                  </div>
                </div>
                <Spark data={m.sp} color={m.st === 'Stable' ? '#15803d' : '#b45309'} h={28} w={70} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Operational Alerts" sub="Anomaly detection & pricing exceptions">
          <div className="space-y-1.5">
            {[
              { lv: 'critical' as const, msg: 'Card rebate revenue trailing projection by 6.2% — Wells Fargo realization at 91.3%', t: '35m ago', cat: 'Rebate' },
              { lv: 'warning' as const, msg: 'Entity Resolution drift nearing 0.15 retrain threshold — accuracy declining', t: '2h ago', cat: 'Model' },
              { lv: 'info' as const, msg: 'Premium campaign win rate at 22.1% — pricing tier weights adjusted', t: '5h ago', cat: 'Pricing' },
              { lv: 'warning' as const, msg: 'Conversion gap widening for Citibank channel (9.8% vs 12% assumed)', t: '8h ago', cat: 'Conversion' },
              { lv: 'info' as const, msg: 'Data quality score improved to 92/100 — schema conformance at 98.5%', t: '1d ago', cat: 'Quality' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-3.5 py-3 rounded border border-slate-200 hover:border-slate-300 transition-colors">
                <div className={`mt-1 w-1 self-stretch rounded-full flex-shrink-0 ${
                  a.lv === 'critical' ? 'bg-red-600' : a.lv === 'warning' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-700 leading-relaxed">{a.msg}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400">{a.t}</span>
                    <span className="text-[9px] font-medium text-slate-500 border border-slate-200 bg-slate-50 px-1.5 py-0.5 rounded">{a.cat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: CAMPAIGN ANALYTICS
   ═══════════════════════════════════════════════════════════════ */
function CampaignsView() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Total Campaigns" value="142" sub="+18 / 90d" trend="up" icon={Target}
          spark={[105, 112, 118, 125, 130, 136, 142]} />
        <KPI title="Blended Win Rate" value="13.8%" sub="+1.2%" trend="up" icon={TrendingUp}
          spark={[10.5, 11.2, 11.8, 12.3, 12.6, 13.2, 13.8]} />
        <KPI title="Revenue / Campaign" value="$131K" sub="+$12K" trend="up" icon={DollarSign}
          spark={[108, 112, 117, 120, 124, 128, 131]} />
        <KPI title="Classification Confidence" value="91.3%" sub="+0.5%" trend="up" icon={Shield}
          spark={[89.5, 89.8, 90.2, 90.5, 90.8, 91, 91.3]} />
      </div>

      <Card title="Campaign Type Performance" sub="Win rates, revenue, and deal cycle by campaign type" badge="Last 90d">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="text-left pb-3 pl-1">Type</th>
              <th className="text-right pb-3">Deals</th>
              <th className="text-right pb-3">Win Rate</th>
              <th className="pb-3 w-24" />
              <th className="text-right pb-3">Revenue</th>
              <th className="text-right pb-3">Avg Size</th>
              <th className="text-right pb-3">Cycle</th>
              <th className="text-right pb-3 w-16">Trend</th>
            </tr>
          </thead>
          <tbody>
            {[
              { t: 'Premium Card', d: 38, w: 22.1, rev: '$5.7M', avg: '$150K', cyc: '28d', tr: [18, 19, 20, 21, 22, 22.1], c: 'bg-blue-700' },
              { t: 'Standard Card', d: 62, w: 14.2, rev: '$7.4M', avg: '$119K', cyc: '32d', tr: [12, 12.5, 13, 13.5, 14, 14.2], c: 'bg-blue-500' },
              { t: 'ACH / EFT', d: 35, w: 8.7, rev: '$4.1M', avg: '$117K', cyc: '38d', tr: [8.5, 8.6, 8.5, 8.7, 8.7, 8.7], c: 'bg-blue-300' },
              { t: 'Basic / Other', d: 7, w: 5.3, rev: '$1.5M', avg: '$214K', cyc: '45d', tr: [7, 6.5, 6, 5.8, 5.5, 5.3], c: 'bg-slate-400' },
            ].map((r, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60">
                <td className="py-3.5 pl-1"><div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${r.c}`} /><span className="font-semibold text-slate-800">{r.t}</span></div></td>
                <td className="py-3.5 text-right text-slate-600">{r.d}</td>
                <td className="py-3.5 text-right font-bold text-slate-900">{r.w}%</td>
                <td className="py-3.5 px-2"><HBar pct={r.w / 25 * 100} color={r.c} /></td>
                <td className="py-3.5 text-right font-semibold text-slate-800">{r.rev}</td>
                <td className="py-3.5 text-right text-slate-600">{r.avg}</td>
                <td className="py-3.5 text-right text-slate-600">{r.cyc}</td>
                <td className="py-3.5 text-right"><Spark data={r.tr} color={r.tr[r.tr.length - 1] >= r.tr[0] ? '#15803d' : '#b91c1c'} h={20} w={50} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Exclusion Category Analysis" sub="Vendor categories excluded from targeting — revenue impact">
        <div className="grid grid-cols-4 gap-4">
          {[
            { cat: 'Insurance', n: 23, rev: '$3.2M', pct: 16.2, ic: Shield },
            { cat: 'Government', n: 15, rev: '$1.8M', pct: 10.6, ic: Building2 },
            { cat: 'Adult / Restricted', n: 8, rev: '$890K', pct: 5.6, ic: AlertTriangle },
            { cat: 'Gambling / Gaming', n: 5, rev: '$2.1M', pct: 3.5, ic: Info },
          ].map((c, i) => {
            const I = c.ic;
            return (
              <div key={i} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center">
                    <I className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 tnum">{c.pct}% of pool</span>
                </div>
                <p className="text-xl font-semibold text-slate-900 tnum">{c.n}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{c.cat}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 tnum">
                  Excluded revenue: <span className="font-semibold text-slate-700">{c.rev}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: CONVERSION ENGINE
   ═══════════════════════════════════════════════════════════════ */
function ConversionView() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Overall Conversion" value="12.4%" sub="+0.6%" trend="up" icon={TrendingUp}
          spark={[10.2, 10.8, 11.1, 11.5, 11.8, 12, 12.4]} />
        <KPI title="Pricing Assumption" value="12.0%" sub="Δ +0.4%" trend="up" icon={Target} />
        <KPI title="Best Channel" value="US Bank" sub="18.3% rate" trend="up" icon={Building2} />
        <KPI title="Assumption Gap" value="2.6%" sub="-0.6% QoQ" trend="up" icon={GitBranch}
          spark={[4.2, 3.8, 3.5, 3.2, 3.0, 2.8, 2.6]} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* heat map */}
        <div className="col-span-5">
          <Card title="Conversion Heat Map" sub="Channel × Payment Type">
            <div className="space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">
                <div /><div>Card</div><div>ACH</div><div>Premium</div>
              </div>
              {[
                { ch: 'US Bank', c: 18.3, a: 12.1, p: 24.5 },
                { ch: 'BofA', c: 14.7, a: 10.3, p: 20.2 },
                { ch: 'Wells Fargo', c: 12.1, a: 8.8, p: 18.9 },
                { ch: 'JPMorgan', c: 11.5, a: 9.1, p: 16.7 },
                { ch: 'Citibank', c: 9.8, a: 7.2, p: 14.3 },
                { ch: 'Other', c: 8.2, a: 6.1, p: 11.8 },
              ].map((r, i) => (
                <div key={i} className="grid grid-cols-4 gap-1.5 items-center">
                  <span className="text-[10px] font-semibold text-slate-600 truncate">{r.ch}</span>
                  <Heat v={r.c} mx={25} />
                  <Heat v={r.a} mx={25} />
                  <Heat v={r.p} mx={25} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-[9px] text-slate-400">Low</span>
              {['bg-blue-50', 'bg-blue-200', 'bg-blue-500', 'bg-blue-700'].map((c, i) => (
                <div key={i} className={`w-6 h-3 rounded-sm ${c}`} />
              ))}
              <span className="text-[9px] text-slate-400">High</span>
            </div>
          </Card>
        </div>

        {/* channel bars */}
        <div className="col-span-7">
          <Card title="Conversion by Channel" sub="Trailing 90-day with period-over-period delta">
            <div className="space-y-2.5">
              {[
                { ch: 'US Bank', r: 18.3, pr: 16.1, d: '+2.2%', ok: true },
                { ch: 'Bank of America', r: 14.7, pr: 14.2, d: '+0.5%', ok: true },
                { ch: 'Wells Fargo', r: 12.1, pr: 12.8, d: '-0.7%', ok: false },
                { ch: 'JPMorgan Chase', r: 11.5, pr: 10.9, d: '+0.6%', ok: true },
                { ch: 'Citibank', r: 9.8, pr: 9.5, d: '+0.3%', ok: false },
                { ch: 'Other Channels', r: 8.2, pr: 7.9, d: '+0.3%', ok: false },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <span className="text-[11px] font-medium text-slate-700 w-32 truncate">{c.ch}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-sm overflow-hidden relative">
                    <div className={`h-full rounded-sm transition-all ${c.ok ? 'bg-blue-600' : 'bg-amber-500'}`}
                      style={{ width: `${(c.r / 20) * 100}%` }} />
                    <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold text-white tnum">{c.r}%</span>
                  </div>
                  <span className={`text-[11px] font-semibold w-12 text-right tnum ${c.d.startsWith('+') ? 'text-emerald-700' : 'text-red-700'}`}>{c.d}</span>
                  <Pulse status={c.ok ? 'live' : 'warn'} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title="Pricing Assumption Accuracy" sub="Validating whether our pricing models use accurate conversion assumptions">
        <div className="grid grid-cols-3 gap-5">
          {[
            { seg: 'Card Payments', assumed: 12.0, actual: 12.4, verdict: 'Accurate', sp: [11.5, 11.8, 12, 12.1, 12.3, 12.4] },
            { seg: 'ACH / EFT', assumed: 10.0, actual: 8.7, verdict: 'Overestimated', sp: [9.5, 9.2, 9.0, 8.9, 8.8, 8.7] },
            { seg: 'Premium Deals', assumed: 20.0, actual: 22.1, verdict: 'Conservative', sp: [19.5, 20, 20.5, 21, 21.5, 22.1] },
          ].map((s, i) => {
            const delta = s.actual - s.assumed;
            return (
              <div key={i} className="rounded-md border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-semibold text-slate-800">{s.seg}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${
                    s.verdict === 'Accurate' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    s.verdict === 'Conservative' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>{s.verdict}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div><p className="text-[9px] text-slate-400 font-medium uppercase">Assumed</p><p className="text-xl font-semibold text-slate-500 tnum">{s.assumed}%</p></div>
                  <div><p className="text-[9px] text-slate-400 font-medium uppercase">Actual</p><p className="text-xl font-semibold text-slate-900 tnum">{s.actual}%</p></div>
                  <div><p className="text-[9px] text-slate-400 font-medium uppercase">Delta</p><p className={`text-xl font-semibold tnum ${delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</p></div>
                </div>
                <Spark data={s.sp} color={s.verdict === 'Overestimated' ? '#b45309' : '#2563eb'} h={28} w={240} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: PRICING INTELLIGENCE
   ═══════════════════════════════════════════════════════════════ */
function PricingView() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Avg Pricing Accuracy" value="96.2%" sub="+1.1%" trend="up" icon={Target}
          spark={[93, 93.8, 94.5, 95, 95.5, 95.8, 96.2]} />
        <KPI title="Internal ROI (Avg)" value="312%" sub="+18%" trend="up" icon={TrendingUp}
          spark={[280, 285, 290, 295, 300, 305, 312]} />
        <KPI title="Avg Deal Cycle" value="34 days" sub="-4 days" trend="up" icon={Clock}
          spark={[42, 40, 38, 37, 36, 35, 34]} />
        <KPI title="Margin Health" value="68.4%" sub="+2.3%" trend="up" icon={DollarSign}
          spark={[63, 64, 65, 66, 67, 67.5, 68.4]} />
      </div>

      <Card title="Pricing Model Performance" sub="Revenue impact by pricing model applied to deals" badge="All Models">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="text-left pb-3 pl-1">Model</th>
              <th className="text-right pb-3">Deals</th>
              <th className="text-right pb-3">Avg Price</th>
              <th className="text-right pb-3">Win Rate</th>
              <th className="text-right pb-3">Margin</th>
              <th className="text-right pb-3">Revenue</th>
              <th className="text-right pb-3 w-16">Trend</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: 'Volume Tiered', d: 45, p: '$128K', w: '18.2%', mg: '72.1%', r: '$5.8M', t: [4.5, 4.8, 5, 5.2, 5.5, 5.8], u: true },
              { m: 'Custom Enterprise', d: 22, p: '$285K', w: '25.4%', mg: '64.3%', r: '$6.3M', t: [5, 5.2, 5.5, 5.8, 6, 6.3], u: true },
              { m: 'Flat Rate', d: 38, p: '$73K', w: '12.8%', mg: '69.5%', r: '$2.8M', t: [2.9, 2.9, 2.8, 2.8, 2.8, 2.8], u: false },
              { m: 'Per-Transaction', d: 28, p: '$95K', w: '15.1%', mg: '66.2%', r: '$2.7M', t: [2.2, 2.3, 2.4, 2.5, 2.6, 2.7], u: true },
              { m: 'Hybrid', d: 9, p: '$196K', w: '20.0%', mg: '71.8%', r: '$1.1M', t: [.6, .7, .8, .9, 1.0, 1.1], u: true },
            ].map((r, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60">
                <td className="py-3 pl-1 font-semibold text-slate-800">{r.m}</td>
                <td className="py-3 text-right text-slate-600">{r.d}</td>
                <td className="py-3 text-right text-slate-600">{r.p}</td>
                <td className="py-3 text-right font-semibold text-slate-800">{r.w}</td>
                <td className="py-3 text-right text-slate-600">{r.mg}</td>
                <td className="py-3 text-right font-bold text-slate-900">{r.r}</td>
                <td className="py-3 text-right"><Spark data={r.t} color={r.u ? '#15803d' : '#b91c1c'} h={20} w={50} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Booking Calculator Insights" sub="Value statement generation accuracy">
          <div className="space-y-2">
            {[
              { m: '3-Year Savings (Avg)', v: '$2.4M', d: '+$180K', ok: true },
              { m: 'Payback Period (Avg)', v: '8.2 mo', d: '-1.3 mo', ok: true },
              { m: 'ARR Accuracy', v: '97.1%', d: '+0.8%', ok: true },
              { m: 'Discount Override Rate', v: '12.5%', d: '+2.1%', ok: false },
              { m: 'Implementation Fee Real.', v: '89.3%', d: '-3.2%', ok: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3.5 rounded border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="text-[11px] text-slate-700 font-medium">{r.m}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-slate-900 tnum">{r.v}</span>
                  <span className={`text-[11px] font-semibold tnum ${r.ok ? 'text-emerald-700' : 'text-amber-700'}`}>{r.d}</span>
                  <Pulse status={r.ok ? 'live' : 'warn'} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Deal Velocity Analysis" sub="Time-to-close by pricing stage">
          <div className="space-y-2">
            {[
              { stage: 'Intake → Processing', d: 1.2, tr: 'faster' as const, sp: [2, 1.8, 1.6, 1.4, 1.3, 1.2] },
              { stage: 'Processing → Classification', d: 0.5, tr: 'faster' as const, sp: [1, .8, .7, .6, .5, .5] },
              { stage: 'Classification → Value Stmt', d: 2.8, tr: 'stable' as const, sp: [2.8, 2.9, 2.8, 2.7, 2.8, 2.8] },
              { stage: 'Value Stmt → ROI Materials', d: 3.5, tr: 'faster' as const, sp: [5, 4.5, 4.2, 3.9, 3.7, 3.5] },
              { stage: 'ROI Materials → SF Sync', d: 1.0, tr: 'faster' as const, sp: [1.8, 1.5, 1.3, 1.2, 1.1, 1] },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3.5 rounded border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="text-[11px] font-medium text-slate-700 flex-1 truncate">{s.stage}</span>
                <span className="text-[13px] font-semibold text-slate-900 w-12 text-right tnum">{s.d}d</span>
                <Spark data={s.sp} color={s.tr === 'faster' ? '#15803d' : '#2563eb'} h={18} w={44} />
                <span className={`text-[9px] font-semibold uppercase tracking-wider w-14 text-right ${
                  s.tr === 'faster' ? 'text-emerald-700' : 'text-slate-500'
                }`}>{s.tr}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Total Avg Cycle: <b className="text-slate-800">34 days</b></span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> 10.5% faster QoQ</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: DATA QUALITY
   ═══════════════════════════════════════════════════════════════ */
function QualityView() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Data Quality Score" value="92/100" sub="+5 pts" trend="up" icon={Shield}
          spark={[78, 82, 85, 87, 89, 91, 92]} />
        <KPI title="Field Completeness" value="97.3%" sub="+1.2%" trend="up" icon={CheckCircle2}
          spark={[94, 94.8, 95.5, 96, 96.5, 97, 97.3]} />
        <KPI title="Address Validation" value="99.1%" sub="+0.3%" trend="up" icon={Globe}
          spark={[97, 97.5, 98, 98.4, 98.7, 99, 99.1]} />
        <KPI title="Dedup Rate" value="2.1%" sub="-0.4%" trend="up" icon={Layers}
          spark={[3.8, 3.5, 3.1, 2.8, 2.5, 2.3, 2.1]} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <Card title="Quality Metrics Breakdown" sub="Category-level scores with period comparison" badge="vs Prev Qtr">
            <div className="space-y-2.5">
              {[
                { cat: 'Schema Conformance', sc: 98.5, prev: 96.2, d: '+2.3%', clr: '#2563eb' },
                { cat: 'Referential Integrity', sc: 97.8, prev: 96.1, d: '+1.7%', clr: '#2563eb' },
                { cat: 'Format Consistency', sc: 95.2, prev: 93.0, d: '+2.2%', clr: '#2563eb' },
                { cat: 'Freshness (< 30 days)', sc: 89.4, prev: 85.7, d: '+3.7%', clr: '#b45309' },
                { cat: 'Address Quality', sc: 92.1, prev: 88.3, d: '+3.8%', clr: '#2563eb' },
                { cat: 'Duplicate Detection', sc: 97.9, prev: 97.5, d: '+0.4%', clr: '#2563eb' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-3.5 rounded border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="text-[11px] font-medium text-slate-700 w-40">{m.cat}</span>
                  <div className="flex-1 h-[6px] bg-slate-100 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm transition-all" style={{ width: `${m.sc}%`, backgroundColor: m.clr }} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-900 w-14 text-right tnum">{m.sc}%</span>
                  <span className="text-[11px] text-emerald-700 font-semibold w-12 text-right tnum">{m.d}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-5">
          <Card title="Quality Score Trend" sub="Quarterly improvement">
            <div className="flex items-end gap-5 h-48 pt-4 px-2">
              {[
                { q: "Q1 '25", sc: 78 },
                { q: "Q2 '25", sc: 82 },
                { q: "Q3 '25", sc: 87 },
                { q: "Q4 '25", sc: 92 },
              ].map((it, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[14px] font-semibold text-slate-800 tnum">{it.sc}</span>
                  <div className="w-full rounded-t-sm bg-blue-600" style={{ height: `${(it.sc / 100) * 160}px`, opacity: 0.45 + (i * 0.18) }} />
                  <span className="text-[10px] font-medium text-slate-500">{it.q}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Target: <b className="text-slate-800">95/100</b></span>
              <span className="text-amber-700 font-medium">3 points remaining</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: REBATE ALIGNMENT
   ═══════════════════════════════════════════════════════════════ */
function RebatesView() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Rebate Realization" value="94.0%" sub="-2.0%" trend="down" icon={DollarSign}
          spark={[96.2, 95.8, 95.4, 95.1, 94.6, 94.2, 94]} />
        <KPI title="Total Rebates Earned" value="$2.4M" sub="+$380K" trend="up" icon={TrendingUp}
          spark={[1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4]} />
        <KPI title="Avg Rebate Rate" value="1.95%" sub="+0.05%" trend="up" icon={CreditCard}
          spark={[1.75, 1.78, 1.82, 1.85, 1.88, 1.92, 1.95]} />
        <KPI title="Projected Q1 Rebates" value="$2.8M" sub="+$400K" trend="up" icon={Target}
          spark={[2, 2.1, 2.3, 2.4, 2.5, 2.6, 2.8]} />
      </div>

      <Card title="Rebate Rate by Card Network" sub="Basis points alignment with interchange commitments" badge="vs Target">
        <div className="space-y-2.5">
          {[
            { tp: 'Visa — Standard', cur: 1.85, prev: 1.80, tgt: 1.90, sp: [1.72, 1.75, 1.78, 1.80, 1.82, 1.85] },
            { tp: 'Visa — Premium', cur: 2.10, prev: 2.05, tgt: 2.15, sp: [1.95, 2.0, 2.02, 2.05, 2.08, 2.10] },
            { tp: 'Mastercard — Standard', cur: 2.00, prev: 2.00, tgt: 2.05, sp: [1.98, 1.99, 2.0, 2.0, 2.0, 2.0] },
            { tp: 'Mastercard — Premium', cur: 2.30, prev: 2.35, tgt: 2.40, sp: [2.38, 2.36, 2.34, 2.32, 2.30, 2.30] },
            { tp: 'Amex — All Tiers', cur: 2.50, prev: 2.50, tgt: 2.55, sp: [2.48, 2.49, 2.50, 2.50, 2.50, 2.50] },
          ].map((r, i) => {
            const real = (r.cur / r.tgt * 100).toFixed(1);
            const up = r.cur >= r.prev;
            return (
              <div key={i} className="flex items-center gap-4 py-3 px-4 rounded border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="text-[11px] font-semibold text-slate-700 w-44">{r.tp}</span>
                <div className="flex-1 flex items-center gap-2.5">
                  <div className="flex-1 h-[6px] bg-slate-100 rounded-sm overflow-hidden">
                    <div className={`h-full rounded-sm ${up ? 'bg-blue-600' : 'bg-amber-500'}`} style={{ width: `${(r.cur / r.tgt) * 100}%` }} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-900 w-14 text-right tnum">{r.cur}%</span>
                </div>
                <span className="text-[10px] text-slate-400 w-16 text-right tnum">Tgt: {r.tgt}%</span>
                <Spark data={r.sp} color={up ? '#15803d' : '#b45309'} h={18} w={50} />
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded border tnum ${
                  parseFloat(real) >= 97 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>{real}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Internal Reporting — Rebate Realization by Channel"
        sub="Projected vs actual rebate earned per banking channel for internal P&L reporting" badge="Escalation Report">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="text-left pb-3 pl-1">Channel</th>
              <th className="text-right pb-3">Projected</th>
              <th className="text-right pb-3">Actual</th>
              <th className="text-right pb-3">Realization</th>
              <th className="text-right pb-3">Gap</th>
              <th className="pb-3 w-24" />
              <th className="text-center pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { ch: 'Bank of America', proj: '$820K', act: '$785K', real: 95.7, gap: '-$35K', ok: true },
              { ch: 'US Bank', proj: '$640K', act: '$612K', real: 95.6, gap: '-$28K', ok: true },
              { ch: 'Wells Fargo', proj: '$480K', act: '$438K', real: 91.3, gap: '-$42K', ok: false },
              { ch: 'JPMorgan Chase', proj: '$390K', act: '$372K', real: 95.4, gap: '-$18K', ok: true },
              { ch: 'Citibank', proj: '$270K', act: '$245K', real: 90.7, gap: '-$25K', ok: false },
            ].map((r, i) => (
              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60">
                <td className="py-3.5 pl-1 font-semibold text-slate-800">{r.ch}</td>
                <td className="py-3.5 text-right text-slate-500">{r.proj}</td>
                <td className="py-3.5 text-right font-bold text-slate-900">{r.act}</td>
                <td className="py-3.5 text-right font-semibold text-slate-800">{r.real}%</td>
                <td className="py-3.5 text-right text-red-500 font-bold">{r.gap}</td>
                <td className="py-3.5 px-3"><HBar pct={r.real} color={r.ok ? 'bg-emerald-500' : 'bg-amber-500'} /></td>
                <td className="py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded border ${
                    r.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {r.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {r.ok ? 'Aligned' : 'Gap'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px]">
            <Pill label="Overall" value="94.0%" good={false} />
            <Pill label="Target" value="96.0%" />
          </div>
          <span className="text-[11px] text-red-700 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> 2 channels below 95% — escalation recommended
          </span>
        </div>
      </Card>
    </div>
  );
}
