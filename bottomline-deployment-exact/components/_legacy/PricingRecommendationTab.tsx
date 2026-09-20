'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  Info,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Layers,
  MapPin,
  Gauge,
  Lock,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { useStrategy, resolveStrategy, POSTURE_META } from '@/lib/strategyStore';

interface PricingRecommendationTabProps {
  customer?: string;
  channel?: string;
}

type Grade = 'A' | 'B' | 'C';

interface Tier {
  grade: Grade;
  name: string;
  price: number;
  listPrice: number;
  discountPct: number;
  marginPct: number;
  recommended?: boolean;
  applied?: boolean;
  strategy: string;
  customerRationale: string;
  dealRationale: string;
}

interface PeerDeal {
  grade: Grade;
  customer: string;
  industry: string;
  cardVolume: number; // in $M
  list: number;
  net: number;
  discountPct: number;
  status: 'Won' | 'Lost';
  sameTier?: boolean;
}

const LIST_PRICE = 280000;

const tiers: Tier[] = [
  {
    grade: 'A',
    name: 'Stretch target',
    price: 263200,
    listPrice: LIST_PRICE,
    discountPct: 6.0,
    marginPct: 74,
    strategy:
      'Use this premium quote when the value case is strong and there is executive sponsorship. Best when card-rebate upside clearly offsets the license fee and competitive pressure is low.',
    customerRationale:
      'The account has already validated $2.4M of Year-1 rebate revenue against $145M of card-eligible spend. With a signed ROI business case, the buyer can absorb a 6% discount ceiling without procurement escalation.',
    dealRationale:
      'On a 3-year commit this tier holds a 74% gross margin and a 4.0-month payback. Reserve for deals where the channel relationship owner has air-cover from the executive sponsor.',
  },
  {
    grade: 'B',
    name: 'Suggested price',
    price: 254600,
    listPrice: LIST_PRICE,
    discountPct: 9.1,
    marginPct: 72,
    strategy:
      'Start here. This is the balanced position that maximizes expected value across win-rate and margin — the default opening quote for enterprise payer deals.',
    customerRationale:
      'A 9% discount keeps the quote competitive yet defensible against 11 comparable won deals in the same segment, while protecting a 72% margin. This is the median net price of same-tier peers.',
    dealRationale:
      'At $254,600 the deal clears the 4.2-month payback in the value statement and aligns with peer medians. Highest expected value when ROI is quantified but not yet sponsor-backed.',
  },
  {
    grade: 'C',
    name: 'Floor',
    price: 243600,
    listPrice: LIST_PRICE,
    discountPct: 13.0,
    marginPct: 68,
    strategy:
      'The lowest defensible quote. Use only to protect a competitive displacement or a strategic logo — requires deal-desk approval below this line.',
    customerRationale:
      'A 13% discount erodes margin to 68% and signals price flexibility early. Justified only if the buyer is actively evaluating a competing card program and the timeline is at risk.',
    dealRationale:
      'Below this floor, blended margin falls under the 65% guardrail and the quote should be escalated to pricing operations before it is sent.',
  },
];

const peerDeals: PeerDeal[] = [
  { grade: 'A', customer: 'Vanguard Industrial', industry: 'Manufacturing', cardVolume: 162, list: 284000, net: 282300, discountPct: 0.6, status: 'Won', sameTier: true },
  { grade: 'A', customer: 'Sterling Components', industry: 'Manufacturing', cardVolume: 138, list: 271500, net: 268200, discountPct: 1.2, status: 'Won' },
  { grade: 'A', customer: 'Apex Fabrication', industry: 'Manufacturing', cardVolume: 151, list: 277000, net: 271800, discountPct: 1.9, status: 'Won' },
  { grade: 'A', customer: 'Cordova Mfg', industry: 'Manufacturing', cardVolume: 129, list: 263400, net: 257600, discountPct: 2.2, status: 'Won' },
  { grade: 'B', customer: 'Meridian Foods', industry: 'Manufacturing', cardVolume: 147, list: 279000, net: 270100, discountPct: 3.2, status: 'Won', sameTier: true },
  { grade: 'B', customer: 'Crestline Group', industry: 'Manufacturing', cardVolume: 156, list: 282500, net: 273100, discountPct: 3.3, status: 'Won' },
  { grade: 'B', customer: 'Tri-State Supply', industry: 'Manufacturing', cardVolume: 134, list: 268000, net: 258300, discountPct: 3.6, status: 'Won' },
  { grade: 'B', customer: 'Beacon Logistics', industry: 'Logistics', cardVolume: 172, list: 288000, net: 276000, discountPct: 4.2, status: 'Won' },
  { grade: 'C', customer: 'Ridgeway Corp', industry: 'Manufacturing', cardVolume: 141, list: 274000, net: 245100, discountPct: 10.5, status: 'Won' },
  { grade: 'C', customer: 'Hollis Group', industry: 'Manufacturing', cardVolume: 149, list: 278000, net: 246900, discountPct: 11.2, status: 'Lost', sameTier: true },
  { grade: 'C', customer: 'Cardinal Freight', industry: 'Logistics', cardVolume: 168, list: 286000, net: 252200, discountPct: 11.8, status: 'Won' },
];

