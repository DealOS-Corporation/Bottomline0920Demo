'use client';

import { useRef } from 'react';
import {
  Upload,
  Play,
  Check,
  Loader2,
  Lock,
  FileSpreadsheet,
  Mail,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Stage, StageStatus, RunMode, ENGINE_LABEL } from '@/lib/pipeline';
import { StageRun } from '@/lib/runData';

function actionIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('email') || lower.includes('outlook')) {
    return <Mail className="h-3.5 w-3.5 shrink-0 text-sky-600" />;
  }
  if (lower.includes('confirm') || lower.includes('ask')) {
    return <HelpCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
  }
  return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />;
}

function mailtoHref(draft: { to: string; subject: string; body: string }) {
  return `mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
}

interface Props {
  stage: Stage;
  status: StageStatus;
  mode: RunMode;
  progress: number;
  uploadedFile: string | null;
  /** Where the file in the slot came from, when it arrived with the deal rather than by hand. */
  attachedFrom?: string | null;
  run: StageRun | undefined;
  onUpload: (filename: string) => void;
  onFileUpload?: (file: File) => void;
  checkingFile?: boolean;
  onRun: () => void;
  onApprove: () => void;
}

export default function ControlRail({
  stage,
  status,
  mode,
  progress,
  uploadedFile,
  attachedFrom,
  run,
  onUpload,
  onFileUpload,
  checkingFile,
  onRun,
  onApprove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirst = stage.order === 1;
  const needsUpload = isFirst || stage.id === 'classification';
  const uploadLabel = stage.id === 'classification' ? 'Upload Alteryx pricing output' : 'Upload vendor payment file';
  const running = status === 'running';
  const done = status === 'done' || status === 'needs-review';
  const activeSub = running ? Math.min(stage.subSteps.length - 1, Math.floor(progress * stage.subSteps.length)) : -1;

  const actions = (run?.checks ?? []).filter((c): c is typeof c & { action: string } => Boolean(c.action));

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
      {/* Step header */}
      <div className="shrink-0 border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Step {stage.order}
          </span>
          {stage.engine !== 'dealos' && (
            <span className="rounded bg-slate-100 px-1 text-[9px] font-medium uppercase tracking-wide text-slate-500">
              {ENGINE_LABEL[stage.engine]}
            </span>
          )}
        </div>
        <div className="text-[13px] font-semibold leading-tight text-slate-900">{stage.label}</div>
        <div className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-400">
          <span className="truncate">{stage.inputRef}</span>
          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
          <span className="shrink-0 font-medium text-slate-500">
            {stage.outputs.map((o) => o.ref).filter((r) => r !== '—').join(' · ') || 'status only'}
          </span>
        </div>
      </div>

      {/* Run controls */}
      <div className="shrink-0 space-y-2.5 px-3 py-2.5">
        {needsUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  onUpload(f.name);
                  onFileUpload?.(f);
                }
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-md border border-dashed border-slate-300 px-2.5 py-2 text-left transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              {uploadedFile ? (
                <>
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-medium text-slate-800">
                      {uploadedFile}
                    </span>
                    {attachedFrom && (
                      <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                        {attachedFrom.startsWith('Attached to the request') && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/logos/outlook.png" alt="" className="h-3 w-3 shrink-0 object-contain" />
                        )}
                        <span className="truncate">{attachedFrom}</span>
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium text-slate-400">Replace</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-[11.5px] font-medium text-slate-600">{uploadLabel}</span>
                </>
              )}
            </button>
            {checkingFile && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Reading the real file on the backend…
              </div>
            )}
          </>
        )}

        <ul className="space-y-0.5">
          {stage.subSteps.map((s, i) => {
            const state = done ? 'done' : running && i < activeSub ? 'done' : running && i === activeSub ? 'active' : 'idle';
            return (
              <li key={s.id} className="flex items-start gap-1.5 py-0.5">
                {state === 'done' ? (
                  <Check className="mt-[3px] h-2.5 w-2.5 shrink-0 text-emerald-500" />
                ) : state === 'active' ? (
                  <Loader2 className="mt-[3px] h-2.5 w-2.5 shrink-0 animate-spin text-amber-500" />
                ) : (
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                )}
                <span
                  className={`flex-1 text-[11px] leading-snug ${
                    state === 'active' ? 'font-medium text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>

        {status === 'skipped' ? (
          <div className="rounded-md bg-slate-50 px-2 py-2 text-center text-[11.5px] leading-snug text-slate-500">
            Not applicable to this deal — no deck was produced.
          </div>
        ) : status === 'locked' ? (
          <div className="flex items-center justify-center gap-1.5 rounded-md bg-slate-50 py-2 text-[11.5px] text-slate-400">
            <Lock className="h-3 w-3" />
            Waiting on previous step
          </div>
        ) : status === 'needs-review' ? (
          <button
            onClick={onApprove}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 py-2 text-[12px] font-semibold text-white hover:bg-slate-700"
          >
            <Check className="h-3.5 w-3.5" />
            Approve &amp; continue
          </button>
        ) : status === 'done' ? (
          <button
            onClick={onRun}
            className="w-full rounded-md border border-slate-200 py-2 text-[11.5px] font-medium text-slate-500 hover:bg-slate-50"
          >
            Re-run this step
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={running || (needsUpload && !uploadedFile)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 py-2 text-[12px] font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
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

      {/* Needs attention */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-slate-100">
        <div className="shrink-0 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Needs attention
        </div>
        {actions.length === 0 ? (
          <div className="px-3 pb-3 text-[11px] leading-snug text-slate-400">
            No action needed right now.
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-2">
            {actions.map((c) => (
              <div key={c.id} className="flex flex-col gap-1 rounded-md bg-amber-50 px-2 py-1.5">
                <div className="flex items-start gap-1.5">
                  {actionIcon(c.action)}
                  <span className="min-w-0 flex-1 text-[11px] leading-snug text-slate-700">{c.action}</span>
                </div>
                {c.emailDraft && (
                  <a
                    href={mailtoHref(c.emailDraft)}
                    className="ml-5 flex w-fit items-center gap-1 rounded border border-sky-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-sky-700 hover:bg-sky-50"
                  >
                    <Mail className="h-3 w-3" />
                    Open draft in Outlook
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
