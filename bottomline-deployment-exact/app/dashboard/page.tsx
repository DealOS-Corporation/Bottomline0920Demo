'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Link2Off,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import {
  BLUE,
  Period,
  PricingRecord,
  averageSlaDays,
  channelAccent,
  completedRecords,
  completionBuckets,
  formatCurrency,
  formatDate,
  pricingRecords,
  slaDays,
  valueFunnel,
} from '@/lib/pricingMetrics';
import { AreaTrend, Donut, Funnel, Gauge, Lollipop, Ring } from '@/components/charts';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'weekly', label: 'Week' },
  { id: 'monthly', label: 'Month' },
  { id: 'annually', label: 'Year' },
];

const TARGET_KEY = 'dealos:dashboard-targets';
const DEFAULT_TARGETS = { turnaroundDays: 3, dayOnePct: 2, sfCoveragePct: 100 };
type Targets = typeof DEFAULT_TARGETS;

function useReveal(deps: unknown[]) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return on;
}

function useCountUp(target: number, deps: unknown[], ms = 850) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ...deps]);
  return value;
}

function Card({
  title,
  hint,
  right,
  children,
  className = '',
  bodyClass = 'px-5 py-4',
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,37,64,0.05)] ${className}`}
    >
      <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-3">
        <div className="min-w-0">
          <h2 className="text-[12.5px] font-semibold tracking-tight text-slate-900">{title}</h2>
          {hint && <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{hint}</p>}
        </div>
        {right && <div className="ml-auto shrink-0">{right}</div>}
      </header>
      <div className={`min-h-0 flex-1 ${bodyClass}`}>{children}</div>
    </section>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  status?: { ok: boolean; text: string };
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(10,37,64,0.05)] transition-shadow hover:shadow-[0_6px_20px_rgba(10,37,64,0.08)]">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: BLUE[50], color: BLUE[600] }}>
          {icon}
        </span>
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        {status && (
          <span
            className={`ml-auto rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ${
              status.ok ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {status.text}
          </span>
        )}
      </div>
      <div className="mt-2.5 font-mono text-[26px] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-slate-500">{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [banks, setBanks] = useState<string[]>([]);
  const [year, setYear] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);
  const [showTargets, setShowTargets] = useState(false);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: 'completedAt', dir: -1 });
  const [stage, setStage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TARGET_KEY);
      if (raw) setTargets({ ...DEFAULT_TARGETS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const setTarget = (patch: Partial<Targets>) =>
    setTargets((t) => {
      const next = { ...t, ...patch };
      window.localStorage.setItem(TARGET_KEY, JSON.stringify(next));
      return next;
    });

  const allChannels = useMemo(() => Array.from(new Set(pricingRecords.map((r) => r.channel))), []);
  const years = useMemo(
    () =>
      Array.from(new Set(pricingRecords.map((r) => new Date(r.requestedAt).getUTCFullYear()))).sort(
        (a, b) => b - a,
      ),
    [],
  );

  const records = useMemo(
    () =>
      pricingRecords.filter((r) => {
        if (banks.length && !banks.includes(r.channel)) return false;
        if (year !== 'all' && String(new Date(r.requestedAt).getUTCFullYear()) !== year) return false;
        if (query && !`${r.client} ${r.channel}`.toLowerCase().includes(query.toLowerCase())) return false;
        if (onlyGaps && r.sfOpportunityId) return false;
        return true;
      }),
    [banks, year, query, onlyGaps],
  );

  const filtersOn = banks.length > 0 || year !== 'all' || query !== '' || onlyGaps;
  const clearFilters = () => {
    setBanks([]);
    setYear('all');
    setQuery('');
    setOnlyGaps(false);
  };

  const done = completedRecords(records);
  const funnelStages = useMemo(() => valueFunnel(records), [records]);
  const buckets = useMemo(() => completionBuckets(period, records), [period, records]);
  const avgSla = averageSlaDays(done) ?? 0;

  const fileSpend = funnelStages[0]?.spend ?? 0;
  const dayOne = funnelStages[3]?.spend ?? 0;
  const dayOnePct = fileSpend ? (dayOne / fileSpend) * 100 : 0;
  const vendors = done.reduce((t, r) => t + r.funnel.vendors, 0);
  const transactions = done.reduce((t, r) => t + r.funnel.transactions, 0);
  const sfLinked = records.filter((r) => r.sfOpportunityId).length;
  const sfPct = records.length ? (sfLinked / records.length) * 100 : 0;
  const slowest = Math.max(...done.map((r) => slaDays(r) ?? 0), targets.turnaroundDays, 1);

  const fkey = `${banks.join()}|${year}|${query}|${onlyGaps}`;
  const on = useReveal([fkey, period]);
  const cSpend = useCountUp(fileSpend, [fkey]);
  const cDayOne = useCountUp(dayOne, [fkey]);
  const cSla = useCountUp(avgSla, [fkey]);
  const cDone = useCountUp(done.length, [fkey]);

  const trend = useMemo(() => {
    let cum = 0;
    return buckets.map((b) => {
      cum += b.total;
      return { label: b.label, value: cum, marks: b.total };
    });
  }, [buckets]);

  const sorted = useMemo(() => {
    const val = (r: PricingRecord): string | number => {
      switch (sort.key) {
        case 'client': return r.client;
        case 'channel': return r.channel;
        case 'sla': return slaDays(r) ?? 0;
        case 'spend': return r.funnel.fileSpend;
        case 'dayone': return r.funnel.dayOneCardSpend;
        default: return Date.parse(r.completedAt ?? r.requestedAt);
      }
    };
    return [...records].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (typeof x === 'string' && typeof y === 'string') return x.localeCompare(y) * sort.dir;
      return ((x as number) - (y as number)) * sort.dir;
    });
  }, [records, sort]);

  const toggleSort = (k: string) =>
    setSort((s) => (s.key === k ? { key: k, dir: (s.dir * -1) as 1 | -1 } : { key: k, dir: -1 }));

  const chip = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
      active
        ? 'border-transparent bg-[#0f3460] text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
    }`;

  return (
    <main className="min-h-screen bg-[#f5f8fc]">
      {/* ------------------------------------------------------------ header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-6 py-2.5">
          <Link href="/deals" className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" />
            All deals
          </Link>
          <span className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: BLUE[800] }}>
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-[14.5px] font-semibold leading-tight tracking-tight text-slate-900">
                Pricing Operations
              </h1>
              <p className="text-[10.5px] leading-tight text-slate-500">
                Computed live from the delivered POC files
              </p>
            </div>
          </div>

          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search client or bank"
              className="w-56 rounded-md border border-slate-200 py-1.5 pl-8 pr-3 text-[12px] outline-none placeholder:text-slate-400 focus:border-[#2d7ff9]"
            />
          </div>
          <button
            onClick={() => setShowTargets((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
              showTargets ? 'border-transparent bg-[#0f3460] text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            Targets
          </button>
        </div>

        {/* ------------------------------------------------------- filter bar */}
        <div className="border-t border-slate-100 bg-white/70">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-6 py-2">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <button onClick={() => setBanks([])} className={chip(banks.length === 0)}>
              All banks
            </button>
            {allChannels.map((c) => {
              const active = banks.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => setBanks((b) => (active ? b.filter((x) => x !== c) : [...b, c]))}
                  className={`flex items-center gap-1.5 ${chip(active)}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#fff' : channelAccent[c] }} />
                  {c}
                </button>
              );
            })}

            <span className="mx-1 h-4 w-px bg-slate-200" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 outline-none hover:border-slate-300"
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  Requested {y}
                </option>
              ))}
            </select>

            <button onClick={() => setOnlyGaps((v) => !v)} className={`flex items-center gap-1.5 ${chip(onlyGaps)}`}>
              <Link2Off className="h-3 w-3" />
              No SF opportunity
            </button>

            <span className="ml-auto text-[11px] tabular-nums text-slate-500">
              {records.length} of {pricingRecords.length} pricings
            </span>
            {filtersOn && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* --------------------------------------------------- target editor */}
        {showTargets && (
          <div className="border-t border-slate-100" style={{ background: BLUE[50] }}>
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-end gap-5 px-6 py-3">
              {(
                [
                  { k: 'turnaroundDays', label: 'Turnaround target', unit: 'days', step: 0.5, max: 30 },
                  { k: 'dayOnePct', label: 'Day-one card target', unit: '% of file', step: 0.5, max: 100 },
                  { k: 'sfCoveragePct', label: 'Salesforce coverage target', unit: '%', step: 5, max: 100 },
                ] as const
              ).map((t) => (
                <label key={t.k} className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t.label}</span>
                  <span className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={t.max}
                      step={t.step}
                      value={targets[t.k]}
                      onChange={(e) => setTarget({ [t.k]: Number(e.target.value) } as Partial<Targets>)}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[12px] tabular-nums outline-none focus:border-[#2d7ff9]"
                    />
                    <span className="text-[10.5px] text-slate-500">{t.unit}</span>
                  </span>
                </label>
              ))}
              <button
                onClick={() => setTarget(DEFAULT_TARGETS)}
                className="mb-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <span className="mb-1.5 max-w-md text-[10.5px] leading-snug text-slate-500">
                Targets are yours to set — they drive the status badges and the marker lines, and are saved in
                this browser. Nothing here is a Bottomline-published SLA.
              </span>
              <button onClick={() => setShowTargets(false)} className="mb-1 ml-auto text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {records.length === 0 ? (
        <div className="mx-auto max-w-[1440px] px-6 py-16 text-center">
          <p className="text-[13px] font-medium text-slate-700">No pricings match these filters.</p>
          <button onClick={clearFilters} className="mt-3 rounded-md bg-[#0f3460] px-3 py-1.5 text-[12px] font-semibold text-white">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-[1440px] space-y-4 px-6 py-4">
          {/* ---------------------------------------------------------- KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Pricings delivered"
              value={cDone.toFixed(0)}
              sub={`${vendors.toLocaleString()} vendors · ${transactions.toLocaleString()} payments priced`}
            />
            <Kpi
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Average turnaround"
              value={`${cSla.toFixed(1)}d`}
              sub={`Request email to delivered analysis`}
              status={{
                ok: avgSla <= targets.turnaroundDays,
                text: avgSla <= targets.turnaroundDays ? 'On target' : `+${(avgSla - targets.turnaroundDays).toFixed(1)}d`,
              }}
            />
            <Kpi
              icon={<Wallet className="h-3.5 w-3.5" />}
              label="Spend priced"
              value={formatCurrency(cSpend)}
              sub={`Across ${done.length} delivered ${done.length === 1 ? 'analysis' : 'analyses'}`}
            />
            <Kpi
              icon={<CreditCard className="h-3.5 w-3.5" />}
              label="Day-one card value"
              value={formatCurrency(cDayOne)}
              sub={`${dayOnePct.toFixed(1)}% of file spend billable at go-live`}
              status={{
                ok: dayOnePct >= targets.dayOnePct,
                text: dayOnePct >= targets.dayOnePct ? 'On target' : `${(targets.dayOnePct - dayOnePct).toFixed(1)}pp short`,
              }}
            />
          </div>

          {/* ------------------------------------- funnel · gauge · donut */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card
              className="lg:col-span-5"
              title="Where the spend lands"
              hint="Vendor file narrowing to what is billable on day one"
            >
              <Funnel
                on={on}
                activeId={stage}
                onHover={setStage}
                data={funnelStages.map((s) => ({
                  id: s.id,
                  label: s.label,
                  hint: s.hint,
                  value: s.spend,
                  share: s.shareOfFile,
                  display: formatCurrency(s.spend),
                }))}
              />
            </Card>

            <Card
              className="lg:col-span-3"
              title="Turnaround vs target"
              hint="Tick on the arc is your target"
            >
              <div className="flex h-full flex-col justify-between gap-2">
                <Gauge value={avgSla} target={targets.turnaroundDays} max={Math.ceil(slowest * 1.35)} on={on} />
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-[10.5px] text-slate-500">Fastest / slowest</span>
                  <span className="font-mono text-[11.5px] font-semibold tabular-nums text-slate-900">
                    {Math.min(...done.map((r) => slaDays(r) ?? 0)).toFixed(1)}d –{' '}
                    {Math.max(...done.map((r) => slaDays(r) ?? 0)).toFixed(1)}d
                  </span>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-4" title="Share of spend priced" hint="Which channel the volume comes from">
              <div className="flex items-center gap-5">
                <Donut
                  on={on}
                  centerTop={formatCurrency(fileSpend)}
                  centerSub="total priced"
                  segments={done
                    .slice()
                    .sort((a, b) => b.funnel.fileSpend - a.funnel.fileSpend)
                    .map((r) => ({
                      id: r.id,
                      label: r.channel,
                      value: r.funnel.fileSpend,
                      color: channelAccent[r.channel],
                    }))}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  {done
                    .slice()
                    .sort((a, b) => b.funnel.fileSpend - a.funnel.fileSpend)
                    .map((r) => (
                      <div key={r.id} className="flex items-baseline gap-2 text-[11px]">
                        <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: channelAccent[r.channel] }} />
                        <span className="truncate text-slate-600">{r.channel}</span>
                        <span className="ml-auto shrink-0 font-mono tabular-nums text-slate-900">
                          {formatCurrency(r.funnel.fileSpend)}
                        </span>
                        <span className="w-9 shrink-0 text-right font-mono tabular-nums text-slate-400">
                          {((r.funnel.fileSpend / (fileSpend || 1)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>

          {/* --------------------------- trend · lollipop · completeness */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card
              className="lg:col-span-5"
              title="Cumulative deliveries"
              hint="Dots mark periods where an analysis went back to the bank"
              right={
                <div className="flex items-center rounded-md border border-slate-200 p-0.5">
                  {PERIODS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                        period === p.id ? 'bg-[#0f3460] text-white' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              }
            >
              <AreaTrend points={trend} on={on} />
              <div className="mt-1 flex justify-between text-[9.5px] text-slate-400">
                <span>{trend[0]?.label}</span>
                <span>{trend[trend.length - 1]?.label}</span>
              </div>
            </Card>

            <Card className="lg:col-span-4" title="Turnaround by deal" hint="Dot is the delivered turnaround">
              <Lollipop
                on={on}
                target={targets.turnaroundDays}
                max={Math.ceil(slowest * 1.15)}
                rows={done
                  .slice()
                  .sort((a, b) => (slaDays(b) ?? 0) - (slaDays(a) ?? 0))
                  .map((r) => ({
                    id: r.id,
                    label: r.client,
                    value: slaDays(r) ?? 0,
                    color: channelAccent[r.channel],
                  }))}
              />
            </Card>

            <Card className="lg:col-span-3" title="Record completeness" hint="Gaps Bottomline tracks in Salesforce">
              <div className="flex h-full items-center justify-around gap-2">
                <Ring
                  on={on}
                  pct={sfPct / 100}
                  label={`${sfLinked}/${records.length}`}
                  caption="SF opportunity linked"
                  color={sfPct >= targets.sfCoveragePct ? BLUE[500] : '#d97706'}
                />
                <Ring
                  on={on}
                  pct={done.length ? done.filter((r) => r.totalFileSpend !== null).length / done.length : 0}
                  label={`${done.filter((r) => r.totalFileSpend !== null).length}/${done.length}`}
                  caption="Spend captured"
                />
                <Ring
                  on={on}
                  pct={done.length ? done.filter((r) => r.openAcceptorValue !== null).length / done.length : 0}
                  label={`${done.filter((r) => r.openAcceptorValue !== null).length}/${done.length}`}
                  caption="Open Acceptor captured"
                />
              </div>
            </Card>
          </div>

          {/* ------------------------------------------------------ register */}
          <Card title="Pricing register" hint="Click a row to open its workspace" bodyClass="">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      { k: 'client', label: 'Client', a: 'text-left' },
                      { k: 'channel', label: 'Bank', a: 'text-left' },
                      { k: 'completedAt', label: 'Delivered', a: 'text-right' },
                      { k: 'sla', label: 'Turnaround', a: 'text-right' },
                      { k: 'spend', label: 'File spend', a: 'text-right' },
                      { k: 'dayone', label: 'Day-one card', a: 'text-right' },
                    ].map((c) => (
                      <th
                        key={c.k}
                        onClick={() => toggleSort(c.k)}
                        className={`cursor-pointer select-none px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-700 ${c.a}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {c.label}
                          <ArrowUpDown className={`h-2.5 w-2.5 ${sort.key === c.k ? 'text-slate-600' : 'text-slate-300'}`} />
                        </span>
                      </th>
                    ))}
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Salesforce
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => {
                    const d = slaDays(r) ?? 0;
                    const over = d > targets.turnaroundDays;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => { window.location.href = `/deals/${r.id}`; }}
                        className="group cursor-pointer border-b border-slate-50 transition-colors last:border-0 hover:bg-[#f5f8fc]"
                      >
                        <td className="px-5 py-2.5">
                          <span className="flex items-center gap-1.5 font-medium text-slate-900">
                            {r.client}
                            <ChevronRight className="h-3 w-3 -translate-x-1 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                          </span>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: channelAccent[r.channel] }} />
                            {r.channel}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-slate-600">
                          {r.completedAt ? formatDate(r.completedAt) : '—'}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span
                            className={`font-mono tabular-nums ${over ? 'font-semibold text-amber-600' : 'text-slate-900'}`}
                          >
                            {d.toFixed(1)}d
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-900">
                          {formatCurrency(r.funnel.fileSpend)}
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-900">
                          {formatCurrency(r.funnel.dayOneCardSpend)}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          {r.sfOpportunityId ? (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-medium text-sky-700">
                              {r.sfOpportunityId}
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              Not linked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="pb-2 text-[10px] leading-relaxed text-slate-400">
            Turnaround comes from the request and delivery email timestamps. Spend, campaign targets, network
            matches and day-one card value are read from each deal&rsquo;s delivered internal value statement.
            Targets are set by you and stored locally.
          </p>
        </div>
      )}
    </main>
  );
}