const gradeStyles: Record<Grade, { badge: string; text: string; chip: string; ring: string; marker: string }> = {
  A: { badge: 'bg-emerald-600', text: 'text-emerald-700', chip: 'bg-emerald-50 border-emerald-200', ring: 'ring-emerald-200', marker: 'bg-emerald-600' },
  B: { badge: 'bg-[#16345e]', text: 'text-[#16345e]', chip: 'bg-blue-50 border-blue-200', ring: 'ring-blue-300', marker: 'bg-[#16345e]' },
  C: { badge: 'bg-amber-600', text: 'text-amber-700', chip: 'bg-amber-50 border-amber-200', ring: 'ring-amber-200', marker: 'bg-amber-600' },
};

const fmtCurrency = (n: number) => `$${n.toLocaleString('en-US')}`;

type SortKey = 'discount' | 'net' | 'volume';

export default function PricingRecommendationTab({ customer = 'this account', channel = 'the bank channel' }: PricingRecommendationTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('discount');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const { strategy } = useStrategy();

  // The Strategy Engine (set in Analytics) decides which tier is recommended,
  // whether it needs approval, and whether it breaches the margin floor.
  const resolution = resolveStrategy(strategy, tiers);
  const suggested = tiers.find(t => t.grade === resolution.grade)!;
  const alternatives = tiers.filter(t => t.grade !== resolution.grade);
  const posture = POSTURE_META[strategy.posture];
  const positionScale = 16; // 0–16% off list maps across the bar

  const sortedPeers = useMemo(() => {
    const rows = [...peerDeals];
    switch (sortKey) {
      case 'discount':
        return rows.sort((a, b) => a.discountPct - b.discountPct);
      case 'net':
        return rows.sort((a, b) => b.net - a.net);
      case 'volume':
        return rows.sort((a, b) => b.cardVolume - a.cardVolume);
    }
  }, [sortKey]);

  const wonCount = peerDeals.filter(p => p.status === 'Won').length;

  return (
    <div className="p-5 space-y-6">
      {/* ── Pricing tiers ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Pricing Recommendation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recommended annual fee for {customer}, derived from the value statement and {wonCount} comparable won deals.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-[10px] font-medium text-[#16345e]" title="Set in Analytics → Strategy Engine">
            <SlidersHorizontal className="w-3 h-3" />
            {posture.label} posture
          </span>
        </div>

        <div className="rounded-md border p-4 flex flex-col bg-blue-50 border-blue-200 ring-1 ring-blue-300">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold text-white bg-[#16345e]">
                {suggested.grade}
              </span>
              <span className="text-sm font-semibold text-[#16345e]">{suggested.name}</span>
            </div>
            {strategy.autoApply ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-semibold uppercase tracking-wide">
                <Check className="w-2.5 h-2.5" /> Applied
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-300 text-[#16345e] text-[9px] font-semibold uppercase tracking-wide">
                Recommended
              </span>
            )}
          </div>

          <div className="text-2xl font-bold text-[#16345e] tnum">{fmtCurrency(suggested.price)}</div>
          <div className="text-[11px] text-slate-500 tnum mb-3">
            {suggested.discountPct.toFixed(1)}% off list · {suggested.marginPct}% margin
          </div>

          {/* Approval / floor status driven by the Strategy Engine */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {resolution.needsApproval ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Lock className="w-3 h-3" /> Exceeds {strategy.approvalThreshold}% — deal-desk approval
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Within rep authority ({strategy.approvalThreshold}%)
              </span>
            )}
            {resolution.belowFloor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="w-3 h-3" /> Below {strategy.marginFloor}% margin floor
              </span>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-200/70 pt-2.5 mt-auto">
            <RationaleLine label={`Why ${posture.label}`} text={`${posture.tagline}. ${posture.description}`} color="text-[#16345e]" />
            <RationaleLine label="Customer" text={suggested.customerRationale} color="text-[#16345e]" />
            <RationaleLine label="Deal" text={suggested.dealRationale} color="text-[#16345e]" />
            {strategy.context.trim() && (
              <RationaleLine label="Guidance" text={strategy.context.trim()} color="text-[#16345e]" />
            )}
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => setShowAlternatives(v => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
          >
            {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAlternatives ? 'Hide alternative scenarios' : 'Show alternative scenarios (A/C)'}
          </button>

          {showAlternatives && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {alternatives.map(tier => {
                const s = gradeStyles[tier.grade];
                return (
                  <div key={tier.grade} className="rounded-md border p-4 flex flex-col bg-white border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold text-white ${s.badge}`}>
                          {tier.grade}
                        </span>
                        <span className={`text-sm font-semibold ${s.text}`}>{tier.name}</span>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${s.text} tnum`}>{fmtCurrency(tier.price)}</div>
                    <div className="text-[11px] text-slate-500 tnum mb-3">
                      {tier.discountPct.toFixed(1)}% off list · {tier.marginPct}% margin
                    </div>
                    <div className="space-y-2 border-t border-slate-200/70 pt-2.5 mt-auto">
                      <RationaleLine label="Strategy" text={tier.strategy} color={s.text} />
                      <RationaleLine label="Customer" text={tier.customerRationale} color={s.text} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Price position vs peers ── */}
      <section className="rounded-md border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">Price Position vs. Comparable Won Deals</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium tnum">{peerDeals.length} Peer Matches</span>
        </div>

        <div className="p-4 space-y-4">
          {/* Tier markers above the bar */}
          <div className="grid grid-cols-3 gap-3">
            {tiers.map(tier => {
              const s = gradeStyles[tier.grade];
              const isRec = tier.grade === resolution.grade;
              return (
                <div key={tier.grade} className={`rounded border px-3 py-2 text-center ${isRec ? `${s.chip} ring-1 ${s.ring}` : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-bold text-white ${s.badge}`}>{tier.grade}</span>
                    <span className="text-[11px] font-medium text-slate-600">{tier.name}</span>
                  </div>
                  <div className={`text-sm font-bold ${s.text} tnum mt-0.5`}>{fmtCurrency(tier.price)}</div>
                  <div className="text-[10px] text-slate-400 tnum">{tier.discountPct.toFixed(1)}% off list</div>
                </div>
              );
            })}
          </div>

          {/* Spectrum bar */}
          <div className="pt-1">
            <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500">
              {tiers.map(tier => {
                const left = Math.min(98, (tier.discountPct / positionScale) * 100);
                return (
                  <div
                    key={tier.grade}
                    className="absolute -top-1 -translate-x-1/2"
                    style={{ left: `${left}%` }}
                    title={`${tier.name} · ${tier.discountPct.toFixed(1)}% off`}
                  >
                    <span className={`block w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-300 ${gradeStyles[tier.grade].marker}`} />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] font-medium">
              <span className="text-emerald-700">◀ Higher price · stronger margin</span>
              <span className="text-red-600">Lower price · more discount ▶</span>
            </div>
          </div>

          {/* Position banner */}
          <div className="flex items-start gap-2 px-3 py-2 rounded bg-blue-50 border border-blue-200">
            <Info className="w-3.5 h-3.5 text-[#16345e] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700">
              <span className="font-semibold text-[#16345e]">{posture.label} posture</span> opens this deal at <span className="font-semibold">Grade {suggested.grade}</span> ({suggested.discountPct.toFixed(0)}% off list).
              {resolution.needsApproval
                ? ' This exceeds rep authority and routes to deal desk.'
                : ' This is within rep authority and competitive against peers.'}
              {' '}Adjust in Analytics → Strategy Engine.
            </p>
          </div>
        </div>
      </section>

      {/* ── Historical peer transactions ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Historical Peer Transactions</h3>
          <span className="text-xs text-slate-400">who {customer} is compared against</span>
        </div>

        {/* Match profile cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <MatchCard icon={Users} label="Peer Matches" value={`${peerDeals.length}`} sub="same segment" />
          <MatchCard icon={Building2} label="Industry" value="Manufacturing" sub="100% match" />
          <MatchCard icon={Layers} label="Segment" value="Enterprise" sub="Match" />
          <MatchCard icon={MapPin} label="Geography" value="North America" sub={channel} />
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sort by</span>
          {([
            { key: 'discount', label: 'Discount' },
            { key: 'net', label: 'Net price' },
            { key: 'volume', label: 'Card volume' },
          ] as { key: SortKey; label: string }[]).map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                sortKey === opt.key
                  ? 'bg-[#16345e] text-white border-[#16345e]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Peer table */}
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-[44px]">Grade</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Card Vol</th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">List</th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Net</th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Disc.</th>
                <th className="text-left py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedPeers.map((p, i) => {
                const s = gradeStyles[p.grade];
                return (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="py-2 px-3">
                      <span className={`w-4 h-4 rounded-sm inline-flex items-center justify-center text-[9px] font-bold text-white ${s.badge}`}>{p.grade}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-800 font-medium">{p.customer}</span>
                        {p.sameTier && (
                          <span className="px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200 rounded">Same tier</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{p.industry}</td>
                    <td className="py-2 px-3 text-right text-slate-600 tnum">${p.cardVolume}M</td>
                    <td className="py-2 px-3 text-right text-slate-500 tnum">{fmtCurrency(p.list)}</td>
                    <td className="py-2 px-3 text-right text-slate-800 font-medium tnum">{fmtCurrency(p.net)}</td>
                    <td className={`py-2 px-3 text-right tnum font-medium ${p.discountPct >= 10 ? 'text-red-600' : p.discountPct >= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {p.discountPct.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${p.status === 'Won' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">* Illustrative same-industry comparables matched to this deal&apos;s scale and segment.</p>
      </section>
    </div>
  );
}

function RationaleLine({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <p className="text-[11px] leading-relaxed text-slate-600">
      <span className={`font-semibold ${color}`}>{label} ·</span> {text}
    </p>
  );
}

function MatchCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      <p className="text-[10px] text-slate-400 truncate">{sub}</p>
    </div>
  );
}
