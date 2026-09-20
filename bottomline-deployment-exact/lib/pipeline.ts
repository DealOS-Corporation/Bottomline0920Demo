// ============================================================
//  Paymode Strategic Payables Analysis — pipeline model
//  Derived from Paymode_Process_Map.html (31 nodes / 6 sections)
//
//  Real execution order:
//    raw file -> Alteryx (clean) -> ROC (match) -> Alteryx (pricing)
//    -> classification review -> internal value statement
//    -> external ROI workbook + deck -> Salesforce sync
// ============================================================

export type StageStatus =
  | 'locked'
  | 'ready'
  | 'running'
  | 'needs-review'
  | 'done'
  | 'skipped'
  | 'error';

/** Who/what actually executes the stage. */
export type Engine = 'dealos' | 'alteryx' | 'roc' | 'salesforce' | 'external';

export type RunMode = 'autopilot' | 'human';

export interface SubStep {
  id: string;
  label: string;
  engine: Engine;
}

export interface StageOutput {
  /** Canonical file number used by the analyst team, e.g. "File 4". */
  ref: string;
  filename: string;
  kind: 'xlsx' | 'pptx' | 'json' | 'eml' | 'record';
  /** Whether DealOS produces this file itself, or it comes back from an engine. */
  producedBy: Engine;
}

export interface Stage {
  id: string;
  label: string;
  /** Short label for the compact rail. */
  short: string;
  order: number;
  engine: Engine;
  summary: string;
  inputRef: string;
  subSteps: SubStep[];
  outputs: StageOutput[];
}

export const ENGINE_LABEL: Record<Engine, string> = {
  dealos: 'DealOS',
  alteryx: 'Alteryx',
  roc: 'ROC',
  salesforce: 'Salesforce',
  external: 'External',
};

