import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import IntakeSourceBar from '@/components/IntakeSourceBar';
import { channelAccent, formatDate, pricingRecords } from '@/lib/pricingMetrics';

// Only real deals we have actual source files for (POC Deals/JPM, /BOA, /53).
// No fabricated companies, owners, or dollar values — just what's verifiable
// from the real intake emails and workbooks.
interface RealDeal {
  id: string;
  client: string;
  channel: string;
  received: string;
}

const realDeals: RealDeal[] = [
  {
    id: 'deal-001',
    client: 'Denton County Electric Cooperative, Inc.',
    channel: 'JPMorgan Chase',
    received: '2026-01-16',
  },
  {
    id: 'abg-bofa',
    client: 'Authentic Brands Group LLC',
    channel: 'Bank of America',
    received: '2026-05-18',
  },
  {
    id: 'illume-ag-53',
    client: 'Illume Ag',
    channel: 'Fifth Third Bank',
    received: '2025-11-04',
  },
];

const bankInitials: Record<string, string> = {
  'JPMorgan Chase': 'JPM',
  'Bank of America': 'BofA',
  'Fifth Third Bank': '5/3',
};

const bankLogos: Record<string, { src: string; alt: string }> = {
  'JPMorgan Chase': { src: '/logos/banks/jpmorgan.svg', alt: 'JPMorgan Chase logo' },
  'Bank of America': { src: '/logos/banks/bank-of-america.svg', alt: 'Bank of America logo' },
  'Fifth Third Bank': { src: '/logos/banks/fifth-third.svg', alt: 'Fifth Third Bank logo' },
};

const DEAL_ROW_GRID =
  'grid-cols-[minmax(320px,1.45fr)_minmax(180px,0.8fr)_minmax(250px,1fr)_120px]';

/**
 * Deal size tier, derived from the real file spend on each deal (see
 * lib/pricingMetrics.ts) but shown only as a category, not a dollar figure —
 * this is the priority a pricing analyst would actually work off of.
 */
function priorityOf(spend: number | null): { label: string; tone: string } {
  if (spend === null) return { label: 'Standard', tone: '#64748b' };
  if (spend >= 500_000_000) return { label: 'High priority', tone: '#dc2626' };
  if (spend >= 50_000_000) return { label: 'Medium priority', tone: '#d97706' };
  return { label: 'Standard priority', tone: '#64748b' };
}

function DealRow({ deal }: { deal: RealDeal }) {
  const accent = channelAccent[deal.channel] ?? '#64748b';
  const record = pricingRecords.find((r) => r.id === deal.id);
  const priority = priorityOf(record?.totalFileSpend ?? null);
  const logo = bankLogos[deal.channel];

  return (
    <Link
      href={`/deals/${deal.id}`}
      className={`group grid ${DEAL_ROW_GRID} items-center gap-4 border-t border-slate-100 bg-white px-5 py-4 transition-colors first:border-t-0 hover:bg-slate-50`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="grid h-9 w-14 shrink-0 place-items-center rounded-md border bg-white px-1"
          style={{ borderColor: accent, color: accent }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt={logo.alt} className="h-4 w-full object-contain" />
          ) : (
            <span className="text-[11px] font-bold tracking-tight">
              {bankInitials[deal.channel] ?? deal.channel.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
            {deal.channel}
          </div>
          <div className="truncate text-[14px] font-semibold leading-tight text-slate-900">{deal.client}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: priority.tone }} />
        <span className="text-[12px] font-medium" style={{ color: priority.tone }}>
          {priority.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[11.5px]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Requested</div>
          <div className="mt-0.5 text-slate-600">
            {record ? formatDate(record.requestedAt) : formatDate(deal.received)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Delivered</div>
          <div className="mt-0.5 text-slate-600">{record?.completedAt ? formatDate(record.completedAt) : '—'}</div>
        </div>
      </div>

      <span className="flex items-center justify-self-end gap-1 text-[12px] font-semibold text-[#0f3460]">
        Open workspace
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function DealsPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center gap-4">
            {/* Mark cropped from the logo in Bottomline's own email signature. */}
            <div className="flex shrink-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/bottomline-mark.png" alt="" className="h-7 w-7" />
              <span className="text-[19px] font-bold leading-none tracking-[-0.02em] text-[#33343b]">
                Bottomline
              </span>
            </div>
            <Link
              href="/dashboard"
              className="ml-auto flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6">
          <IntakeSourceBar />
        </div>

        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-500">All deals</h2>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className={`grid ${DEAL_ROW_GRID} gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400`}>
            <div>Bank / client</div>
            <div>Priority</div>
            <div>Timeline</div>
            <div className="justify-self-end">Action</div>
          </div>
          {realDeals.map((deal) => (
            <DealRow key={deal.id} deal={deal} />
          ))}
        </div>

        <p className="mt-8 text-center text-[10.5px] text-slate-400">
          Every workspace above runs the real cleaning, matching, pricing and value-statement engines against
          the bank&rsquo;s delivered files — nothing on this page is a mock.
        </p>
      </div>
    </main>
  );
}
