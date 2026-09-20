'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bot, UserCog, RotateCcw, ArrowLeft, BarChart3 } from 'lucide-react';

import { pipeline, getStage, StageStatus, RunMode, StageOutput, Engine } from '@/lib/pipeline';
import { getDeal } from '@/lib/deals';
import { sourceForDeal } from '@/lib/dealSources';
import type { Metric, CheckResult, TableData, SegmentOverride, StageRun } from '@/lib/deals/types';
import { isExternalStage, ExternalJobStatus } from '@/lib/externalConnectors';
import { useDesktopNotifications } from '@/lib/useDesktopNotifications';

// Persist the real (non-mock) intake check across page reloads, so an uploaded file
// doesn't just vanish on refresh — it feels like the file was actually saved.
// Keyed per deal, or one deal's upload would resurface on another.
const intakeStorageKey = (dealId: string) => `dealos:intake-check:${dealId}`;
interface StoredIntake {
  fileName: string;
  metrics: Metric[];
  checks: CheckResult[];
}

// Same pattern for the real (non-mock) classification check.
const classificationStorageKey = (dealId: string) => `dealos:classification-check:${dealId}`;
const deckEditsStorageKey = (dealId: string) => `dealos:deck-edits:${dealId}`;
interface StoredClassification {
  fileName: string;
  metrics: Metric[];
  checks: CheckResult[];
  overrides: SegmentOverride[];
  table: TableData;
}

/** Step 5's input is whatever step 4 emitted, so it is always this artefact. */
const CLASSIFICATION_ATTACHMENT = '6_Alteryx_PricingOutput.xlsx';

// Outputs that are rebuilt for real by driving the bank's Excel models.
const WORKBOOK_DOWNLOADS: Record<string, { file: '8' | '9'; label: string }> = {
  '8_Internal_Value_Statement.xlsx': { file: '8', label: 'the internal value statement' },
  '9_External_ROI_Analysis.xlsx': { file: '9', label: 'the ROI analysis' },
};

import PipelineRail from '@/components/PipelineRail';
import ControlRail from '@/components/ControlRail';
import EngineStrip, { EngineStatus, EngineState } from '@/components/EngineStrip';
import PreviewStage, {
  EXCEL_CELL_MS,
  DECK_SLIDE_MS,
  valueStatementCellCount,
  deckSlideCountFor,
} from '@/components/PreviewStage';
import ExternalJobPanel from '@/components/ExternalJobPanel';

const initialStatuses = (
  skip: (stageId: string) => boolean = () => false,
): Record<string, StageStatus> =>
  Object.fromEntries(
    pipeline.map(
      (s, i) =>
        [s.id, skip(s.id) ? 'skipped' : i === 0 ? 'ready' : 'locked'] as const,
    ),
  ) as Record<string, StageStatus>;

const STEP_MS = 700;
/** Matches the per-row interval in PreviewStage's ClassificationReveal. */
const OVERRIDE_REVEAL_MS = 220;
/**
 * In autopilot the next step does not start the instant the previous one lands.
 * Without this pause the run snaps from step to step and the analyst never sees
 * what each one actually produced.
 */
const AUTOPILOT_HANDOFF_MS = 1200;

/**
 * The stage's headline data output — prefers a real tabular/deck file with a preview
 * over a status-only json report/receipt, so e.g. Intake defaults to the 50-row
 * vendor file instead of its 12-row check report.
 */
const primaryOutput = (stageId: string, runs: Record<string, StageRun>): StageOutput | undefined => {
  const outputs = getStage(stageId)?.outputs ?? [];
  // The deck is the deliverable for its step even though it has no table preview.
  const deck = outputs.find((o) => o.kind === 'pptx');
  if (deck) return deck;
  const withPreview = outputs.filter((o) => runs[stageId]?.previews[o.filename]);
  return (
    [...withPreview].reverse().find((o) => o.kind !== 'json') ??
    [...withPreview].reverse()[0]
  );
};

