// ============================================================
//  Steps 2/3/4 run inside vendor systems (Alteryx, ROC) that
//  DealOS does not control. DealOS's job for those steps is to
//  hand the file over, TRACK the job, and tell the analyst the
//  moment it comes back so they can move the file to the next
//  system. This file is the single definition of that handover.
//
//  Swapping the stub for a real vendor API means replacing the
//  phase timings in app/api/external/* with real submit/poll
//  calls — the UI contract below stays the same.
// ============================================================

export interface ExternalJobPhase {
  label: string;
  /** How long this phase takes in the stub. Real connectors report this instead. */
  ms: number;
}

export interface ExternalConnector {
  stageId: string;
  system: string;
  /** What the analyst physically hands over to start the job. */
  handoffIn: string;
  /** What comes back, and where it has to go next. */
  handoffOut: string;
  nextAction: string;
  phases: ExternalJobPhase[];
}

export const EXTERNAL_CONNECTORS: Record<string, ExternalConnector> = {
  'alteryx-clean': {
    stageId: 'alteryx-clean',
    system: 'Alteryx',
    handoffIn: 'File 1 + mapping document',
    handoffOut: 'File 3 — Alteryx cleaning output',
    nextAction: 'Build File 4 and upload it to ROC.',
    phases: [
      { label: 'Submitting file to Alteryx', ms: 600 },
      { label: 'Alteryx cleaning workflow running', ms: 1700 },
      { label: 'Collecting cleaning output', ms: 500 },
    ],
  },
  'roc-match': {
    stageId: 'roc-match',
    system: 'ROC',
    handoffIn: 'File 4 — ROC upload file',
    handoffOut: 'File 5 — ROC pricing export',
    nextAction: 'Send File 5 to the Alteryx pricing workflow.',
    phases: [
      { label: 'Uploading file to ROC', ms: 600 },
      { label: 'Paymode network match running', ms: 1400 },
      { label: 'Visa / Mastercard card match running', ms: 1400 },
      { label: 'Exporting pricing file', ms: 500 },
    ],
  },
  'alteryx-pricing': {
    stageId: 'alteryx-pricing',
    system: 'Alteryx',
    handoffIn: 'File 5 + File 4',
    handoffOut: 'File 6 — Alteryx pricing output',
    nextAction: 'Run File 6 through Classification Review.',
    phases: [
      { label: 'Submitting file to Alteryx', ms: 600 },
      { label: 'Pricing & segmentation workflow running', ms: 1700 },
      { label: 'Collecting pricing output', ms: 500 },
    ],
  },
};

export const isExternalStage = (stageId: string) => stageId in EXTERNAL_CONNECTORS;

export interface ExternalJobStatus {
  jobId: string;
  stageId: string;
  system: string;
  phaseIndex: number;
  phaseLabel: string;
  totalPhases: number;
  progress: number;
  done: boolean;
  handoffOut: string;
  nextAction: string;
}