export const pipeline: Stage[] = [
  {
    id: 'intake',
    label: 'Intake & File Check',
    short: 'Intake',
    order: 1,
    engine: 'dealos',
    summary:
      'Receive the bank request and the client payment file, then check the key columns exist and look usable before any work starts.',
    inputRef: 'Bank email + raw vendor payment file',
    subSteps: [
      { id: 'receive', label: 'Receive request + attachment', engine: 'dealos' },
      { id: 'usable', label: 'Column presence & value sanity check', engine: 'dealos' },
      { id: 'clarify', label: 'Draft missing-data request (only if failed)', engine: 'dealos' },
    ],
    outputs: [
      { ref: 'File 1', filename: '1_ORIGINAL_VENDOR_FILE.xlsx', kind: 'xlsx', producedBy: 'external' },
      { ref: '—', filename: 'intake_check_report.json', kind: 'json', producedBy: 'dealos' },
    ],
  },
  {
    id: 'alteryx-clean',
    label: 'Alteryx Cleaning',
    short: 'Clean',
    order: 2,
    engine: 'alteryx',
    summary:
      'DealOS builds the mapping document, hands the raw file to Alteryx over API, then trims the cleaned result down to the ROC upload file.',
    inputRef: 'File 1',
    subSteps: [
      { id: 'mapping', label: 'Build mapping document', engine: 'dealos' },
      { id: 'clean-run', label: 'Run cleaning workflow', engine: 'alteryx' },
      { id: 'flags', label: 'Review exception flags', engine: 'dealos' },
      { id: 'roc-prep', label: 'Build ROC upload file', engine: 'dealos' },
    ],
    outputs: [
      { ref: 'File 2', filename: '2_Mapping_Document.xlsx', kind: 'xlsx', producedBy: 'dealos' },
      { ref: 'File 3', filename: '3_Alteryx_Cleaning_Output.xlsx', kind: 'xlsx', producedBy: 'alteryx' },
      { ref: 'File 4', filename: '4_ROC_Upload_VHFCleaned.xlsx', kind: 'xlsx', producedBy: 'dealos' },
    ],
  },
  {
    id: 'roc-match',
    label: 'ROC Network & Card Match',
    short: 'ROC Match',
    order: 3,
    engine: 'roc',
    summary:
      'ROC matches every vendor against the Paymode network and Visa/Mastercard data, then exports the enriched pricing file.',
    inputRef: 'File 4',
    subSteps: [
      { id: 'upload', label: 'Upload file to ROC', engine: 'roc' },
      { id: 'match', label: 'Network + card brand match', engine: 'roc' },
      { id: 'export', label: 'Export pricing file', engine: 'roc' },
    ],
    outputs: [
      { ref: 'File 5', filename: '5_ROC_pricing_export.xlsx', kind: 'xlsx', producedBy: 'roc' },
    ],
  },
  {
    id: 'alteryx-pricing',
    label: 'Alteryx Pricing & Segmentation',
    short: 'Pricing',
    order: 4,
    engine: 'alteryx',
    summary:
      'Second Alteryx pass turns the ROC match results into the pricing/segmentation file — one proposed Segment per vendor, plus exclusions and fee caps.',
    inputRef: 'File 5 + File 4',
    subSteps: [
      { id: 'pricing-run', label: 'Run pricing workflow', engine: 'alteryx' },
      { id: 'segment', label: 'Assign proposed Segment', engine: 'alteryx' },
    ],
    outputs: [
      { ref: 'File 6', filename: '6_Alteryx_PricingOutput.xlsx', kind: 'xlsx', producedBy: 'alteryx' },
    ],
  },
  {
    id: 'classification',
    label: 'Classification Review',
    short: 'Classify',
    order: 5,
    engine: 'dealos',
    summary:
      'DealOS applies the segment override rules to File 6 and produces File 7. Rows it cannot decide confidently are raised as exceptions for the analyst.',
    inputRef: 'File 6',
    subSteps: [
      { id: 'rules', label: 'Apply override rules', engine: 'dealos' },
      { id: 'exceptions', label: 'Raise low-confidence exceptions', engine: 'dealos' },
      { id: 'approve', label: 'Analyst approval', engine: 'dealos' },
    ],
    outputs: [
      { ref: 'File 7', filename: '7_Reviewed_PricingOutput_MR.xlsx', kind: 'xlsx', producedBy: 'dealos' },
    ],
  },
  {
    id: 'value-statement',
    label: 'Internal Value Statement',
    short: 'Value Stmt',
    order: 6,
    engine: 'dealos',
    summary:
      'Loads the reviewed vendors into the VHF model, applies segment mapping, conversion rates and deal assumptions, then calculates booking values and runs QA.',
    inputRef: 'File 7',
    subSteps: [
      { id: 'vhf', label: 'Map reviewed rows into VHF', engine: 'dealos' },
      { id: 'assumptions', label: 'Fill deal assumptions', engine: 'dealos' },
      { id: 'calc', label: 'Calculate projections & booking', engine: 'dealos' },
      { id: 'qa', label: 'Reconciliation QA', engine: 'dealos' },
    ],
    outputs: [
      { ref: 'File 8', filename: '8_Internal_Value_Statement.xlsx', kind: 'xlsx', producedBy: 'dealos' },
    ],
  },
  {
    id: 'external-roi',
    label: 'External ROI & Deck',
    short: 'ROI Deck',
    order: 7,
    engine: 'dealos',
    summary:
      'Builds the client-facing ROI workbook from the approved internal statement, renders the ROI slide deck from the fixed template, and produces the target vendor list.',
    inputRef: 'File 8',
    subSteps: [
      { id: 'workbook', label: 'Build external ROI workbook', engine: 'dealos' },
      { id: 'deck', label: 'Render ROI slide deck', engine: 'dealos' },
      { id: 'vendor-list', label: 'Build target vendor list', engine: 'dealos' },
      { id: 'release', label: 'Release check', engine: 'dealos' },
    ],
    outputs: [
      { ref: 'File 9', filename: '9_External_ROI_Analysis.xlsx', kind: 'xlsx', producedBy: 'dealos' },
      { ref: 'File 10', filename: '10_Paymode_ROI_Slides.pptx', kind: 'pptx', producedBy: 'dealos' },
      { ref: '—', filename: 'target_vendor_list.xlsx', kind: 'xlsx', producedBy: 'dealos' },
    ],
  },
  {
    id: 'sendback',
    label: 'Send Back to Bank',
    short: 'Send Back',
    order: 8,
    engine: 'dealos',
    summary:
      'Drafts the reply on the original bank request, attaches the released package, and hands it to the analyst mail client to send. The internal value statement goes to the pricing team only.',
    inputRef: 'File 9 + File 10 + target vendor list',
    subSteps: [
      { id: 'package', label: 'Collect released package', engine: 'dealos' },
      { id: 'recipients', label: 'Resolve recipients from the request thread', engine: 'dealos' },
      { id: 'draft', label: 'Draft external + internal notes', engine: 'dealos' },
      { id: 'handoff', label: 'Punch out to mail client', engine: 'dealos' },
    ],
    outputs: [
      { ref: '—', filename: 'sendback_external.eml', kind: 'eml', producedBy: 'dealos' },
      { ref: '—', filename: 'sendback_internal.eml', kind: 'eml', producedBy: 'dealos' },
    ],
  },
  {
    id: 'salesforce',
    label: 'Salesforce Sync',
    short: 'Salesforce',
    order: 9,
    engine: 'salesforce',
    summary:
      'Pushes the pricing detail fields and the released package back onto the Salesforce Opportunity record.',
    inputRef: 'File 8 (Pricing Details for SF) + released package',
    subSteps: [
      { id: 'map-fields', label: 'Map pricing fields', engine: 'dealos' },
      { id: 'push', label: 'Push to Opportunity record', engine: 'salesforce' },
      { id: 'attach', label: 'Attach released package', engine: 'salesforce' },
    ],
    outputs: [
      { ref: '—', filename: 'salesforce_sync_receipt.json', kind: 'json', producedBy: 'salesforce' },
    ],
  },
];

export const getStage = (id: string) => pipeline.find((s) => s.id === id);
export const stageIndex = (id: string) => pipeline.findIndex((s) => s.id === id);
