// ============================================================
//  Compatibility shim.
//  The JPM run data moved to lib/deals/jpm.ts and the shared
//  types to lib/deals/types.ts. Existing imports of
//  '@/lib/runData' keep working through here.
// ============================================================

export type {
  CheckResult,
  Metric,
  TableData,
  SegmentOverride,
  StageRun,
  DealMeta,
  DeckSlide,
  DealDefinition,
} from './deals/types';

export { DEAL, stageRuns, deckSlides, jpmDeal } from './deals/jpm';
