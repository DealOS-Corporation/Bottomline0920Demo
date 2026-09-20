'use client';

// ============================================================
//  Hand-rolled SVG charts. The repo has no chart library and one
//  is not worth pulling in for six shapes.
//  Every chart animates from empty when `on` flips true.
// ============================================================

import { useId } from 'react';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const a = polar(cx, cy, r, to);
  const b = polar(cx, cy, r, from);
  const large = to - from <= 180 ? 0 : 1;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y}`;
}

// ------------------------------------------------------------------ funnel
export interface FunnelDatum {
  id: string;
  label: string;
  hint: string;
  value: number;
  share: number;
  display: string;
}

/**
 * Labels sit in their own column so the funnel can keep true proportions —
 * the last stage is ~1% of the file, which is unreadable as inset text.
 */
export function Funnel({
  data,
  on,
  activeId,
  onHover,
  rowHeight = 54,
}: {
  data: FunnelDatum[];
  on: boolean;
  activeId: string | null;
  onHover: (id: string | null) => void;
  rowHeight?: number;
}) {
  const gid = useId();
  const W = 100;
  const H = rowHeight * data.length;
  const widthAt = (share: number) => Math.max(3, share * W);

  return (
    <div className="flex items-stretch gap-3">
      <div className="min-w-0 flex-1">
        {data.map((d, i) => {
          const dim = activeId !== null && activeId !== d.id;
          return (
            <div
              key={d.id}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              className="flex flex-col justify-center border-b border-slate-50 last:border-0"
              style={{ height: rowHeight, opacity: dim ? 0.45 : 1, transition: 'opacity 180ms linear' }}
            >
              <div className="flex items-baseline gap-2">
                <span className="truncate text-[11.5px] font-semibold text-slate-900">{d.label}</span>
                <span className="ml-auto shrink-0 font-mono text-[12.5px] font-semibold tabular-nums text-slate-900">
                  {d.display}
                </span>
                <span className="w-11 shrink-0 text-right font-mono text-[10.5px] tabular-nums text-slate-400">
                  {(d.share * 100).toFixed(1)}%
                </span>
              </div>
              <div className="truncate text-[10.5px] leading-snug text-slate-500">{d.hint}</div>
              {i < data.length - 1 && (
                <div className="mt-0.5 font-mono text-[9.5px] tabular-nums text-slate-400">
                  ↓ keeps {((data[i + 1].value / (d.value || 1)) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-[132px] shrink-0"
        style={{ height: H }}
      >
        <defs>
          <linearGradient id={`${gid}-f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5da2fb" />
            <stop offset="100%" stopColor="#0a2540" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const top = widthAt(i === 0 ? 1 : data[i - 1].share);
          const bottom = widthAt(d.share);
          const y = i * rowHeight;
          const y2 = y + rowHeight - 2;
          const pts = [
            [(W - top) / 2, y],
            [(W + top) / 2, y],
            [(W + bottom) / 2, y2],
            [(W - bottom) / 2, y2],
          ];
          const dim = activeId !== null && activeId !== d.id;
          return (
            <polygon
              key={d.id}
              points={pts.map((p) => p.join(',')).join(' ')}
              fill={`url(#${gid}-f)`}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              style={{
                opacity: on ? (dim ? 0.3 : 1) : 0,
                transform: on ? 'scaleY(1)' : 'scaleY(0.02)',
                transformBox: 'fill-box',
                transformOrigin: 'top',
                transition: `transform 650ms ${EASE} ${i * 90}ms, opacity 400ms linear ${i * 90}ms`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------- donut
export function Donut({
  segments,
  on,
  size = 168,
  thickness = 24,
  centerTop,
  centerSub,
}: {
  segments: { id: string; label: string; value: number; color: string }[];
  on: boolean;
  size?: number;
  thickness?: number;
  centerTop: string;
  centerSub: string;
}) {
  const total = segments.reduce((t, s) => t + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.id}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${on ? len : 0} ${c}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transition: `stroke-dasharray 800ms ${EASE} ${i * 110}ms` }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono text-[19px] font-semibold leading-none tabular-nums text-slate-900">
            {centerTop}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">{centerSub}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- gauge
export function Gauge({
  value,
  target,
  max,
  on,
  unit = 'd',
}: {
  value: number;
  target: number;
  max: number;
  on: boolean;
  unit?: string;
}) {
  const W = 220;
  const H = 128;
  const cx = W / 2;
  const cy = H - 12;
  const r = 88;
  const SPAN = 180;
  const pct = Math.max(0, Math.min(1, value / max));
  const targetPct = Math.max(0, Math.min(1, target / max));
  const good = value <= target;
  const tick = polar(cx, cy, r, -90 + targetPct * SPAN);
  const tickIn = polar(cx, cy, r - 22, -90 + targetPct * SPAN);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      <path d={arc(cx, cy, r, -90, 90)} stroke="#eef2f7" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path
        d={arc(cx, cy, r, -90, -90 + (on ? pct : 0) * SPAN)}
        stroke={good ? '#2d7ff9' : '#d97706'}
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        style={{ transition: `d 900ms ${EASE}` }}
      />
      <line x1={tick.x} y1={tick.y} x2={tickIn.x} y2={tickIn.y} stroke="#0a2540" strokeWidth={2} />
      <text x={cx} y={cy - 34} textAnchor="middle" className="fill-slate-900 font-mono text-[26px] font-semibold tabular-nums">
        {value.toFixed(1)}
        {unit}
      </text>
      <text x={cx} y={cy - 14} textAnchor="middle" className="fill-slate-400 text-[9.5px]">
        target {target.toFixed(1)}
        {unit}
      </text>
    </svg>
  );
}

// -------------------------------------------------------------- area trend
export function AreaTrend({
  points,
  on,
  height = 150,
}: {
  points: { label: string; value: number; marks: number }[];
  on: boolean;
  height?: number;
}) {
  const gid = useId();
  const W = 520;
  const H = height;
  const padX = 14;
  const padY = 18;
  const max = Math.max(...points.map((p) => p.value), 1);
  const x = (i: number) =>
    points.length === 1 ? W / 2 : padX + (i / (points.length - 1)) * (W - padX * 2);
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');
  const area = `${line} L ${x(points.length - 1)} ${H - padY} L ${x(0)} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id={`${gid}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d7ff9" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2d7ff9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.5, 1].map((f) => (
        <line
          key={f}
          x1={padX}
          x2={W - padX}
          y1={y(max * f)}
          y2={y(max * f)}
          stroke="#eef2f7"
          strokeWidth={1}
        />
      ))}
      <path d={area} fill={`url(#${gid}-a)`} opacity={on ? 1 : 0} style={{ transition: 'opacity 700ms' }} />
      <path
        d={line}
        fill="none"
        stroke="#2d7ff9"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={on ? 0 : 1}
        style={{ transition: `stroke-dashoffset 900ms ${EASE}` }}
      />
      {points.map((p, i) =>
        p.marks > 0 ? (
          <circle
            key={p.label}
            cx={x(i)}
            cy={y(p.value)}
            r={on ? 4 : 0}
            fill="#fff"
            stroke="#0f3460"
            strokeWidth={2.5}
            style={{ transition: `r 400ms ${EASE} ${400 + i * 60}ms` }}
          >
            <title>{`${p.label} · ${p.marks} delivered · ${p.value} cumulative`}</title>
          </circle>
        ) : null,
      )}
    </svg>
  );
}

