'use client';

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileQuestion,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Loader2,
  MinusCircle,
} from 'lucide-react';
import { Stage, StageStatus, StageOutput } from '@/lib/pipeline';
import { StageRun, TableData, SegmentOverride, Metric } from '@/lib/runData';
import { valueStatementTabs, SheetCell } from '@/lib/valueStatementWorkbook';
import { deckSlidesFor, DeckRenderSlide } from '@/lib/deckRender';
import { deckFieldsFor, DeckField } from '@/lib/deckFields';
import SendBackCompose from '@/components/SendBackCompose';

interface Tab {
  output: StageOutput;
  stageId: string;
}

interface Props {
  stage: Stage;
  status: StageStatus;
  progress: number;
  run: StageRun | undefined;
  output: StageOutput | null;
  table: TableData | undefined;
  beforeTable: TableData | undefined;
  beforeLabel: string;
  tabs: Tab[];
  /** The deal on screen — drives which deck and which send-back emails are shown. */
  dealId: string;
  /** Rendered deck belonging to this deal; null when the deal shipped no deck. */
  deckMap: string | null;
  /** Figures the analyst typed over in the deck preview, keyed slide:shape:row:col. */
  deckEdits: Record<string, string>;
  onDeckEdit: (key: string, value: string) => void;
  onSelectTab: (t: Tab) => void;
  onDownload: (output: StageOutput) => void;
}

const checkIcon = {
  pass: <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />,
  warn: <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />,
  fail: <XCircle className="h-3 w-3 shrink-0 text-rose-500" />,
};

function SlideDeck({ slides }: { slides: DeckRenderSlide[] }) {
  const [i, setI] = useState(0);
  const slide = slides[i];
  if (!slide) return null;
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center bg-slate-100 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.title}
          className="aspect-[16/9] w-full max-w-3xl rounded-md bg-white object-contain shadow-sm ring-1 ring-slate-200"
        />
      </div>
      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-slate-100 py-1.5">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px] tabular-nums text-slate-500">
          {i + 1} / {slides.length}
        </span>
        <button
          onClick={() => setI((v) => Math.min(slides.length - 1, v + 1))}
          disabled={i === slides.length - 1}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Reveals the real Segment overrides one by one while the classification step runs,
 * so the analyst can watch the engine work through the vendor list instead of
 * staring at a progress bar. Every row shown is a real engine decision.
 */