export default function DealWorkspacePage() {
  const params = useParams();
  const dealId = Array.isArray(params?.dealId) ? params.dealId[0] : params?.dealId;
  const deal = getDeal(dealId);
  const stageRuns = deal?.stageRuns ?? {};
  const scenarios = deal?.scenarios;
  const deckMap = deal?.deckMap ?? null;
  // Deals delivered as workbooks only never built a deck, so that step is not
  // applicable to them and the run steps straight over it.
  const isSkipped = useCallback(
    (stageId: string) => stageId === 'external-roi' && !deckMap,
    [deckMap],
  );

  const [mode, setMode] = useState<RunMode>('human');
  const modeRef = useRef<RunMode>('human');
  const [statuses, setStatuses] = useState<Record<string, StageStatus>>(() =>
    initialStatuses(isSkipped),
  );
  const [activeId, setActiveId] = useState<string>(pipeline[0].id);
  const [uploadedIntakeFile, setUploadedIntakeFile] = useState<string | null>(null);
  const [uploadedClassificationFile, setUploadedClassificationFile] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ output: StageOutput; stageId: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [liveIntake, setLiveIntake] = useState<{ metrics: Metric[]; checks: CheckResult[] } | null>(null);
  const [liveClassification, setLiveClassification] = useState<{
    metrics: Metric[];
    checks: CheckResult[];
    overrides: SegmentOverride[];
    table: TableData;
  } | null>(null);
  const [checkingFile, setCheckingFile] = useState(false);
  const [externalJobs, setExternalJobs] = useState<Record<string, ExternalJobStatus>>({});
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [deckEdits, setDeckEdits] = useState<Record<string, string>>({});
  // The bank's file came in with the request, so it is already on the deal. Its
  // real result is fetched up front but only shown once the step is actually run.
  const [attachedIntake, setAttachedIntake] = useState<{ metrics: Metric[]; checks: CheckResult[] } | null>(null);
  const [attachedClassification, setAttachedClassification] = useState<{
    metrics: Metric[];
    checks: CheckResult[];
    overrides: SegmentOverride[];
    table: TableData;
  } | null>(null);
  const [manualUpload, setManualUpload] = useState<{ intake: boolean; classification: boolean }>({
    intake: false,
    classification: false,
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const { permission, request: requestNotifications, notify } = useDesktopNotifications();

  const activeStage = getStage(activeId)!;
  const activeStatus = statuses[activeId] ?? 'locked';

  // Typed-over deck figures survive a reload and travel with the download.
  const handleDeckEdit = useCallback(
    (key: string, value: string) => {
      setDeckEdits((prev) => {
        const next = { ...prev };
        if (!value.trim()) delete next[key];
        else next[key] = value;
        if (dealId) window.localStorage.setItem(deckEditsStorageKey(dealId), JSON.stringify(next));
        return next;
      });
    },
    [dealId],
  );

  // Restore a previously-checked file after a page reload so it doesn't just disappear.
  useEffect(() => {
    if (!dealId) return;
    setManualUpload({ intake: false, classification: false });
    setLiveIntake(null);
    setLiveClassification(null);
    setUploadedIntakeFile(null);
    setUploadedClassificationFile(null);
    try {
      const rawIntake = window.localStorage.getItem(intakeStorageKey(dealId));
      if (rawIntake) {
        const stored: StoredIntake = JSON.parse(rawIntake);
        setUploadedIntakeFile(stored.fileName);
        setLiveIntake({ metrics: stored.metrics, checks: stored.checks });
        setManualUpload((p) => ({ ...p, intake: true }));
      }
      const rawClassification = window.localStorage.getItem(classificationStorageKey(dealId));
      if (rawClassification) {
        const stored: StoredClassification = JSON.parse(rawClassification);
        setUploadedClassificationFile(stored.fileName);
        setLiveClassification({ metrics: stored.metrics, checks: stored.checks, overrides: stored.overrides, table: stored.table });
        setManualUpload((p) => ({ ...p, classification: true }));
      }
      const rawDeckEdits = window.localStorage.getItem(deckEditsStorageKey(dealId));
      if (rawDeckEdits) setDeckEdits(JSON.parse(rawDeckEdits));
    } catch {
      // ignore malformed/missing storage
    }
  }, [dealId]);

  const provenance = sourceForDeal(dealId ?? '');

  // Pull the file that arrived with the bank's request, plus the pricing output the
  // previous step produced, so both steps are ready to run without a manual upload.
  useEffect(() => {
    if (!dealId || !provenance) return;
    let cancelled = false;

    // Always show the deal's attached inputs immediately. In cloud deployments,
    // the backend may not have access to local POC files, but the analyst should
    // still be able to run every step without re-uploading by hand.
    setUploadedIntakeFile((cur) => cur ?? provenance.email.attachment);
    setUploadedClassificationFile((cur) => cur ?? CLASSIFICATION_ATTACHMENT);
    setAttachedIntake((cur) =>
      cur ?? {
        metrics: stageRuns.intake?.metrics ?? [],
        checks: stageRuns.intake?.checks ?? [],
      },
    );

    const fallbackClassificationTable =
      stageRuns.classification?.previews?.[CLASSIFICATION_ATTACHMENT] ??
      Object.values(stageRuns.classification?.previews ?? {})[0];
    if (fallbackClassificationTable) {
      setAttachedClassification((cur) =>
        cur ?? {
          metrics: stageRuns.classification?.metrics ?? [],
          checks: stageRuns.classification?.checks ?? [],
          overrides: stageRuns.classification?.overrides ?? [],
          table: fallbackClassificationTable,
        },
      );
    }

    (async () => {
      try {
        const res = await fetch(`/api/intake/attached?deal=${dealId}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        setAttachedIntake({ metrics: json.metrics, checks: json.checks });
        setUploadedIntakeFile((cur) => cur ?? json.fileName);
      } catch {
        // leave the slot empty; the analyst can still upload by hand
      }
    })();

    (async () => {
      try {
        const res = await fetch(`/api/classification/run?deal=${dealId}`, { method: 'POST' });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        setAttachedClassification({
          metrics: json.metrics,
          checks: json.checks,
          overrides: json.overrides,
          table: json.table,
        });
        setUploadedClassificationFile((cur) => cur ?? CLASSIFICATION_ATTACHMENT);
      } catch {
        // same — manual upload still works
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dealId, provenance, stageRuns]);

  const activeScenario = scenarios?.find((s) => s.id === scenarioId) ?? scenarios?.[0];

  // Real backend result for the intake + classification steps (once a file has been  // uploaded and checked); before that, show a clean "nothing to report yet" state
  // instead of the static mock checks, so the UI doesn't look like it already found
  // something before any real file ran. Every other step still falls back to the
  // static reference data.
  const effectiveStageRuns: Record<string, StageRun> = {
    ...stageRuns,
    intake: liveIntake
      ? { ...stageRuns.intake, metrics: liveIntake.metrics, checks: liveIntake.checks }
      : { ...stageRuns.intake, metrics: [], checks: [] },
    classification: liveClassification
      ? {
          ...stageRuns.classification,
          metrics: liveClassification.metrics,
          checks: liveClassification.checks,
          overrides: liveClassification.overrides,
          previews: { '7_Reviewed_PricingOutput_MR.xlsx': liveClassification.table },
        }
      : { ...stageRuns.classification, metrics: [], checks: [], overrides: [] },
  };

  // Deals the bank asked us to price more than one way carry per-scenario metrics
  // for the stages that actually differ. Everything else is shared.
  if (activeScenario) {
    for (const [stageId, metrics] of Object.entries(activeScenario.metrics)) {
      const base = effectiveStageRuns[stageId];
      if (base) effectiveStageRuns[stageId] = { ...base, metrics };
    }
  }

  const changeMode = (m: RunMode) => {
    modeRef.current = m;
    setMode(m);
  };

  const flash = (msg: string) => {
    setNotice(msg);
    timers.current.push(setTimeout(() => setNotice(null), 3200));
  };

  const handleFileUpload = async (file: File) => {
    if (activeId === 'classification') {
      await handleClassificationUpload(file);
      return;
    }
    setCheckingFile(true);
    setLiveIntake(null);
    setManualUpload((p) => ({ ...p, intake: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/intake/validate', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        flash(json.error ?? 'Could not read this file.');
        return;
      }
      setLiveIntake({ metrics: json.metrics, checks: json.checks });
      setAttachedIntake({ metrics: json.metrics, checks: json.checks });
      flash(`Checked ${file.name} on the backend.`);
      const stored: StoredIntake = { fileName: file.name, metrics: json.metrics, checks: json.checks };
      window.localStorage.setItem(intakeStorageKey(dealId), JSON.stringify(stored));
    } catch {
      flash('Could not reach the validation backend.');
    } finally {
      setCheckingFile(false);
    }
  };

  const handleClassificationUpload = async (file: File) => {
    setCheckingFile(true);
    setLiveClassification(null);
    setManualUpload((p) => ({ ...p, classification: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/classification/run', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        flash(json.error ?? 'Could not classify this file.');
        return;
      }
      setLiveClassification({ metrics: json.metrics, checks: json.checks, overrides: json.overrides, table: json.table });
      setAttachedClassification({ metrics: json.metrics, checks: json.checks, overrides: json.overrides, table: json.table });
      flash(`Classified ${file.name} on the backend — ${json.overrides.length} Segment overrides.`);
      const stored: StoredClassification = {
        fileName: file.name,
        metrics: json.metrics,
        checks: json.checks,
        overrides: json.overrides,
        table: json.table,
      };
      window.localStorage.setItem(classificationStorageKey(dealId), JSON.stringify(stored));
    } catch {
      flash('Could not reach the classification backend.');
    } finally {
      setCheckingFile(false);
    }
  };

  const selectStage = (id: string) => {
    setActiveId(id);
    const st = statuses[id];
      const out = st === 'done' || st === 'needs-review' ? primaryOutput(id, stageRuns) : undefined;
    setSelected(out ? { output: out, stageId: id } : null);
  };

  // A step only stops for a manual click when this specific run actually flagged
  // something in "Needs attention" — otherwise it settles straight to done, whether
  // it's a DealOS step or an external one. Same rule everywhere, no per-stage
  // exceptions, so the button you get always matches what's on screen.
  const hasPendingAction = useCallback(
    (stageId: string) => {
      const checks =
        stageId === 'intake'
          ? (liveIntake?.checks ?? [])
          : stageId === 'classification'
            ? (liveClassification?.checks ?? [])
            : (stageRuns[stageId]?.checks ?? []);
      return checks.some((c) => Boolean(c.action));
    },
    [liveIntake, liveClassification],
  );

  const settleStage = useCallback((stageId: string) => {
    const idx = pipeline.findIndex((s) => s.id === stageId);
    const next = pipeline.slice(idx + 1).find((s) => !isSkipped(s.id));
    const auto = modeRef.current === 'autopilot';
    const settled: StageStatus = hasPendingAction(stageId) && !auto ? 'needs-review' : 'done';

    setStatuses((prev) => ({
      ...prev,
      [stageId]: settled,
      ...(next && settled === 'done' && prev[next.id] === 'locked'
        ? { [next.id]: 'ready' as StageStatus }
        : {}),
    }));

      const out = primaryOutput(stageId, stageRuns);
    // External steps keep their tracking panel up so the analyst sees what came back
    // and where it has to go next; the returned file is one tab click away.
    if (out && !isExternalStage(stageId)) setSelected({ output: out, stageId });

    return { auto, next };
  }, [hasPendingAction, isSkipped]);

  /**
   * Steps 2/3/4 run inside Alteryx / ROC. DealOS submits the job to the connector,
   * polls it, and raises a desktop notification the moment it returns so the analyst
   * knows to go move the file into the next system.
   */
  const runExternalStage = useCallback(
    async (stageId: string) => {
      setActiveId(stageId);
      setSelected(null);
      setProgress(0);
      setStatuses((prev) => ({ ...prev, [stageId]: 'running' }));

      // A single dropped request (cold start, transient network blip) used to fail
      // the whole step immediately. Retry a few times before giving up — the job
      // itself is stateless server-side now, so a retry is always safe.
      const submitWithRetry = async (attempts = 3): Promise<ExternalJobStatus> => {
        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            const res = await fetch('/api/external/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stageId }),
            });
            if (!res.ok) throw new Error();
            return await res.json();
          } catch {
            if (attempt === attempts) throw new Error('submit-failed');
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
        throw new Error('submit-failed');
      };

      let job: ExternalJobStatus;
      try {
        job = await submitWithRetry();
      } catch {
        flash('Could not reach the external connector.');
        setStatuses((prev) => ({ ...prev, [stageId]: 'error' }));
        return;
      }

      setExternalJobs((prev) => ({ ...prev, [stageId]: job }));

      // Tolerate a handful of consecutive polling misses before treating the
      // connector as unreachable — the job's state lives in the jobId itself, so a
      // single failed poll is almost always a transient network hiccup, not a real
      // loss of the job.
      const MAX_CONSECUTIVE_POLL_FAILURES = 5;
      let consecutiveFailures = 0;
      const iv = setInterval(async () => {
        try {
          const res = await fetch(`/api/external/submit?jobId=${job.jobId}`, { cache: 'no-store' });
          if (!res.ok) throw new Error();
          const status: ExternalJobStatus = await res.json();
          consecutiveFailures = 0;
          setExternalJobs((prev) => ({ ...prev, [stageId]: status }));
          setProgress((p) => Math.max(p, status.progress));
          if (!status.done) return;

          clearInterval(iv);
          setProgress(1);
          await notify(`${status.system} finished`, `${status.handoffOut} is ready. ${status.nextAction}`);
          flash(`${status.system} returned ${status.handoffOut}.`);
          const { auto, next } = settleStage(stageId);
          if (auto && next) {
            timers.current.push(setTimeout(() => runStage(next.id), AUTOPILOT_HANDOFF_MS));
          }
        } catch {
          consecutiveFailures += 1;
          if (consecutiveFailures < MAX_CONSECUTIVE_POLL_FAILURES) return;
          clearInterval(iv);
          flash('Lost contact with the external connector.');
          setStatuses((prev) => ({ ...prev, [stageId]: 'error' }));
        }
        // Polled fast enough that the bar's CSS transition never finishes between
        // updates — that is what makes it glide rather than tick forward in jumps.
      }, 200);
      intervals.current.push(iv);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notify, settleStage],
  );

  const runStage = useCallback((stageId: string) => {
    const idx = pipeline.findIndex((s) => s.id === stageId);
    const stage = pipeline[idx];
    if (!stage) return;
    if (isSkipped(stageId)) return;

    if (isExternalStage(stageId)) {
      void runExternalStage(stageId);
      return;
    }

    // Running a step is what reveals its result. Until then the attached file's
    // checks stay hidden, so the UI never looks like it found something before
    // any work was done.
    if (stageId === 'intake' && !liveIntake && attachedIntake) {
      setLiveIntake(attachedIntake);
    }
    const classification = liveClassification ?? attachedClassification;
    if (stageId === 'classification' && !liveClassification && attachedClassification) {
      setLiveClassification(attachedClassification);
    }

    // The classification step reveals its real overrides one at a time, and the
    // value statement / ROI deck steps play their own "building live" animations —
    // all three need to stay "running" long enough for that to finish playing out.
    const overrideCount =
      stageId === 'classification' ? (classification?.overrides.length ?? 0) : 0;
    const durationMs = overrideCount
      ? overrideCount * OVERRIDE_REVEAL_MS + 900
      : stageId === 'value-statement'
        ? valueStatementCellCount * EXCEL_CELL_MS + 1200
        : stageId === 'external-roi'
            ? deckSlideCountFor(deckMap) * DECK_SLIDE_MS + 900
          : STEP_MS;

    setActiveId(stageId);
    setSelected(null);
    setProgress(0);
    setStatuses((prev) => ({ ...prev, [stageId]: 'running' }));

    const started = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / durationMs);
      setProgress(p);
      if (p >= 1) clearInterval(iv);
    }, 40);
    intervals.current.push(iv);

    timers.current.push(
      setTimeout(() => {
        setProgress(1);
        const { auto, next } = settleStage(stageId);
        if (auto && next) {
          timers.current.push(setTimeout(() => runStage(next.id), AUTOPILOT_HANDOFF_MS));
        }
      }, durationMs),
    );
  }, [liveClassification, liveIntake, attachedIntake, attachedClassification, runExternalStage, settleStage]);

  const approve = (stageId: string) => {
    const idx = pipeline.findIndex((s) => s.id === stageId);
    const next = pipeline.slice(idx + 1).find((s) => !isSkipped(s.id));
    setStatuses((prev) => ({
      ...prev,
      [stageId]: 'done',
      ...(next && prev[next.id] === 'locked' ? { [next.id]: 'ready' as StageStatus } : {}),
    }));
    if (next) {
      setActiveId(next.id);
      setSelected(null);
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timers.current = [];
    intervals.current = [];
    setStatuses(initialStatuses(isSkipped));
    setActiveId(pipeline[0].id);
    setSelected(null);
    // Reset the run, not the deal — the bank's file is still attached to it.
    setUploadedIntakeFile(provenance ? provenance.email.attachment : null);
    setUploadedClassificationFile(attachedClassification ? CLASSIFICATION_ATTACHMENT : null);
    setManualUpload({ intake: false, classification: false });
    setLiveIntake(null);
    setLiveClassification(null);
    setCheckingFile(false);
    setExternalJobs({});
    setProgress(0);
    window.localStorage.removeItem(intakeStorageKey(dealId));
    window.localStorage.removeItem(classificationStorageKey(dealId));
    setDeckEdits({});
    window.localStorage.removeItem(deckEditsStorageKey(dealId));
  };

  const handleDownload = async (output: StageOutput) => {
    if (output.kind === 'pptx') {
      flash('Rendering the deck from the approved template…');
      try {
        const res = await fetch(`/api/generate/deck?deal=${dealId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ edits: deckEdits }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Deck generation failed.');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = output.filename;
        a.click();
        URL.revokeObjectURL(url);
        const edited = Number(res.headers.get('X-Edits-Applied') ?? 0);
        flash(
          `${output.filename} generated from the real template — ${res.headers.get('X-Values-Written')} values written across ${res.headers.get('X-Slide-Count')} slides` +
            (edited ? `, plus ${edited} edited figure${edited > 1 ? 's' : ''}.` : '.'),
        );
      } catch (err) {
        flash(err instanceof Error ? err.message : 'Deck generation failed.');
      }
      return;
    }

    const workbook = WORKBOOK_DOWNLOADS[output.filename];
    if (workbook) {
      flash(`Recalculating ${workbook.label} in the pricing model…`);
      try {
        const res = await fetch(`/api/generate/workbook?file=${workbook.file}&deal=${dealId}`);
        if (!res.ok) throw new Error((await res.json()).error ?? 'Workbook generation failed.');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = output.filename;
        a.click();
        URL.revokeObjectURL(url);
        flash(`${output.filename} rebuilt from the reviewed pricing output — ${res.headers.get('X-Vendor-Rows')} vendor rows, ${res.headers.get('X-Cells-Pasted')} cells written.`);
      } catch (err) {
        flash(err instanceof Error ? err.message : 'Workbook generation failed.');
      }
      return;
    }

    const table = effectiveStageRuns[selected?.stageId ?? activeId]?.previews[output.filename];
    if (table) {
      const csv = [table.headers, ...table.rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = output.filename.replace(/\.(xlsx|json)$/, '.csv');
      a.click();
      URL.revokeObjectURL(url);
      flash(`Downloaded preview rows of ${output.filename}.`);
    } else {
      flash(`${output.filename} will be produced once the backend is wired up.`);
    }
  };

  const engineState = (engine: Engine): EngineStatus => {
    const owned = pipeline.filter(
      (s) => s.engine === engine || s.subSteps.some((x) => x.engine === engine),
    );
    const running = owned.find((s) => statuses[s.id] === 'running');
    const doneCount = owned.filter((s) => statuses[s.id] === 'done').length;
    let state: EngineState = 'idle';
    if (running) state = 'busy';
    else if (doneCount > 0) state = 'ok';
    return {
      engine,
      state,
      note: running
        ? `Running ${running.short}`
        : doneCount > 0
          ? `${doneCount}/${owned.length} steps returned`
          : 'Not called yet',
    };
  };

  // Preview payloads
  const previewStageId = selected?.stageId ?? activeId;
  const table = selected
    ? effectiveStageRuns[selected.stageId]?.previews[selected.output.filename]
    : undefined;

  const prevStage = pipeline[pipeline.findIndex((s) => s.id === previewStageId) - 1];
  const prevOutput = prevStage ? primaryOutput(prevStage.id, stageRuns) : undefined;
  const beforeTable =
    prevStage && prevOutput ? effectiveStageRuns[prevStage.id]?.previews[prevOutput.filename] : undefined;

  const tabStage = getStage(previewStageId)!;
  const tabs = pipeline
    .filter((s) => s.outputs.length && (statuses[s.id] === 'done' || statuses[s.id] === 'needs-review'))
    .flatMap((s) => s.outputs.map((o) => ({ output: o, stageId: s.id })));

  // Guard sits below the hooks so hook order stays stable for every deal id.
  if (!deal) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <div className="text-[15px] font-semibold text-slate-900">No workspace for this deal yet</div>
        <p className="max-w-md text-[12px] text-slate-500">
          {dealId ? <code className="rounded bg-slate-100 px-1 py-0.5">{dealId}</code> : 'This deal'} has
          source files on record but no run data has been built for it.
        </p>
        <Link
          href="/deals"
          className="mt-1 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all deals
        </Link>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 py-2">
        <Link
          href="/deals"
          title="Back to all deals"
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">All deals</span>
        </Link>

        <Link
          href="/dashboard"
          title="Pricing operations dashboard"
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="hidden h-6 w-px bg-slate-200 md:block" />

        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-slate-900">{deal.meta.client}</div>
          <div className="text-[10.5px] text-slate-400">
            {deal.meta.channel} · received {deal.meta.received}
          </div>
        </div>

        <div className="hidden h-6 w-px bg-slate-200 md:block" />
        <div className="hidden md:block">
          <EngineStrip
            statuses={[engineState('alteryx'), engineState('roc'), engineState('salesforce')]}
          />
        </div>

        {scenarios && activeScenario && (
          <>
            <div className="hidden h-6 w-px bg-slate-200 lg:block" />
            <div
              className="hidden items-center gap-1.5 lg:flex"
              title={activeScenario.description}
            >
              <span className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                Scenario
              </span>
              <div className="flex items-center rounded-md border border-slate-200 p-0.5">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScenarioId(s.id)}
                    title={s.description}
                    className={`rounded px-2 py-1 text-[11px] font-medium ${
                      s.id === activeScenario.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex-1" />

        {notice && (
          <div className="max-w-sm truncate rounded-md bg-slate-900 px-2.5 py-1 text-[11px] text-white">
            {notice}
          </div>
        )}

        <div className="flex items-center rounded-md border border-slate-200 p-0.5">
          <button
            onClick={() => changeMode('human')}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium ${
              mode === 'human' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCog className="h-3.5 w-3.5" />
            Review each step
          </button>
          <button
            onClick={() => changeMode('autopilot')}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium ${
              mode === 'autopilot' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            Autopilot
          </button>
        </div>

        <button
          onClick={reset}
          title="Reset run"
          className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <PipelineRail statuses={statuses} activeId={activeId} onSelect={selectStage} />

      {/* Body — narrow control rail, wide preview */}
      <div className="flex min-h-0 flex-1 gap-2.5 p-2.5">
        <div className="w-[248px] shrink-0">
          <ControlRail
            stage={activeStage}
            status={activeStatus}
            mode={mode}
            progress={progress}
            uploadedFile={activeId === 'classification' ? uploadedClassificationFile : uploadedIntakeFile}
            attachedFrom={
              activeId === 'classification'
                ? manualUpload.classification
                  ? null
                  : 'Output of step 4, already on the deal'
                : manualUpload.intake || !provenance
                  ? null
                  : `Attached to the request from ${provenance.email.from}`
            }
            run={effectiveStageRuns[activeId]}
            onUpload={activeId === 'classification' ? setUploadedClassificationFile : setUploadedIntakeFile}
            onFileUpload={handleFileUpload}
            checkingFile={checkingFile}
            onRun={() => runStage(activeId)}
            onApprove={() => approve(activeId)}
          />
        </div>

        <div className="min-w-0 flex-1">
          {isExternalStage(activeId) && externalJobs[activeId] && !selected ? (
            <div className="h-full rounded-lg border border-slate-200 bg-white">
              <ExternalJobPanel
                stageId={activeId}
                job={externalJobs[activeId]}
                permission={permission}
                onEnableNotifications={requestNotifications}
              />
            </div>
          ) : (
            <PreviewStage
              stage={tabStage}
              status={activeStatus}
              progress={progress}
              run={effectiveStageRuns[previewStageId]}
              output={selected?.output ?? null}
              table={table}
              beforeTable={beforeTable}
              beforeLabel="Before"
              tabs={tabs}
              dealId={dealId ?? ''}
              deckMap={deckMap}
              deckEdits={deckEdits}
              onDeckEdit={handleDeckEdit}
              onSelectTab={(t) => setSelected(t)}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>
    </main>
  );
}
