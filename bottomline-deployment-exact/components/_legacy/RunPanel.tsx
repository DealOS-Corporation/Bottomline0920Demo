'use client';

import { useRef } from 'react';
import { Upload, Play, Check, Loader2, Lock, FileSpreadsheet } from 'lucide-react';
import { Stage, StageStatus, RunMode, ENGINE_LABEL } from '@/lib/pipeline';

interface Props {
  stage: Stage;
  status: StageStatus;
  mode: RunMode;
  uploadedFile: string | null;
  onUpload: (filename: string) => void;
  onRun: () => void;
  onApprove: () => void;
}

export default function RunPanel({
  stage,
  status,
  mode,
  uploadedFile,
  onUpload,
  onRun,
  onApprove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirst = stage.order === 1;
  const running = status === 'running';

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3 py-2">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
          Step {stage.order}
        </div>
        <div className="text-[13.5px] font-semibold text-slate-900">{stage.label}</div>
      </div>

      <div className="space-y-3 p-3">
        {isFirst ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f.name);
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 px-3 py-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              {uploadedFile ? (
                <>
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  <span className="max-w-full truncate text-[12px] font-medium text-slate-800">
                    {uploadedFile}
                  </span>
                  <span className="text-[11px] text-slate-400">Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span className="text-[12px] font-medium text-slate-700">
                    Drop the vendor payment file
                  </span>
                  <span className="text-[11px] text-slate-400">.xlsx / .csv</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <div className="text-[10.5px] uppercase tracking-wide text-slate-400">Input</div>
            <div className="text-[12.5px] font-medium text-slate-700">{stage.inputRef}</div>
          </div>
        )}

        <div>
          <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
            Runs
          </div>
          <ul className="space-y-1">
            {stage.subSteps.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-[12px] text-slate-600">
                <span
                  className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                    status === 'done' ? 'bg-emerald-500' : running ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                />
                <span className="flex-1 leading-snug">{s.label}</span>
                {s.engine !== 'dealos' && (
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-slate-500">
                    {ENGINE_LABEL[s.engine]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {status === 'locked' ? (
          <div className="flex items-center justify-center gap-1.5 rounded-md bg-slate-50 py-2.5 text-[12px] text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Waiting on the previous step
          </div>
        ) : status === 'needs-review' ? (
          <button
            onClick={onApprove}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <Check className="h-3.5 w-3.5" />
            Approve &amp; continue
          </button>
        ) : status === 'done' ? (
          <button
            onClick={onRun}
            className="w-full rounded-md border border-slate-200 py-2.5 text-[12.5px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            Re-run this step
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={running || (isFirst && !uploadedFile)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {mode === 'autopilot' && isFirst ? 'Run full pipeline' : 'Run step'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
