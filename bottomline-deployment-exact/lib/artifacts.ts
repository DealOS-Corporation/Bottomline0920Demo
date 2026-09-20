// ============================================================
//  Shared artifact builders.
//  Both the download routes and the send-back email need the same
//  generated files, and a workbook build takes ~11s of Excel COM,
//  so every artifact is built once per source revision and cached
//  on disk under the OS temp dir.
// ============================================================
import { copyFile, mkdir, mkdtemp, readFile, stat, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import path from 'path';
import { runPowerShellEngine, runPythonEngine } from '@/lib/engine';
import { getSourceFiles, type DealSourceFiles } from '@/lib/sourceFiles';
import { DEAL_IDS } from '@/lib/deals';

const CACHE_ROOT = path.join(tmpdir(), 'dealos-artifacts');

/** Every deal-specific path the builders need, or a clear error naming the deal. */
function sourcesFor(dealId: string): DealSourceFiles {
  const src = getSourceFiles(dealId);
  if (!src) throw new Error(`No source files registered for deal "${dealId}".`);
  return src;
}

export function workbookSources(dealId: string): string[] {
  const s = sourcesFor(dealId);
  return [s.valueStatementTemplate, s.roiWorkbook, s.reviewedPricing, s.dealConfig];
}

function deckSources(dealId: string): string[] {
  const s = sourcesFor(dealId);
  if (!s.deckTemplate) throw new Error(`Deal "${dealId}" has no ROI deck template.`);
  if (!s.deckSlideMap) {
    throw new Error(
      `No verified slide map for deal "${dealId}" yet, so the deck cannot be generated ` +
        'without risking wrong figures on a client-facing file.',
    );
  }
  return [s.deckTemplate, s.roiWorkbook];
}

export interface WorkbookResult {
  status: string;
  file8: string;
  file9: string;
  vendorRows: number;
  overrides: number;
  cellsPasted: number;
}

export interface DeckResult {
  status: string;
  outputPath: string;
  slideCount: number;
  dataSlides: number[];
  valuesWritten: number;
}

export const WORKBOOK_SOURCES = workbookSources(DEAL_IDS.jpm);

/** Rebuild only when a source file actually changes. */
async function sourceKey(sources: string[]): Promise<string> {
  const stats = await Promise.all(sources.map((p) => stat(p)));
  const hash = createHash('sha1');
  sources.forEach((p, i) => hash.update(`${p}:${stats[i].mtimeMs}:${stats[i].size};`));
  return hash.digest('hex').slice(0, 16);
}

export function assertSourcesExist(sources: string[]) {
  const missing = sources.find((p) => !existsSync(p));
  if (missing) throw new Error(`Source file not found: ${missing}`);
}

/** Serialises concurrent callers onto one build instead of racing Excel/PowerPoint. */
function once<T>(slot: { key: string; promise: Promise<T> } | null, key: string, make: () => Promise<T>) {
  if (slot?.key === key) return { slot, promise: slot.promise };
  const promise = make();
  const next = { key, promise };
  return { slot: next, promise };
}

type Slot<T> = { key: string; promise: Promise<T> };

const workbookSlots = new Map<string, Slot<{ dir: string; result: WorkbookResult }>>();

export async function buildWorkbooks(
  dealId: string = DEAL_IDS.jpm,
): Promise<{ dir: string; result: WorkbookResult }> {
  const src = sourcesFor(dealId);
  const sources = workbookSources(dealId);
  assertSourcesExist(sources);
  const key = await sourceKey(sources);

  const { slot, promise } = once(workbookSlots.get(dealId) ?? null, key, async () => {
    const dir = path.join(CACHE_ROOT, `wb-${dealId}-${key}`);
    await mkdir(dir, { recursive: true });
    const metaPath = path.join(dir, 'meta.json');

    if (existsSync(metaPath) && existsSync(path.join(dir, 'file8.xlsx'))) {
      return { dir, result: JSON.parse(await readFile(metaPath, 'utf8')) as WorkbookResult };
    }

    const result = await runPowerShellEngine<WorkbookResult>('steps/build_workbooks.ps1', [
      '-ValueStatementTemplate', src.valueStatementTemplate,
      '-RoiTemplate', src.roiWorkbook,
      '-ReviewedPricing', src.reviewedPricing,
      '-DealConfig', src.dealConfig,
      '-OutDir', dir,
      '-ConvertedTab', src.convertedTab,
      '-RoiInputTab', src.roiInputTab,
    ]);
    await writeFile(metaPath, JSON.stringify(result), 'utf8');
    return { dir, result };
  });

  workbookSlots.set(dealId, slot);
  try {
    return await promise;
  } catch (err) {
    if (workbookSlots.get(dealId)?.key === key) workbookSlots.delete(dealId);
    throw err;
  }
}

const deckSlots = new Map<string, Slot<{ file: string; result: DeckResult }>>();

export async function buildDeck(
  dealId: string = DEAL_IDS.jpm,
): Promise<{ file: string; result: DeckResult }> {
  const src = sourcesFor(dealId);
  const sources = deckSources(dealId);
  assertSourcesExist(sources);
  const key = await sourceKey(sources);

  const { slot, promise } = once(deckSlots.get(dealId) ?? null, key, async () => {
    const dir = path.join(CACHE_ROOT, `deck-${dealId}-${key}`);
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, 'deck.pptx');
    const metaPath = path.join(dir, 'meta.json');

    if (existsSync(metaPath) && existsSync(file)) {
      return { file, result: JSON.parse(await readFile(metaPath, 'utf8')) as DeckResult };
    }

    const result = await runPythonEngine<DeckResult>('steps/step7_deck.py', [
      '--template', src.deckTemplate as string,
      '--source', src.roiWorkbook,
      '--out', file,
      '--map', src.deckSlideMap as string,
    ]);
    await writeFile(metaPath, JSON.stringify(result), 'utf8');
    return { file, result };
  });

  deckSlots.set(dealId, slot);
  try {
    return await promise;
  } catch (err) {
    if (deckSlots.get(dealId)?.key === key) deckSlots.delete(dealId);
    throw err;
  }
}

/**
 * The generated deck with the analyst's typed-over figures applied. Edits go
 * onto a copy so the cached build stays the clean engine output.
 */
export async function buildDeckWithEdits(
  dealId: string,
  edits: Record<string, string>,
): Promise<{ file: string; result: DeckResult; editCount: number }> {
  const { file, result } = await buildDeck(dealId);
  const keys = Object.keys(edits ?? {});
  if (!keys.length) return { file, result, editCount: 0 };

  await mkdir(CACHE_ROOT, { recursive: true });
  const dir = await mkdtemp(path.join(CACHE_ROOT, 'deck-edited-'));
  const out = path.join(dir, 'deck.pptx');
  const editsPath = path.join(dir, 'edits.json');
  await copyFile(file, out);
  await writeFile(editsPath, JSON.stringify(edits), 'utf8');
  await runPythonEngine('steps/apply_deck_edits.py', ['--deck', out, '--edits', editsPath]);
  return { file: out, result, editCount: keys.length };
}