function ClassificationReveal({ overrides }: { overrides: SegmentOverride[] }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (overrides.length === 0) return;
    const iv = setInterval(() => {
      setShown((n) => {
        if (n >= overrides.length) {
          clearInterval(iv);
          return n;
        }
        return n + 1;
      });
    }, 220);
    return () => clearInterval(iv);
  }, [overrides]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-1.5">
        <Loader2
          className={`h-3 w-3 text-amber-500 ${shown < overrides.length ? 'animate-spin' : 'opacity-0'}`}
        />
        <span className="text-[11.5px] font-medium text-slate-700">
          Applying industry override rules
        </span>
        <span className="ml-auto text-[11px] tabular-nums text-slate-400">
          {shown} of {overrides.length} overrides
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {overrides.slice(0, shown).map((o, i) => (
            <li
              key={`${o.vendor}-${i}`}
              className="animate-fade-in-up rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-slate-800">
                  {o.vendor}
                </span>
                <span className="shrink-0 text-[11px] text-slate-400 line-through">
                  {o.segmentBefore}
                </span>
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="shrink-0 text-[11px] font-semibold text-emerald-700">
                  {o.segmentAfter}
                </span>
              </div>
              <div className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{o.reason}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const CELL_NUM_RE = /^(\$?)(-?\d[\d,]*(?:\.\d+)?)(%|mm|k|K|M|B)?$/;

/** Splits "$1,234.50mm" into prefix / number / suffix, or null when it isn't a number. */
function splitNumeric(text: string) {
  const m = text.trim().match(CELL_NUM_RE);
  return m ? { prefix: m[1] ?? '', body: m[2], suffix: m[3] ?? '' } : null;
}

/**
 * Counts a value up from zero to its real figure, so the number looks like it is
 * being calculated rather than pasted in. Non-numeric text renders as-is.
 */
function CountingCell({ text, duration = 420 }: { text: string; duration?: number }) {
  const [display, setDisplay] = useState(() => {
    const p = splitNumeric(text);
    return p ? `${p.prefix}0${p.suffix}` : text;
  });

  useEffect(() => {
    const p = splitNumeric(text);
    if (!p) {
      setDisplay(text);
      return;
    }
    const target = parseFloat(p.body.replace(/,/g, ''));
    const decimals = (p.body.split('.')[1] ?? '').length;
    const grouped = p.body.includes(',');
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      let s = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
      if (grouped) {
        const [ip, dp] = s.split('.');
        s = Number(ip).toLocaleString('en-US') + (dp ? `.${dp}` : '');
      }
      setDisplay(`${p.prefix}${s}${p.suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return <>{display}</>;
}

/** Wraps every number inside a sentence in a count-up, leaving the words alone. */
function CountingText({ text }: { text: string }) {
  const parts = text.split(/(\$?\d[\d,]*(?:\.\d+)?%?)/g);
  return (
    <>
      {parts.map((p, i) =>
        splitNumeric(p) ? <CountingCell key={i} text={p} duration={600} /> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
/** Time the workbook spends resolving one cell. */
export const EXCEL_CELL_MS = 8;
/** Cells the "just calculated" formula flash trails behind the cursor. */
const FLASH_CELLS = 26;
/** Time one slide stays on screen while the deck renders. */
export const DECK_SLIDE_MS = 400;

/** Slides in this deal's deck — 0 when it never produced one. */
export const deckSlideCountFor = (deckMap: string | null | undefined) =>
  deckSlidesFor(deckMap ?? undefined).length;

export const valueStatementCellCount = valueStatementTabs.reduce(
  (n, t) => n + t.rows.length * t.rows[0].length,
  0,
);

const colRef = (i: number) =>
  i < 26 ? COL_LETTERS[i] : COL_LETTERS[Math.floor(i / 26) - 1] + COL_LETTERS[i % 26];

interface SheetRowProps {
  cells: SheetCell[];
  rowNo: number;
  /** Cells resolved so far in this row. */
  fill: number;
  /** Cells still showing their formula rather than the value. */
  flashFrom: number;
  activeCol: number;
  header: boolean;
  /** Render final values outright, with no count-up. */
  still: boolean;
  rowH: number;
  fontPx: number;
}

const SheetRow = memo(function SheetRow({
  cells,
  rowNo,
  fill,
  flashFrom,
  activeCol,
  header,
  still,
  rowH,
  fontPx,
}: SheetRowProps) {
  return (
    <tr style={{ height: rowH }}>
      <td
        className="border-b border-r border-slate-300 bg-slate-100 px-1 text-center font-medium tabular-nums text-slate-500"
        style={{ fontSize: fontPx - 1, lineHeight: 1, paddingTop: 0, paddingBottom: 0 }}
      >
        {rowNo}
      </td>
      {cells.map((cell, ci) => {
        const written = ci < fill;
        const flashing = written && !!cell.f && ci >= flashFrom;
        const num = /^[$(]?-?\d/.test(cell.v);
        return (
          <td
            key={ci}
            style={{ fontSize: flashing ? fontPx - 1 : fontPx, height: rowH, lineHeight: 1, paddingTop: 0, paddingBottom: 0 }}
            className={[
              'overflow-hidden whitespace-nowrap border-b border-r border-slate-200 px-1.5',
              header ? 'bg-slate-100 font-semibold text-slate-600' : '',
              flashing ? 'bg-amber-50 font-mono text-amber-700' : '',
              !flashing && written && !header && num ? 'text-right tabular-nums font-medium text-emerald-800' : '',
              !flashing && written && !header && !num ? 'text-slate-800' : '',
              ci === activeCol ? 'outline outline-2 -outline-offset-2 outline-emerald-500' : '',
            ].join(' ')}
          >
            {!written ? '' : flashing ? cell.f : num && cell.f && !still ? <CountingCell text={cell.v} /> : cell.v}
          </td>
        );
      })}
    </tr>
  );
});

/**
 * Step 6 replays the real internal value statement recalculating itself: the
 * reviewed vendor rows land in VHF, then each downstream tab resolves its own
 * Excel formulas into the real figures, one tab at a time, on a single screen.
 * Once settled it stays on the workbook so the tabs can be browsed by hand.
 */
function ValueStatementBuild({ metrics, settled = false }: { metrics: Metric[]; settled?: boolean }) {
  const total = valueStatementCellCount;
  const [cursor, setCursor] = useState(settled ? total : 0);
  const [pinnedTab, setPinnedTab] = useState(
    Math.max(0, valueStatementTabs.findIndex((t) => t.name.startsWith('JPM Data Converted'))),
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowH, setRowH] = useState(14);

  useEffect(() => {
    if (settled) return;
    setCursor(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const c = Math.min(total, Math.floor((now - start) / EXCEL_CELL_MS));
      setCursor(c);
      if (c < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, settled]);

  // Which tab the cursor is inside, and how far into it.
  let liveTab = 0;
  let localCursor = cursor;
  for (let i = 0; i < valueStatementTabs.length; i += 1) {
    const size = valueStatementTabs[i].rows.length * valueStatementTabs[i].rows[0].length;
    if (localCursor < size || i === valueStatementTabs.length - 1) {
      liveTab = i;
      break;
    }
    localCursor -= size;
  }
  const tabIndex = settled ? pinnedTab : liveTab;
  const tab = valueStatementTabs[tabIndex];
  const cols = tab.rows[0].length;
  const tabCells = tab.rows.length * cols;
  localCursor = settled ? tabCells : Math.min(localCursor, tabCells);

  useLayoutEffect(() => {
    const measure = () => {
      const h = gridRef.current?.clientHeight ?? 0;
      if (!h) return;
      setRowH(Math.max(9, Math.min(26, Math.floor((h - 22) / tab.rows.length))));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab.rows.length]);

  const fontPx = Math.max(8, Math.min(12, rowH - 2));
  const done = settled || cursor >= total;
  const activeRow = Math.min(tab.rows.length - 1, Math.floor(localCursor / cols));
  const activeCol = done ? -1 : localCursor % cols;
  const activeCell = tab.rows[activeRow]?.[Math.max(0, activeCol)];

  const cellRef = `${colRef(tab.startCol - 1 + Math.max(0, activeCol))}${tab.startRow + activeRow}`;
  const formula = done ? '' : (activeCell?.f ?? activeCell?.v ?? '');

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Headline totals, counting up as the workbook recalculates */}
      <div className="flex shrink-0 items-end gap-6 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        {metrics.slice(0, 4).map((m) => (
          <div key={m.label} className="min-w-0">
            <div className="truncate text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              {m.label}
            </div>
            <div className="text-[15px] font-semibold leading-tight tabular-nums text-slate-900">
              {settled ? m.value : <CountingCell text={m.value} duration={1600} />}
            </div>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <Loader2 className={`h-3 w-3 text-emerald-600 ${done ? 'opacity-0' : 'animate-spin'}`} />
          <span className="text-[10.5px] font-medium text-slate-500">
            8_Internal_Value_Statement.xlsx
          </span>
        </div>
      </div>

      {/* Formula bar — shows the real formula of the cell being resolved */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 py-1">
        <div className="w-[74px] shrink-0 rounded-sm border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-center text-[10.5px] font-medium tabular-nums text-slate-700">
          {cellRef}
        </div>
        <span className="shrink-0 font-serif text-[11px] italic text-slate-400">fx</span>
        <div className="min-w-0 flex-1 truncate rounded-sm border border-slate-200 bg-slate-50/70 px-2 py-0.5 font-mono text-[10.5px] text-slate-600">
          {formula}
        </div>
      </div>

      {/* Sheet */}
      <div ref={gridRef} className="min-h-0 flex-1 overflow-hidden bg-white">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: 30 }} />
            <col style={{ width: '22%' }} />
            {tab.rows[0].slice(1).map((_, i) => (
              <col key={i} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ height: 20 }}>
              <th className="border-b border-r border-slate-300 bg-slate-200" />
              {tab.rows[0].map((_, i) => (
                <th
                  key={i}
                  className={`border-b border-r border-slate-300 px-1.5 text-center text-[10px] font-semibold ${
                    i === activeCol ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {colRef(tab.startCol - 1 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tab.rows.map((r, ri) => (
              <SheetRow
                key={ri}
                cells={r}
                rowNo={tab.startRow + ri}
                fill={Math.max(0, Math.min(cols, localCursor - ri * cols))}
                flashFrom={settled ? cols : Math.max(0, localCursor - FLASH_CELLS - ri * cols)}
                activeCol={ri === activeRow ? activeCol : -1}
                header={ri < tab.headerRows}
                still={settled}
                rowH={rowH}
                fontPx={fontPx}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Real sheet tabs + status bar */}
      <div className="flex shrink-0 items-center gap-1 border-t border-slate-200 bg-slate-100 px-2 py-1">
        {valueStatementTabs.map((t, i) => (
          <button
            key={t.name}
            disabled={!settled}
            onClick={() => setPinnedTab(i)}
            className={`rounded-t-sm px-2 py-0.5 text-[10px] ${
              i === tabIndex
                ? 'border-x border-t border-slate-300 bg-white font-semibold text-slate-800'
                : settled
                  ? 'text-slate-500 hover:bg-white hover:text-slate-800'
                  : i < tabIndex
                    ? 'font-medium text-emerald-700'
                    : 'text-slate-400'
            }`}
          >
            {t.name}
            {!settled && i < tabIndex && ' ✓'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-4 text-[10px] tabular-nums text-slate-500">
          <span>{done ? 'Ready' : tab.input ? 'Pasting reviewed vendor rows…' : 'Calculating…'}</span>
          <span>
            {settled
              ? `${tabCells.toLocaleString()} cells on this tab`
              : `${Math.min(cursor, total).toLocaleString()} / ${total.toLocaleString()} cells`}
          </span>
          <span className="w-24 overflow-hidden rounded-full bg-slate-300">
            <span
              className="block h-1 rounded-full bg-emerald-500"
              style={{ width: `${Math.round((Math.min(cursor, total) / total) * 100)}%` }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Editable figures laid over the rendered slide. Untouched cells stay fully
 * transparent so the deck reads exactly as PowerPoint exported it; only a cell
 * the analyst actually changes is repainted, using the fill colour sampled from
 * the slide itself.
 */
function SlideFieldOverlay({
  fields,
  edits,
  onEdit,
}: {
  fields: DeckField[];
  edits: Record<string, string>;
  onEdit: (key: string, value: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [editing, setEditing] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="absolute inset-0">
      {fields.map((f) => {
        const edited = edits[f.key] !== undefined && edits[f.key] !== f.text;
        const value = edits[f.key] ?? f.text;
        const isEditing = editing === f.key;
        const fontSize = Math.max(8, size.h * f.fontFrac);
        const style: React.CSSProperties = {
          left: `${f.x * 100}%`,
          top: `${f.y * 100}%`,
          width: `${f.w * 100}%`,
          height: `${f.h * 100}%`,
          fontSize: `${fontSize}px`,
          fontWeight: f.bold ? 600 : 400,
          background: edited || isEditing ? f.bg : 'transparent',
          color: f.fg,
        };

        if (isEditing) {
          return (
            <input
              key={f.key}
              autoFocus
              defaultValue={value}
              style={style}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={(e) => {
                onEdit(f.key, e.currentTarget.value);
                setEditing(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onEdit(f.key, e.currentTarget.value);
                  setEditing(null);
                }
                if (e.key === 'Escape') setEditing(null);
              }}
              className="absolute z-20 border border-emerald-500 text-center outline-none"
            />
          );
        }

        return (
          <button
            key={f.key}
            type="button"
            title={`Click to edit — original ${f.text}`}
            onClick={() => setEditing(f.key)}
            style={style}
            className={`absolute z-10 flex items-center justify-center text-center transition-colors ${
              edited ? '' : 'hover:bg-emerald-400/20 hover:ring-1 hover:ring-emerald-500/60'
            }`}
          >
            {edited ? value : ''}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Step 7 rendered as the deck being produced from the real template. The canvas
 * shows the actual slide the engine produces — these PNGs are exported from the
 * same .pptx the Download button hands over — painting in behind a scan line as
 * each one lands in the filmstrip. Once settled it stays on the deck, the
 * filmstrip becomes clickable and every figure becomes editable.
 */
function DeckBuild({
  slides,
  settled = false,
  deckMap,
  pdfHref,
  edits = {},
  onEdit,
}: {
  slides: DeckRenderSlide[];
  settled?: boolean;
  deckMap?: string | null;
  pdfHref?: string | null;
  edits?: Record<string, string>;
  onEdit?: (key: string, value: string) => void;
}) {
  const [i, setI] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settled) return;
    setI(0);
    const iv = setInterval(() => {
      setI((n) => {
        if (n >= slides.length - 1) {
          clearInterval(iv);
          return n;
        }
        return n + 1;
      });
    }, DECK_SLIDE_MS);
    return () => clearInterval(iv);
  }, [slides, settled]);

  useEffect(() => {
    if (settled) return;
    stripRef.current?.scrollTo({ top: stripRef.current.scrollHeight, behavior: 'smooth' });
  }, [i, settled]);

  const slide = slides[i];
  const done = settled || i >= slides.length - 1;
  const visible = settled ? slides : slides.slice(0, i + 1);
  const editCount = Object.keys(edits).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex min-h-0 flex-1">
        {/* Filmstrip */}
        <div ref={stripRef} className="w-[140px] shrink-0 space-y-1.5 overflow-y-auto border-r border-slate-200 bg-slate-50 p-2">
          {visible.map((s, idx) => (
            <button
              key={s.n}
              disabled={!settled}
              onClick={() => setI(idx)}
              className={`flex w-full items-start gap-1.5 text-left ${settled ? '' : 'animate-fade-in-up'}`}
              title={s.title}
            >
              <span className="mt-1 w-3 shrink-0 text-right text-[9px] tabular-nums text-slate-400">
                {s.n}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.title}
                className={`aspect-[16/9] min-w-0 flex-1 rounded-sm bg-white object-contain ring-1 ${
                  idx === i ? 'ring-2 ring-emerald-500' : 'ring-slate-200'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Slide canvas — the real exported slide, not a re-drawing of it */}
        <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-slate-200 p-4">
          <div
            key={slide.n}
            className="relative aspect-[16/9] h-full max-w-full overflow-hidden rounded bg-white shadow-lg ring-1 ring-slate-300"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.title}
              className={`h-full w-full object-contain ${settled ? '' : 'animate-slide-render'}`}
            />
            {!settled && (
              <span className="animate-slide-scan pointer-events-none absolute inset-x-0 h-[2px] bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]" />
            )}
            {settled && onEdit && (
              <SlideFieldOverlay
                fields={deckFieldsFor(deckMap ?? undefined, slide.n)}
                edits={edits}
                onEdit={onEdit}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-slate-100 px-3 py-1">
        <Loader2 className={`h-3 w-3 text-emerald-600 ${done ? 'opacity-0' : 'animate-spin'}`} />
        <span className="truncate text-[10.5px] font-medium text-slate-600">
          {settled
            ? editCount
              ? `${editCount} figure${editCount > 1 ? 's' : ''} edited — included in the download`
              : 'Click any figure on the slide to edit it'
            : done
              ? 'Deck complete'
              : `Rendering slide ${slide.n} — ${slide.title}`}
        </span>
        {settled && pdfHref && !editCount && (
          <a
            href={pdfHref}
            target="_blank"
            rel="noreferrer"
            title="Unedited reference copy — figures typed over on the slide are not shown here"
            className="shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600 hover:bg-slate-50"
          >
            Open PDF
          </a>
        )}
        <span className="ml-auto shrink-0 text-[10.5px] tabular-nums text-slate-500">
          slide {slide.n} of {slides.length}
        </span>
        <span className="w-24 shrink-0 overflow-hidden rounded-full bg-slate-300">
          <span
            className="block h-1 rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${Math.round(((i + 1) / slides.length) * 100)}%` }}
          />
        </span>
      </div>
    </div>
  );
}

/**
 * Segment values the override rules move a vendor INTO, and the row color that
 * flags it — mirrors the analyst's own conditional formatting (Financial
 * Institutions in pink, Basic Match / Basic Target in blue) so a reclassified
 * row reads the same way here as it does in the reviewed workbook.
 */
interface SegmentFlagStyle {
  row: string;
  dot: string;
  legend: string;
}

const SEGMENT_FLAG_STYLES: Record<string, SegmentFlagStyle> = {
  'Financial Institutions': {
    row: 'bg-rose-50/80 hover:bg-rose-50',
    dot: 'bg-rose-500',
    legend: 'Financial Institutions — excluded from the card program',
  },
  'Basic Match': {
    row: 'bg-sky-50/80 hover:bg-sky-50',
    dot: 'bg-sky-500',
    legend: 'Basic Match / Basic Target — moved off the card program by rule',
  },
  'Basic Target': {
    row: 'bg-sky-50/80 hover:bg-sky-50',
    dot: 'bg-sky-500',
    legend: 'Basic Match / Basic Target — moved off the card program by rule',
  },
};
const DEFAULT_SEGMENT_FLAG_STYLE: SegmentFlagStyle = {
  row: 'bg-amber-50/80 hover:bg-amber-50',
  dot: 'bg-amber-500',
  legend: 'Segment corrected by rule',
};

function Grid({ table, highlight }: { table: TableData; highlight: boolean }) {
  const changed = new Set(highlight ? table.changedColumns ?? [] : []);
  const fillByColumn = new Map((table.columnStats ?? []).map((s) => [s.column, s.fillPct]));
  const [allAccepted, setAllAccepted] = useState(false);

  // The reviewed pricing file carries both the Alteryx segment and the segment
  // the override rules landed on — diffing them here means a row is flagged
  // the instant the rule actually changed something, with no dependency on a
  // separate "overrides" payload being wired up for this particular run.
  const segmentAfterIdx = table.headers.indexOf('Segment');
  const segmentBeforeIdx = table.headers.findIndex(
    (h) => h === 'Segment (File 6)' || h === 'Segment (Original)',
  );
  const showSegmentFlags = highlight && segmentAfterIdx >= 0 && segmentBeforeIdx >= 0;

  const flagFor = (row: string[]) => {
    if (!showSegmentFlags) return null;
    const before = row[segmentBeforeIdx];
    const after = row[segmentAfterIdx];
    if (!after || after === before) return null;
    return SEGMENT_FLAG_STYLES[after] ?? DEFAULT_SEGMENT_FLAG_STYLE;
  };
  const flaggedCount = showSegmentFlags ? table.rows.filter((r) => flagFor(r)).length : 0;

  return (
    <div className="flex h-full flex-col">
      {showSegmentFlags && flaggedCount > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-3 py-1.5 text-[10.5px] text-slate-500">
          <span className="font-medium text-slate-600">
            {flaggedCount} of {table.rows.length} rows corrected by the override rules:
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-rose-400" />
            Financial Institutions — excluded
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-sky-400" />
            Basic Match / Target — network or policy exception
          </span>
          <button
            type="button"
            onClick={() => setAllAccepted(true)}
            disabled={allAccepted}
            className="ml-auto flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-3 w-3" />
            {allAccepted ? 'All corrections accepted' : 'Accept all'}
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11.5px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {table.headers.map((h) => (
                <th
                  key={h}
                  className={`whitespace-nowrap border-b px-3 py-1.5 text-left font-semibold ${
                    changed.has(h)
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div>{h}</div>
                  {fillByColumn.has(h) && (
                    <div
                      className="mt-1 flex items-center gap-1 font-normal"
                      title={`${fillByColumn.get(h)}% of rows have a value in this column`}
                    >
                      <div className="h-1 w-10 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            fillByColumn.get(h)! >= 95
                              ? 'bg-emerald-500'
                              : fillByColumn.get(h)! >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          }`}
                          style={{ width: `${fillByColumn.get(h)}%` }}
                        />
                      </div>
                      <span className="text-[9.5px] tabular-nums text-slate-400">
                        {fillByColumn.get(h)}%
                      </span>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, ri) => {
              const flag = flagFor(r);
              return (
                <tr key={ri} className={flag ? flag.row : 'hover:bg-slate-50/70'}>
                  {r.map((c, ci) => {
                    const isSegmentAfter = showSegmentFlags && ci === segmentAfterIdx;
                    return (
                      <td
                        key={ci}
                        title={isSegmentAfter && flag ? `Was "${r[segmentBeforeIdx]}" — ${flag.legend}.` : undefined}
                        className={`whitespace-nowrap border-b border-slate-100 px-3 py-1.5 ${
                          changed.has(table.headers[ci])
                            ? 'bg-emerald-50 font-medium text-emerald-900'
                            : 'text-slate-700'
                        } ${ci > 0 && /^[\d,.]+$/.test(c) ? 'text-right tabular-nums' : ''}`}
                      >
                        {isSegmentAfter && flag ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${flag.dot}`} />
                            {c}
                            {allAccepted && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />}
                          </span>
                        ) : (
                          c
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PreviewStage({
  stage,
  status,
  progress,
  run,
  output,
  table,
  beforeTable,
  beforeLabel,
  tabs,
  dealId,
  deckMap,
  deckEdits,
  onDeckEdit,
  onSelectTab,
  onDownload,
}: Props) {
  const [view, setView] = useState<'after' | 'before'>('after');
  const [showChecks, setShowChecks] = useState(false);

  const deckSlides = deckSlidesFor(deckMap ?? undefined);
  const deckPdf = deckMap ? `/deck/${deckMap}/deck.pdf` : null;

  const running = status === 'running';
  const shown = view === 'before' ? beforeTable : table;
  const pct = Math.round(progress * 100);
  const activeSub = Math.min(stage.subSteps.length - 1, Math.floor(progress * stage.subSteps.length));

  const counts = (run?.checks ?? []).reduce(
    (a, c) => ({ ...a, [c.status]: (a[c.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-2 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {tabs.length === 0 ? (
            <span className="px-1 text-[11.5px] text-slate-400">
              {stage.id === 'sendback' && (status === 'done' || status === 'needs-review')
                ? 'Reply to the bank request · 2 drafts'
                : 'No output yet'}
            </span>
          ) : (
            tabs.map((t) => (
              <button
                key={t.output.filename}
                onClick={() => {
                  setView('after');
                  onSelectTab(t);
                }}
                className={`shrink-0 rounded px-2 py-1 text-[11.5px] font-medium transition-colors ${
                  output?.filename === t.output.filename
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {t.output.filename}
              </button>
            ))
          )}
        </div>

        {beforeTable && output?.kind !== 'pptx' && (
          <div className="flex shrink-0 items-center rounded-md border border-slate-200 p-0.5">
            <button
              onClick={() => setView('before')}
              className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                view === 'before' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {beforeLabel}
            </button>
            <button
              onClick={() => setView('after')}
              className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                view === 'after' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              After
            </button>
          </div>
        )}

        {output && (
          <button
            onClick={() => onDownload(output)}
            title="Download"
            className="shrink-0 rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {status === 'skipped' ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-8 text-center text-slate-400">
            <MinusCircle className="h-6 w-6" />
            <div className="text-[12.5px] font-medium text-slate-500">Not applicable to this deal</div>
            <div className="max-w-xs text-[11.5px] leading-snug">
              This analysis was delivered as value models, so no ROI deck was ever built. The run
              goes straight from the value statement to the send-back.
            </div>
          </div>
        ) : running ? (
          stage.id === 'value-statement' && run?.previews['8_Internal_Value_Statement.xlsx'] ? (
            <ValueStatementBuild metrics={run.metrics} />
          ) : stage.id === 'external-roi' ? (
            <DeckBuild slides={deckSlides} deckMap={deckMap} />
          ) : stage.id === 'classification' && run?.overrides && run.overrides.length > 0 ? (
            <ClassificationReveal overrides={run.overrides} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-10">
              <div className="text-[12px] font-medium text-slate-700">
                {stage.subSteps[activeSub]?.label}
              </div>
              <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-[width] duration-300 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-[11px] tabular-nums text-slate-400">
                {pct}% · step {activeSub + 1} of {stage.subSteps.length}
              </div>
            </div>
          )
        ) : stage.id === 'sendback' && status !== 'done' && status !== 'needs-review' ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-8 text-center text-slate-400">
            <FileQuestion className="h-6 w-6" />
            <div className="max-w-xs text-[12px] leading-snug">{stage.summary}</div>
          </div>
        ) : stage.id === 'sendback' ? (
          <SendBackCompose dealId={dealId} />
        ) : !output ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-8 text-center text-slate-400">
            <FileQuestion className="h-6 w-6" />
            <div className="max-w-xs text-[12px] leading-snug">{stage.summary}</div>
          </div>
        ) : output.kind === 'pptx' ? (
          <DeckBuild
            slides={deckSlides}
            settled
            deckMap={deckMap}
            pdfHref={deckPdf}
            edits={deckEdits}
            onEdit={onDeckEdit}
          />
        ) : output.filename === '8_Internal_Value_Statement.xlsx' && view === 'after' && run ? (
          <ValueStatementBuild metrics={run.metrics} settled />
        ) : shown ? (
          <Grid table={shown} highlight={view === 'after'} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <FileQuestion className="h-6 w-6 text-slate-300" />
            <div className="text-[12px] text-slate-400">
              No table preview for this file — download it to open in Excel.
            </div>
            <button
              onClick={() => onDownload(output)}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              {output.filename}
            </button>
          </div>
        )}
      </div>

      {/* Footer — compact facts */}
      {!running && output && (
        <div className="shrink-0 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1.5 text-[11px]">
            {shown?.totalRows && (
              <span className="text-slate-400">
                {shown.rows.length} of{' '}
                <span className="tabular-nums">{shown.totalRows.toLocaleString()}</span> rows
              </span>
            )}
            {view === 'after' && !!shown?.changedColumns?.length && (
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-sm bg-emerald-100 ring-1 ring-emerald-400" />
                added / rewritten by this step
              </span>
            )}
            {shown?.diffNote && <span className="text-slate-500">{shown.diffNote}</span>}
          </div>

          <div className="flex items-center gap-x-4 gap-y-1 border-t border-slate-50 px-3 py-1.5">
            {run?.metrics.slice(0, 4).map((m) => (
              <span key={m.label} className="whitespace-nowrap text-[11px] text-slate-400">
                {m.label}{' '}
                <span className="font-semibold tabular-nums text-slate-800">{m.value}</span>
              </span>
            ))}

            <div className="flex-1" />

            {!!run?.checks.length && (
              <button
                onClick={() => setShowChecks((v) => !v)}
                className="flex shrink-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-slate-100"
              >
                <span className="flex items-center gap-0.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {counts.pass ?? 0}
                </span>
                {!!counts.warn && (
                  <span className="flex items-center gap-0.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    {counts.warn}
                  </span>
                )}
                {!!counts.fail && (
                  <span className="flex items-center gap-0.5">
                    <XCircle className="h-3 w-3 text-rose-500" />
                    {counts.fail}
                  </span>
                )}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showChecks ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>

          {showChecks && (
            <div className="max-h-40 overflow-y-auto border-t border-slate-100 bg-slate-50/60 px-3 py-1.5">
              {run?.checks.map((c) => (
                <div key={c.id} className="flex items-start gap-1.5 py-0.5">
                  {checkIcon[c.status]}
                  <span className="text-[11px] leading-snug text-slate-600">
                    <span className="font-medium text-slate-800">{c.label}</span> — {c.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
