'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileQuestion } from 'lucide-react';
import { StageOutput } from '@/lib/pipeline';
import { TableData, deckSlides } from '@/lib/runData';

interface Props {
  output: StageOutput | null;
  table: TableData | undefined;
  onDownload: (output: StageOutput) => void;
}

function SlideDeck() {
  const [i, setI] = useState(0);
  const slide = deckSlides[i];
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center bg-slate-100 p-4">
        <div className="aspect-[16/9] w-full max-w-xl overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex h-full flex-col justify-center gap-2 px-8">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Paymode · Slide {i + 1}
            </div>
            <div className="text-[19px] font-semibold leading-tight text-slate-900">
              {slide.title}
            </div>
            <div className="text-[12px] text-slate-500">{slide.subtitle}</div>
            <ul className="mt-1 space-y-1">
              {slide.lines.map((l) => (
                <li key={l} className="flex items-center gap-2 text-[12px] text-slate-700">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-slate-100 py-2">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11.5px] tabular-nums text-slate-500">
          {i + 1} / {deckSlides.length}
        </span>
        <button
          onClick={() => setI((v) => Math.min(deckSlides.length - 1, v + 1))}
          disabled={i === deckSlides.length - 1}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function PreviewWindow({ output, table, onDownload }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
            Preview
          </div>
          <div className="truncate text-[12.5px] font-medium text-slate-800">
            {output?.filename ?? 'No file selected'}
          </div>
        </div>
        {output && (
          <button
            onClick={() => onDownload(output)}
            className="flex shrink-0 items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {!output ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center text-slate-400">
            <FileQuestion className="h-6 w-6" />
            <div className="text-[12px]">Pick a file from Artifacts to preview it here.</div>
          </div>
        ) : output.kind === 'pptx' ? (
          <SlideDeck />
        ) : table ? (
          <div className="h-full overflow-auto">
            <table className="w-full border-collapse text-[11.5px]">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  {table.headers.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-slate-200 px-2.5 py-1.5 text-left font-semibold text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, ri) => (
                  <tr key={ri} className="hover:bg-slate-50">
                    {r.map((c, ci) => (
                      <td
                        key={ci}
                        className={`whitespace-nowrap border-b border-slate-100 px-2.5 py-1.5 text-slate-700 ${
                          ci > 0 && /^[\d,.]+$/.test(c) ? 'text-right tabular-nums' : ''
                        }`}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {table.totalRows && (
              <div className="px-3 py-2 text-[11px] text-slate-400">
                Showing {table.rows.length} of {table.totalRows.toLocaleString()} rows
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-slate-400">
            No preview available for this file type.
          </div>
        )}
      </div>
    </div>
  );
}
