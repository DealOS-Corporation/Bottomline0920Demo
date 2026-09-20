/**
 * Management-tracking metrics requested by Bottomline (Jaime Condie, 2026-08):
 * pricings completed by period + channel, average SLA, pricings without an SF
 * Opportunity, completed pricings missing spend, completed pricings missing an
 * Open Acceptor value.
 *
 * Every value below is read from a real POC artifact — no fabricated deals.
 *   requestedAt / completedAt : Date headers of the real request + delivery .eml
 *   totalFileSpend            : Internal Value Statement, *Data Converted*!B5
 *                               ("Total Spend in Original File")
 *   openAcceptorValue         : Internal Value Statement, Calculations!J12 + J13
 *                               ("Card Network Open Acceptor" + "ESN Open Acceptor")
 *   sfOpportunityId           : only exists where step 9 actually synced (lib/runData.ts)
 */

export interface PricingRecord {
  id: string;
  client: string;
  channel: string;
  /** Bank analysis request received (request email timestamp). */
  requestedAt: string;
  /** Quoting analysis delivered back to the bank, or null if still in flight. */
  completedAt: string | null;
  sfOpportunityId: string | null;
  totalFileSpend: number | null;
  openAcceptorValue: number | null;
  /**
   * The value funnel for this deal, read off the delivered File 8 converted tab
   * ("Total ... in Original File", "Campaign Targets - ...", "Network Matches - ...",
   * "Day One Card ..."). Same source as totalFileSpend, so the two always agree.
   */
  funnel: {
    vendors: number;
    transactions: number;
    fileSpend: number;
    targetSpend: number;
    networkMatchedSpend: number;
    dayOneCardSpend: number;
    targetVendors: number;
    networkMatchedVendors: number;
  };
  /** Where the numbers above came from, shown in the UI. */
  source: string;
  /** Whether a full interactive workspace exists for this deal. */
  interactive: boolean;
}

export const pricingRecords: PricingRecord[] = [
  {
    id: 'deal-001',
    client: 'Denton County Electric Cooperative, Inc.',
    channel: 'JPMorgan Chase',
    requestedAt: '2026-01-14T17:09:17Z',
    completedAt: '2026-01-16T19:12:44Z',
    sfOpportunityId: 'OPP-JPM-DCEC-2026',
    totalFileSpend: 761_331_684.49,
    openAcceptorValue: 3_830_318.58 + 49_516.32,
    funnel: {
      vendors: 625,
      transactions: 5_981,
      fileSpend: 761_331_684.49,
      targetSpend: 674_330_821.74,
      networkMatchedSpend: 322_120_877.71,
      dayOneCardSpend: 3_879_834.90,
      targetVendors: 481,
      networkMatchedVendors: 170,
    },
    source: 'POC Deals/JPM · Bottomline_Internal_Value Statement_Denton Co Electric Coop_2026_01_16.xlsx',
    interactive: true,
  },
  {
    id: 'abg-bofa',
    client: 'Authentic Brands Group LLC',
    channel: 'Bank of America',
    requestedAt: '2026-05-18T16:06:57Z',
    completedAt: '2026-05-22T16:02:35Z',
    sfOpportunityId: null,
    totalFileSpend: 148_366_871.39,
    openAcceptorValue: 5_360_095.51,
    funnel: {
      vendors: 1_516,
      transactions: 12_481,
      fileSpend: 148_366_871.39,
      targetSpend: 116_811_923.96,
      networkMatchedSpend: 36_407_064.52,
      dayOneCardSpend: 5_360_095.51,
      targetVendors: 1_213,
      networkMatchedVendors: 191,
    },
    source: 'POC Deals/BOA · 8_Bottomline_Internal_Value Statement_Authentic Brands Group_2026_05_22_CompPay.xlsx',
    interactive: true,
  },
  {
    id: 'illume-ag-53',
    client: 'Illume Ag',
    channel: 'Fifth Third Bank',
    requestedAt: '2025-11-04T17:30:35Z',
    completedAt: '2025-11-07T13:23:39Z',
    sfOpportunityId: null,
    totalFileSpend: 21_834_520.76,
    openAcceptorValue: 547_310.40,
    funnel: {
      vendors: 466,
      transactions: 3_666,
      fileSpend: 21_834_520.76,
      targetSpend: 21_653_151.16,
      networkMatchedSpend: 4_634_266.00,
      dayOneCardSpend: 547_310.40,
      targetVendors: 457,
      networkMatchedVendors: 75,
    },
    source: 'POC Deals/53 · Bottomline_Internal_Illume Ag_2025_11_07.xlsx',
    interactive: true,
  },
];

/**
 * Bottomline is a blue brand, so channels are shades of one blue ramp rather
 * than each bank's own logo colour — three saturated brand colours side by side
 * read as noise on a dashboard.
 */
export const channelAccent: Record<string, string> = {
  'JPMorgan Chase': '#0f3460',
  'Bank of America': '#2d7ff9',
  'Fifth Third Bank': '#7cc0ff',
};

/** Shared blue scale for every surface on the dashboard. */
export const BLUE = {
  950: '#071a30',
  900: '#0a2540',
  800: '#0f3460',
  700: '#16345e',
  600: '#1d5b9e',
  500: '#2d7ff9',
  400: '#5da2fb',
  300: '#93c5fd',
  200: '#bfdbfe',
  100: '#e0edff',
  50: '#f2f7ff',
} as const;

export type Period = 'weekly' | 'monthly' | 'annually';

export const completedRecords = (records: PricingRecord[] = pricingRecords) =>
  records.filter((r) => r.completedAt !== null);

