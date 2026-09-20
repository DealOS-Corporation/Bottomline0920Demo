'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Check, Loader2, ArrowRight, Server, FileInput, FileOutput } from 'lucide-react';
import { EXTERNAL_CONNECTORS, ExternalJobStatus } from '@/lib/externalConnectors';
import { NotifyPermission } from '@/lib/useDesktopNotifications';

interface Props {
  stageId: string;
  job: ExternalJobStatus | null;
  permission: NotifyPermission;
  onEnableNotifications: () => void;
}

const formatElapsed = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function ExternalJobPanel({ stageId, job, permission, onEnableNotifications }: Props) {
  const connector = EXTERNAL_CONNECTORS[stageId];

  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  /**
   * Polls are fast enough that responses can land out of order, which would make
   * the bar step backwards. Only ever let it move forward.
   */
  const highWater = useRef(0);
  const jobId = job?.jobId ?? null;
  const done = job?.done ?? false;

  useEffect(() => {
    if (!jobId) return;
    startedAt.current = Date.now();
    highWater.current = 0;
    setElapsed(0);
  }, [jobId]);

  useEffect(() => {
    if (!jobId || done) return;
    const iv = setInterval(() => {
      if (startedAt.current) setElapsed(Date.now() - startedAt.current);
    }, 250);
    return () => clearInterval(iv);
  }, [jobId, done]);

  if (!connector) return null;

  const phaseIndex = job?.phaseIndex ?? -1;
  highWater.current = done ? 1 : Math.max(highWater.current, job?.progress ?? 0);
  const progress = highWater.current;
  const pct = Math.round(progress * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-200 px-4 py-2.5">
        <Server className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[12.5px] font-semibold text-slate-800">{connector.system}</span>
        <span className="text-slate-300">/</span>
        <span className="text-[12px] text-slate-500">External job</span>

        {job && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-500">
            {job.jobId.slice(0, 8)}
          </span>
        )}

        {permission === 'granted' ? (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            <Bell className="h-3 w-3" />
            Desktop alerts on
          </span>
        ) : permission === 'unsupported' || permission === 'denied' ? (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
            <BellOff className="h-3 w-3" />
            Desktop alerts unavailable
          </span>
        ) : (
          <button
            onClick={onEnableNotifications}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
          >
            <Bell className="h-3 w-3" />
            Notify me when it finishes
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              {done ? <Check className="h-6 w-6" /> : <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
            <div className="min-w-0">
              <div className="text-[18px] font-semibold leading-tight text-slate-900">
                {done ? `${connector.system} returned the file` : `Running in ${connector.system}`}
              </div>
              <div className="mt-1 text-[13px] text-slate-500">
                {done
                  ? 'The job finished outside DealOS. Review the handoff below.'
                  : (job?.phaseLabel ?? 'Waiting to hand off')}
              </div>
            </div>
            <div className="ml-auto shrink-0 text-right">
              <div className="font-mono text-[22px] font-semibold leading-none tabular-nums text-slate-800">
                {pct}%
              </div>
              <div className="mt-1.5 font-mono text-[11.5px] tabular-nums text-slate-400">
                {formatElapsed(elapsed)} elapsed
              </div>
            </div>
          </div>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-linear ${
                done ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                <FileInput className="h-3 w-3" />
                DealOS sent
              </div>
              <div className="mt-1.5 text-[13px] font-medium leading-snug text-slate-800">
                {connector.handoffIn}
              </div>
            </div>
            <div
              className={`rounded-lg border px-4 py-3 ${
                done ? 'border-emerald-200 bg-emerald-50/70' : 'border-dashed border-slate-200 bg-white'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide ${
                  done ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <FileOutput className="h-3 w-3" />
                {connector.system} returns
              </div>
              <div
                className={`mt-1.5 text-[13px] font-medium leading-snug ${
                  done ? 'text-emerald-900' : 'text-slate-400'
                }`}
              >
                {connector.handoffOut}
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
              Job progress
            </div>
            <ol className="relative">
              {connector.phases.map((p, i) => {
                const state = done || i < phaseIndex ? 'done' : i === phaseIndex ? 'active' : 'idle';
                const last = i === connector.phases.length - 1;
                return (
                  <li key={p.label} className="relative flex gap-3 pb-4 last:pb-0">
                    {!last && (
                      <span
                        className={`absolute left-[10px] top-6 h-[calc(100%-16px)] w-px ${
                          state === 'done' ? 'bg-emerald-200' : 'bg-slate-200'
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
                        state === 'done'
                          ? 'border-emerald-500 text-emerald-600'
                          : state === 'active'
                            ? 'border-amber-400 text-amber-500'
                            : 'border-slate-200 text-slate-300'
                      }`}
                    >
                      {state === 'done' ? (
                        <Check className="h-3 w-3" />
                      ) : state === 'active' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <div className="min-w-0 pt-px">
                      <div
                        className={`text-[13.5px] leading-snug ${
                          state === 'active'
                            ? 'font-semibold text-slate-900'
                            : state === 'done'
                              ? 'text-slate-600'
                              : 'text-slate-400'
                        }`}
                      >
                        {p.label}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-slate-400">
                        {state === 'done' ? 'Complete' : state === 'active' ? 'In progress…' : 'Queued'}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {done && (
            <div className="animate-fade-in-up mt-7 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-emerald-600">
                Next action
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[14px] font-semibold text-emerald-900">
                <ArrowRight className="h-4 w-4 shrink-0" />
                {connector.nextAction}
              </div>
            </div>
          )}

          <p className="mt-6 text-[11.5px] leading-relaxed text-slate-400">
            This step runs inside {connector.system}, outside DealOS. DealOS submits the job, tracks it,
            and notifies you the moment it returns — nothing on this screen is calculated by DealOS.
          </p>
        </div>
      </div>
    </div>
  );
}
