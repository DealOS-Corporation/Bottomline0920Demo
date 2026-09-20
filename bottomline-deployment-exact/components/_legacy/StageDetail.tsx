'use client';

import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { Stage, StageStatus } from '@/lib/pipeline';
import { StageRun } from '@/lib/runData';

const checkIcon = {
  pass: <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />,
  warn: <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />,
  fail: <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />,
};

interface Props {
  stage: Stage;
  status: StageStatus;
  run: StageRun | undefined;
}

export default function StageDetail({ stage, status, run }: Props) {
  const revealed = status === 'done' || status === 'needs-review';

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{stage.inputRef}</span>
          <ArrowRight className="h-3 w-3" />
          <span className="font-medium text-slate-600">
            {stage.outputs.map((o) => o.ref).filter((r) => r !== '—').join(' · ') || 'status only'}
          </span>
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{stage.summary}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!revealed ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <div className="text-[13px] font-medium text-slate-400">
              {status === 'running' ? 'Running…' : 'Not run yet'}
            </div>
            <div className="max-w-xs text-[11.5px] text-slate-400">
              Results, checks and output files appear here once this step completes.
            </div>
          </div>
        ) : (
          <>
            {run?.metrics?.length ? (
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                {run.metrics.map((m) => (
                  <div key={m.label} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">{m.label}</div>
                    <div className="text-[15px] font-semibold text-slate-900">{m.value}</div>
                    {m.sub && <div className="text-[10.5px] text-slate-400">{m.sub}</div>}
                  </div>
                ))}
              </div>
            ) : null}

            {run?.transforms?.length ? (
              <div>
                <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                  What changed
                </div>
                <div className="divide-y divide-slate-100 rounded-md border border-slate-100">
                  {run.transforms.map((t) => (
                    <div key={t.label} className="flex gap-3 px-3 py-2">
                      <span className="w-40 shrink-0 text-[12px] font-medium text-slate-700">
                        {t.label}
                      </span>
                      <span className="text-[12px] leading-snug text-slate-500">{t.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {run?.checks?.length ? (
              <div>
                <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Checks
                </div>
                <div className="divide-y divide-slate-100 rounded-md border border-slate-100">
                  {run.checks.map((c) => (
                    <div key={c.id} className="flex items-start gap-2 px-3 py-2">
                      {checkIcon[c.status]}
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-700">{c.label}</div>
                        <div className="text-[11.5px] leading-snug text-slate-500">{c.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
