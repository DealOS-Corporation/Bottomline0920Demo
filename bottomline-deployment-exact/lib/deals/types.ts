// ============================================================
//  Shared deal types.
//  These describe the shape of a run, independent of which
//  deal is being rendered.
// ============================================================

export interface CheckResult {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  /** A concrete next step for a human — shown in the "Needs attention" list. Omit when nothing to do. */
  action?: string;
  /** When the action is "draft an email", the real to/subject/body to open in the user's mail client. */
  emailDraft?: { to: string; subject: string; body: string };
}

export interface Metric {
  label: string;
  value: string;
  sub?: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  /** Total rows in the real file, when the preview is truncated. */
  totalRows?: number;
  /** Columns this step added or rewrote — highlighted green in the preview. */
  changedColumns?: string[];
  /** One-line description of how this file differs from its input. */
  diffNote?: string;
  /** Per-column fill rate over the full real file — Excel/Power-Query-style column quality. */
  columnStats?: { column: string; fillPct: number }[];
}

export interface SegmentOverride {
  vendor: string;
  segmentBefore: string;
  segmentAfter: string;
  reason: string;
}

export interface StageRun {
  metrics: Metric[];
  checks: CheckResult[];
  /** Row-level transformation notes shown in the stage detail. */
  transforms?: { label: string; detail: string }[];
  /** Preview payload keyed by artifact filename. */
  previews: Record<string, TableData>;
  /** Real per-vendor Segment overrides from the classification engine — drives the live reveal animation. */
  overrides?: SegmentOverride[];
}

/** Identity of a deal, shown in the workspace header. */
export interface DealMeta {
  id: string;
  client: string;
  channel: string;
  analyst: string;
  received: string;
}

/** One slide extracted from the real ROI deck. */
export interface DeckSlide {
  title: string;
  subtitle: string;
  lines: string[];
}

/**
 * A commercial variant of the same deal. Some banks ask for the analysis to be
 * priced more than one way; the underlying vendor file is identical and only
 * certain stages report different numbers.
 */
export interface DealScenario {
  id: string;
  label: string;
  description: string;
  /** Stage id -> metrics that replace that stage's default metrics under this scenario. */
  metrics: Record<string, Metric[]>;
}

/**
 * Everything the workspace needs to render one deal.
 * `deckSlides` is absent for deals that never produced a deck.
 * `scenarios` is absent for deals priced only one way.
 */
export interface DealDefinition {
  meta: DealMeta;
  stageRuns: Record<string, StageRun>;
  /**
   * Key of the rendered deck in lib/deckRender.ts. `null` for deals that were
   * delivered as workbooks only, which makes the deck step not applicable.
   */
  deckMap: string | null;
  deckSlides?: DeckSlide[];
  scenarios?: DealScenario[];
}
