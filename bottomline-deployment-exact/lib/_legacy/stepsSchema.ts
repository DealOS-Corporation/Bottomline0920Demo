// Step status type
export type StepStatus = 'not-started' | 'ready' | 'running' | 'blocked' | 'done' | 'error';

// Step owner type
export type StepOwner = 'Analyst' | 'Agent' | 'Alteryx' | 'ROC' | 'API';

// Input field types for step forms
export type InputType = 'select' | 'checkbox' | 'text' | 'number';

export interface StepInput {
  id: string;
  label: string;
  type: InputType;
  options?: string[]; // For select type
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface SuggestedAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'warning';
}

export interface SubStep {
  id: string;
  label: string;
  status: StepStatus;
  timestamp?: string;
  message?: string;
}

export interface StepSchema {
  id: string;
  label: string;
  order: number;
  owner: StepOwner;
  status: StepStatus;
  isLocked?: boolean;
  inputs: StepInput[];
  suggestedActions: SuggestedAction[];
  expectedArtifacts: string[];
  description?: string;
  subSteps?: SubStep[];
}

// ============================================================
//  6-step Bottomline Payer Pricing Operating System
//  Architecture per Jamie feedback + product analysis (3/2/26)
//
//  1. Intake & Validation
//  2. Processing Orchestration (Alteryx + ROC combined)
//  3. Campaign Classification           (Wedge #1)
//  4. Internal Value Statement Generator
//  5. External ROI & Sales Materials     (Wedge #2)
//  6. Salesforce Sync                    (Wedge #3)
//
//  Intelligence Dashboard → standalone overlay (not a step)
// ============================================================