/** Calendar-accurate turnaround in days between the request and delivery emails. */
export function slaDays(record: PricingRecord): number | null {
  if (!record.completedAt) return null;
  const ms = Date.parse(record.completedAt) - Date.parse(record.requestedAt);
  return ms / 86_400_000;
}

export function averageSlaDays(records: PricingRecord[] = pricingRecords): number | null {
  const values = records.map(slaDays).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function startOfWeekUtc(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // ISO week starts Monday.
  const shift = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - shift);
  return d;
}

function bucketStart(date: Date, period: Period): Date {
  if (period === 'weekly') return startOfWeekUtc(date);
  if (period === 'monthly') return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

function advance(date: Date, period: Period): Date {
  const d = new Date(date);
  if (period === 'weekly') d.setUTCDate(d.getUTCDate() + 7);
  else if (period === 'monthly') d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}

export function bucketLabel(iso: string, period: Period): string {
  const d = new Date(iso);
  if (period === 'annually') return String(d.getUTCFullYear());
  if (period === 'monthly') {
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export interface CompletionBucket {
  /** ISO timestamp of the bucket start, used as the React key. */
  start: string;
  label: string;
  total: number;
  byChannel: Record<string, number>;
}

/**
 * Continuous buckets spanning the first to the last completion so empty periods
 * stay visible (an empty week is itself a signal for management tracking).
 */
export function completionBuckets(
  period: Period,
  records: PricingRecord[] = pricingRecords,
): CompletionBucket[] {
  const done = completedRecords(records);
  if (done.length === 0) return [];

  const times = done.map((r) => Date.parse(r.completedAt!));
  let cursor = bucketStart(new Date(Math.min(...times)), period);
  const last = bucketStart(new Date(Math.max(...times)), period);

  const buckets: CompletionBucket[] = [];
  while (cursor.getTime() <= last.getTime()) {
    const next = advance(cursor, period);
    const inBucket = done.filter((r) => {
      const t = Date.parse(r.completedAt!);
      return t >= cursor.getTime() && t < next.getTime();
    });
    const byChannel: Record<string, number> = {};
    for (const r of inBucket) byChannel[r.channel] = (byChannel[r.channel] ?? 0) + 1;

    buckets.push({
      start: cursor.toISOString(),
      label: bucketLabel(cursor.toISOString(), period),
      total: inBucket.length,
      byChannel,
    });
    cursor = next;
  }
  return buckets;
}

export interface ChannelSummary {
  channel: string;
  completed: number;
  avgSlaDays: number | null;
  totalSpend: number;
}

export function channelSummaries(records: PricingRecord[] = pricingRecords): ChannelSummary[] {
  const channels = Array.from(new Set(records.map((r) => r.channel)));
  return channels
    .map((channel) => {
      const forChannel = records.filter((r) => r.channel === channel);
      const done = completedRecords(forChannel);
      return {
        channel,
        completed: done.length,
        avgSlaDays: averageSlaDays(done),
        totalSpend: done.reduce((sum, r) => sum + (r.totalFileSpend ?? 0), 0),
      };
    })
    .sort((a, b) => b.completed - a.completed);
}

/** The three data-quality exception lists Bottomline tracks today. */
export const withoutSfOpportunity = (records: PricingRecord[] = pricingRecords) =>
  records.filter((r) => !r.sfOpportunityId);

export const completedMissingSpend = (records: PricingRecord[] = pricingRecords) =>
  completedRecords(records).filter((r) => r.totalFileSpend === null);

export const completedMissingOpenAcceptor = (records: PricingRecord[] = pricingRecords) =>
  completedRecords(records).filter((r) => r.openAcceptorValue === null);

export interface FunnelStage {
  id: string;
  label: string;
  hint: string;
  spend: number;
  /** Share of the raw file spend, so every stage is comparable across deals. */
  shareOfFile: number;
  /** Per-channel split, used for the hover breakdown. */
  byChannel: { channel: string; spend: number }[];
}

/**
 * File spend narrowing down to the value actually bookable on day one — the
 * question every one of these analyses exists to answer.
 */
export function valueFunnel(records: PricingRecord[] = pricingRecords): FunnelStage[] {
  const done = completedRecords(records);
  const sum = (pick: (r: PricingRecord) => number) => done.reduce((t, r) => t + pick(r), 0);
  const fileSpend = sum((r) => r.funnel.fileSpend);

  const stages: { id: string; label: string; hint: string; pick: (r: PricingRecord) => number }[] = [
    { id: 'file', label: 'Spend received', hint: 'Everything in the banks’ vendor files', pick: (r) => r.funnel.fileSpend },
    { id: 'target', label: 'Campaign targets', hint: 'Survives exclusions and is worth enabling', pick: (r) => r.funnel.targetSpend },
    { id: 'matched', label: 'Network matched', hint: 'Already a Paymode member — fastest to convert', pick: (r) => r.funnel.networkMatchedSpend },
    { id: 'dayone', label: 'Day-one card', hint: 'Open acceptors billable from go-live', pick: (r) => r.funnel.dayOneCardSpend },
  ];

  return stages.map((s) => ({
    id: s.id,
    label: s.label,
    hint: s.hint,
    spend: sum(s.pick),
    shareOfFile: fileSpend > 0 ? sum(s.pick) / fileSpend : 0,
    byChannel: done
      .map((r) => ({ channel: r.channel, spend: s.pick(r) }))
      .sort((a, b) => b.spend - a.spend),
  }));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatDays(value: number | null): string {
  if (value === null) return '—';
  return `${value.toFixed(1)} d`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
