// ============================================================
//  Parse a raw vendor payment file (.xlsx/.xls/.csv) into a
//  plain headers + rows shape, using SheetJS (no framework
//  dependency — this file can be unit tested on its own).
//
//  Real bank exports often ship with a pivot-summary sheet placed
//  BEFORE the actual raw data sheet (or a stray "sendTo..." sheet
//  from an email attachment save). We pick the sheet whose header
//  row matches the most known vendor-file field names, not just
//  the first sheet in the workbook.
// ============================================================
import * as XLSX from 'xlsx';
import { KNOWN_FIELD_NAMES } from './rules';

export interface ParsedSheet {
  headers: string[];
  /** Each row as a map from header -> raw cell value (string, already trimmed). */
  rows: Record<string, string>[];
}

/** How many rows down to look for the real header row. */
const HEADER_SCAN_ROWS = 8;

/** Header cells arrive with stray padding and inconsistent case; compare them squashed. */
const squash = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

function sheetRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' });
}

/**
 * Pick both the sheet AND the header row. Banks bury the real table behind
 * summary tabs (BofA ships 'Visa_MC rough comparison' first) and sometimes put
 * a description line above the headers (BofA's 'AP Analysis' headers are on
 * row 2), so we score every candidate row and take the best match.
 */
function pickBestSheet(workbook: XLSX.WorkBook): { rows: unknown[][]; headerRow: number } {
  const known = new Set(KNOWN_FIELD_NAMES.map(squash));
  let best: { rows: unknown[][]; headerRow: number } = { rows: [], headerRow: 0 };
  let bestScore = -1;

  for (const name of workbook.SheetNames) {
    const rows = sheetRows(workbook.Sheets[name]);
    const limit = Math.min(HEADER_SCAN_ROWS, rows.length);
    for (let r = 0; r < limit; r++) {
      const score = (rows[r] ?? []).filter((h) => known.has(squash(h))).length;
      if (score > bestScore) {
        bestScore = score;
        best = { rows, headerRow: r };
      }
    }
  }
  return best;
}

export function parseVendorFile(buffer: ArrayBuffer): ParsedSheet {
  // cellDates: true so Excel's numeric date serials come through as real JS Date
  // objects (readable strings) instead of raw numbers like 45280.
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const { rows: raw, headerRow } = pickBestSheet(workbook);
  if (raw.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = (raw[headerRow] as unknown[]).map((h) => String(h ?? '').trim());
  const rows = raw.slice(headerRow + 1).map((line) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      const cell = (line as unknown[])[i];
      row[h] = cell === undefined || cell === null ? '' : String(cell).trim();
    });
    return row;
  });

  return { headers, rows };
}