export const stepsSchema: StepSchema[] = [
  // ── Step 1: Intake & Validation ──
  {
    id: 'intake',
    label: 'Intake & Validation',
    order: 1,
    owner: 'Agent',
    status: 'done',
    description: 'Capture the bank-channel analysis request, identify the corporate payer, collect vendor payment files, validate required fields, and decide whether the deal is ready for processing.',
    inputs: [
      { id: 'dealSource', label: 'Request Source', type: 'select', options: ['Email Import', 'Manual Upload', 'Sent to Pricing Ops', 'Salesforce Sync'] },
      { id: 'bankChannel', label: 'Bank Channel', type: 'select', options: ['JPMorgan Chase', 'Bank of America', 'Fifth Third Bank', 'Other'] },
      { id: 'analysisType', label: 'Analysis Type', type: 'select', options: ['Paymode Only', 'Card', 'Comprehensive Payables', 'Mixed / Unknown'] },
      { id: 'mappingMode', label: 'Field Mapping Mode', type: 'select', options: ['Fuzzy Mapping', 'Exact Mapping'] },
      { id: 'flagMissing', label: 'Flag missing required fields', type: 'checkbox', defaultValue: true },
      { id: 'dedupeRecords', label: 'Detect duplicate attachments or vendors', type: 'checkbox', defaultValue: true },
    ],
    suggestedActions: [
      { id: 'import-email', label: 'Import Bank Request', variant: 'primary' },
      { id: 'validate', label: 'Run Intake Checks', variant: 'secondary' },
      { id: 'clean', label: 'Prepare Field Mapping', variant: 'secondary' },
    ],
    expectedArtifacts: ['bank_request.eml', 'original_vendor_payment_file.xlsx', 'intake_validation_report.json', 'field_mapping_draft.xlsx'],
  },

  // ── Step 2: Processing Orchestration (Alteryx + ROC) ──
  {
    id: 'processing',
    label: 'Processing Orchestration',
    order: 2,
    owner: 'Alteryx',
    status: 'running',
    description: 'Alteryx workflow selection + execution, cleaning & transformation, ROC business logic execution, structured Excel output',
    inputs: [
      { id: 'alteryxWorkflow', label: 'Alteryx Workflow', type: 'select', options: ['Standard Payer', 'Enterprise Payer', 'Custom Workflow'] },
      { id: 'rocTemplate', label: 'ROC Template', type: 'select', options: ['Template A', 'Template B', 'Template C'] },
      { id: 'cardType', label: 'Card Type', type: 'select', options: ['Mastercard', 'Visa', 'Both'] },
      { id: 'processingModel', label: 'Processing Model', type: 'select', options: ['Standard', 'Premium', 'Custom'] },
      { id: 'outputFormat', label: 'Output Format', type: 'select', options: ['Excel', 'CSV', 'JSON'] },
    ],
    suggestedActions: [
      { id: 'run-processing', label: 'Run Processing', variant: 'primary' },
      { id: 'check-status', label: 'Check Status', variant: 'secondary' },
    ],
    expectedArtifacts: ['mapped_data.xlsx', 'roc_output.xlsx', 'processing_log.json'],
    subSteps: [
      { id: 'alteryx-upload', label: 'File Upload to Alteryx', status: 'done', timestamp: '10:20 AM' },
      { id: 'alteryx-workflow', label: 'Alteryx Workflow Execution', status: 'done', timestamp: '10:22 AM' },
      { id: 'alteryx-to-roc', label: 'Alteryx -> ROC Handoff', status: 'done', timestamp: '10:25 AM' },
      { id: 'roc-execution', label: 'ROC Business Logic', status: 'running', timestamp: '10:26 AM', message: 'Processing batch 3/5...' },
      { id: 'roc-to-alteryx', label: 'ROC -> Alteryx Return', status: 'not-started' },
      { id: 'final-output', label: 'Final Output Generation', status: 'not-started' },
    ],
  },

  // ── Step 3: Campaign Classification (Wedge #1 — Biggest Value) ──
  {
    id: 'campaign-classification',
    label: 'Campaign Classification',
    order: 3,
    owner: 'Agent',
    status: 'not-started',
    description: 'Classify vendor industry, flag exclusion categories (insurance, govt, adult, gambling), suggest campaign type (Card / ACH / Premium) with confidence scoring and manual override',
    inputs: [
      { id: 'classificationModel', label: 'Classification Model', type: 'select', options: ['Default', 'Conservative', 'Aggressive'] },
      { id: 'confidenceThreshold', label: 'Confidence Threshold', type: 'select', options: ['90%', '85%', '80%', '75%'] },
      { id: 'autoExclude', label: 'Auto-exclude restricted categories', type: 'checkbox', defaultValue: true },
      { id: 'autoClassify', label: 'Auto-classify vendor industry', type: 'checkbox', defaultValue: true },
      { id: 'reviewScope', label: 'Review Scope', type: 'select', options: ['All Vendors', 'Flagged Only', 'High-Value Only'] },
      { id: 'targetType', label: 'Default Campaign Type', type: 'select', options: ['Card', 'ACH', 'Premium', 'Basic'] },
    ],
    suggestedActions: [
      { id: 'run-classification', label: 'Run Classification', variant: 'primary' },
      { id: 'review-flagged', label: 'Review Flagged Vendors', variant: 'secondary' },
      { id: 'override-batch', label: 'Batch Override', variant: 'secondary' },
      { id: 'export-report', label: 'Export Classification Report', variant: 'secondary' },
    ],
    expectedArtifacts: ['vendor_classification.csv', 'exclusion_report.json', 'campaign_targets.xlsx', 'confidence_report.pdf'],
  },

  // ── Step 4: Internal Value Statement Generator ──
  {
    id: 'internal-value-statement',
    label: 'Internal Value Statement',
    order: 4,
    owner: 'Agent',
    status: 'not-started',
    description: 'Full internal value statement with booking calculator tab, ARR calculator, 140+ data fields, conversion assumptions, revenue projections',
    inputs: [
      { id: 'statementTemplate', label: 'Statement Template', type: 'select', options: ['Standard', 'Enterprise', 'Custom'] },
      { id: 'includeBookingCalc', label: 'Booking Calculator Tab', type: 'checkbox', defaultValue: true },
      { id: 'includeARR', label: 'ARR Revenue Tab', type: 'checkbox', defaultValue: true },
      { id: 'conversionModel', label: 'Conversion Rate Model', type: 'select', options: ['Historical', 'Adjusted', 'Conservative'] },
      { id: 'revenueProjection', label: 'Revenue Projection Horizon', type: 'select', options: ['1 Year', '3 Year', '5 Year'] },
    ],
    suggestedActions: [
      { id: 'generate-statement', label: 'Generate Value Statement', variant: 'primary' },
      { id: 'edit-assumptions', label: 'Edit Assumptions', variant: 'secondary' },
      { id: 'preview-booking', label: 'Preview Booking Calc', variant: 'secondary' },
    ],
    expectedArtifacts: ['internal_value_statement.xlsx', 'booking_calculator.xlsx', 'arr_projections.pdf'],
  },

  // ── Step 5: External ROI & Sales Materials (Wedge #2) ──
  {
    id: 'external-roi',
    label: 'External ROI & Sales Materials',
    order: 5,
    owner: 'Agent',
    status: 'not-started',
    description: 'Customer-facing ROI PowerPoint & sales materials. Template ingestion, data mapping, chart rendering, multi-template selector by channel',
    inputs: [
      { id: 'deckTemplate', label: 'Deck Template', type: 'select', options: ['Bank of America', 'US Bank', 'Wells Fargo', 'JPMorgan Chase', 'Citibank', 'Generic'] },
      { id: 'includeRebateSlides', label: 'Include Rebate Slides', type: 'checkbox', defaultValue: true },
      { id: 'includeConversionRates', label: 'Include Conversion Rates', type: 'checkbox', defaultValue: true },
      { id: 'includeCaseStudy', label: 'Include Case Study', type: 'checkbox', defaultValue: true },
      { id: 'chartStyle', label: 'Chart Style', type: 'select', options: ['Modern', 'Classic', 'Minimal'] },
    ],
    suggestedActions: [
      { id: 'generate-deck', label: 'Generate ROI Deck', variant: 'primary' },
      { id: 'preview-slides', label: 'Preview Slides', variant: 'secondary' },
      { id: 'customize-template', label: 'Customize Template', variant: 'secondary' },
    ],
    expectedArtifacts: ['roi_deck.pptx', 'roi_one_pager.pdf', 'slide_thumbnails.zip'],
  },

  // ── Step 6: Salesforce Sync (Wedge #3) ──
  {
    id: 'salesforce-sync',
    label: 'Salesforce Sync',
    order: 6,
    owner: 'API',
    status: 'not-started',
    description: 'Automated API push of ~140 columns to Salesforce Opportunity fields. Map fields, sync status, replace nightly manual upload',
    inputs: [
      { id: 'sfEnvironment', label: 'SF Environment', type: 'select', options: ['Production', 'Sandbox', 'Dev Org'] },
      { id: 'syncMode', label: 'Sync Mode', type: 'select', options: ['Full Sync', 'Delta Only', 'Preview Only'] },
      { id: 'autoSync', label: 'Auto-sync on generation', type: 'checkbox', defaultValue: false },
      { id: 'notifyStakeholders', label: 'Notify Stakeholders', type: 'checkbox', defaultValue: true },
      { id: 'attachDeck', label: 'Attach ROI Deck to Opp', type: 'checkbox', defaultValue: true },
    ],
    suggestedActions: [
      { id: 'sync-to-sf', label: 'Sync to Salesforce', variant: 'primary' },
      { id: 'preview-mapping', label: 'Preview Field Mapping', variant: 'secondary' },
      { id: 'validate-connection', label: 'Validate Connection', variant: 'secondary' },
    ],
    expectedArtifacts: ['sf_sync_confirmation.pdf', 'field_mapping.json', 'sync_audit_log.json'],
  },

];

export function getStepById(stepId: string): StepSchema | undefined {
  return stepsSchema.find(step => step.id === stepId);
}

export function getStepByOrder(order: number): StepSchema | undefined {
  return stepsSchema.find(step => step.order === order);
}
