// ============================================================
//  Read a generated xlsx workbook back into the TableData shape
//  the preview grid expects (headers/rows/columnStats), with
//  "changed" rows (per a marker column) sorted first — mirrors
//  the static lib/jpmPreviews.ts convention so live and mock data
//  render identically in the UI.
// ============================================================
import * as XLSX from 'xlsx';
import fs from 'fs';

export interface LiveTable {
  headers: string[];
  rows: string[][];
  totalRows: number;
  columnStats: { column: string; fillPct: number }[];
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(v).trim();
}

/**
 * Reads an xlsx file and returns headers/rows (all rows, as formatted strings)
 * plus per-column fill rate over the FULL file. `changedMarkerColumn` — if a
 * row has a non-empty value in this column, it's considered "changed" and
 * sorted first in the returned rows (matches how the step5 engine writes
 * changed rows first already, but kept generic for reuse by later steps).
 */
export function readWorkbookAsTable(filePath: string, changedMarkerColumn?: string): LiveTable {
  const buf = fs.readFileSync(filePath);
  const workbook = XLSX.read(buf, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' });
  if (raw.length === 0) return { headers: [], rows: [], totalRows: 0, columnStats: [] };

  const headers = (raw[0] as unknown[]).map((h) => String(h ?? '').trim());
  const markerIdx = changedMarkerColumn ? headers.indexOf(changedMarkerColumn) : -1;
  const dataRows = raw.slice(1) as unknown[][];

  const rows = dataRows.map((r) => headers.map((_, i) => formatCell(r[i])));

  const columnStats = headers.map((column, i) => {
    const filled = dataRows.filter((r) => r[i] !== undefined && r[i] !== null && String(r[i]).trim() !== '').length;
    return { column, fillPct: dataRows.length ? Math.round((filled / dataRows.length) * 1000) / 10 : 0 };
  });

  if (markerIdx >= 0) {
    rows.sort((a, b) => (b[markerIdx] !== '' ? 1 : 0) - (a[markerIdx] !== '' ? 1 : 0));
  }

  return { headers, rows, totalRows: dataRows.length, columnStats };
}