// ---------------------------------------------------------------- lollipop
export function Lollipop({
  rows,
  target,
  max,
  on,
}: {
  rows: { id: string; label: string; value: number; color: string }[];
  target: number;
  max: number;
  on: boolean;
}) {
  return (
    <div className="relative">
      <div
        className="absolute inset-y-0 z-10 border-l border-dashed border-slate-400"
        style={{ left: `${(target / max) * 100}%` }}
      >
        <span className="absolute -top-0.5 left-1 whitespace-nowrap text-[9.5px] font-medium text-slate-400">
          target {target}d
        </span>
      </div>
      <div className="space-y-3.5 pt-4">
        {rows.map((r, i) => {
          const pct = Math.min(1, r.value / max);
          const over = r.value > target;
          return (
            <div key={r.id} className="group">
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="truncate text-[11.5px] text-slate-600">{r.label}</span>
                <span
                  className={`ml-auto shrink-0 font-mono text-[12px] font-semibold tabular-nums ${
                    over ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {r.value.toFixed(1)}d
                </span>
              </div>
              <div className="relative h-2.5">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-100" />
                <div
                  className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                  style={{
                    width: on ? `${pct * 100}%` : '0%',
                    background: over ? '#d97706' : r.color,
                    transition: `width 800ms ${EASE} ${i * 110}ms`,
                  }}
                />
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: on ? `${pct * 100}%` : '0%',
                    background: over ? '#d97706' : r.color,
                    transition: `left 800ms ${EASE} ${i * 110}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------- radial ring
export function Ring({
  pct,
  on,
  label,
  caption,
  size = 74,
  color = '#2d7ff9',
}: {
  pct: number;
  on: boolean;
  label: string;
  caption: string;
  size?: number;
  color?: string;
}) {
  const thickness = 7;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${on ? pct * c : 0} ${c}`}
            style={{ transition: `stroke-dasharray 850ms ${EASE}` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-mono text-[12px] font-semibold tabular-nums text-slate-900">
          {label}
        </div>
      </div>
      <span className="text-center text-[10px] leading-tight text-slate-500">{caption}</span>
    </div>
  );
}
