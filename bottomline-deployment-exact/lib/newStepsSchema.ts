// Step status type
export type StepStatus = 'not-started' | 'ready' | 'running' | 'blocked' | 'done' | 'error';

// Step owner type
export type StepOwner = 'Analyst' | 'Agent' | 'System' | 'API';

// Step UI type - determines what the main panel shows
export type StepUIType = 
  | 'data-preview'      // Shows data table with edit/validation capabilities
  | 'status-only'       // Shows status/progress only, no preview needed
  | 'review'            // Shows exception list for approval
  | 'document-preview'  // Shows generated document for review
  | 'form-submission';  // Shows form + status after submission

// Input field types for step forms
export type InputType = 'select' | 'checkbox' | 'text' | 'number';

export interface StepInput {
  id: string;
  label: string;
  type: InputType;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

export interface SuggestedAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'warning';
  icon?: string;
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
  shortLabel: string;
  order: number;
  owner: StepOwner;
  status: StepStatus;
  uiType: StepUIType;
  isLocked?: boolean;
  inputs: StepInput[];
  suggestedActions: SuggestedAction[];
  subSteps?: SubStep[];           // For status-only steps, show sub-step progress
  expectedArtifacts: string[];
  description: string;            // Brief explanation of what this step does
  currentTime: string;            // Current state time
  futureTime: string;             // Future state time (after automation)
}

// Redesigned 7-step workflow
export const stepsSchema: StepSchema[] = [
  {
    id: 'intake-validation',
    label: 'Intake & Validation',
    shortLabel: 'Intake',
    order: 1,
    owner: 'Agent',
    status: 'done',
    uiType: 'data-preview',
    description: 'Ingest requests, validate data, and clean up formatting issues',
    currentTime: '~5-40 mins',
    futureTime: '~3-7 mins',
    inputs: [
      { id: 'source', label: 'Data Source', type: 'select', options: ['Email Import', 'Manual Upload', 'Salesforce Sync'] },
      { id: 'autoClean', label: 'Auto-clean data', type: 'checkbox', defaultValue: true },
      { id: 'flagMissing', label: 'Flag missing fields', type: 'checkbox', defaultValue: true },
    ],
    suggestedActions: [
      { id: 'import-email', label: 'Import from Email', variant: 'primary', icon: 'mail' },
      { id: 'validate', label: 'Validate Data', variant: 'secondary', icon: 'check' },
      { id: 'clean', label: 'Clean & Normalize', variant: 'secondary', icon: 'settings' },
    ],
    expectedArtifacts: ['intake_data.csv', 'validation_report.json'],
  },
  {
    id: 'roc-processing',
    label: 'ROC Processing',
    shortLabel: 'ROC',
    order: 2,
    owner: 'System',
    status: 'running',
    uiType: 'status-only',
    isLocked: true,
    description: 'Alteryx mapping, ROC execution, and monitoring (automated)',
    currentTime: '~1-6 hours',
    futureTime: '~40 mins-6h',
    inputs: [],
    suggestedActions: [
      { id: 'view-logs', label: 'View Logs', variant: 'secondary', icon: 'file-text' },
    ],
    subSteps: [
      { id: 'alteryx-map', label: 'Alteryx Mapping', status: 'done', timestamp: '10:23 AM', message: 'Mapped 1,245 records to ROC format' },
      { id: 'roc-upload', label: 'ROC Upload', status: 'done', timestamp: '10:24 AM', message: 'Files uploaded successfully' },
      { id: 'roc-execute', label: 'ROC Execution', status: 'running', message: 'Processing... 67% complete' },
      { id: 'monitoring', label: 'Monitoring', status: 'not-started' },
    ],
    expectedArtifacts: ['roc_output.json'],
  },
  {
    id: 'enrichment',
    label: 'Enrichment',
    shortLabel: 'Enrich',
    order: 3,
    owner: 'Agent',
    status: 'not-started',
    uiType: 'data-preview',
    description: 'Add industry data, spend totals, and ACH logic',
    currentTime: 'TBD',
    futureTime: '~1-2 mins',
    inputs: [
      { id: 'enrichSource', label: 'Enrichment Source', type: 'select', options: ['Internal DB', 'Alteryx', 'Manual'] },
      { id: 'includeACH', label: 'Include ACH Logic', type: 'checkbox', defaultValue: true },
      { id: 'calcSpendTotals', label: 'Calculate Spend Totals', type: 'checkbox', defaultValue: true },
    ],
    suggestedActions: [
      { id: 'run-enrichment', label: 'Run Enrichment', variant: 'primary', icon: 'refresh' },
      { id: 'preview-changes', label: 'Preview Changes', variant: 'secondary', icon: 'eye' },
    ],
    expectedArtifacts: ['enriched_data.csv', 'spend_analysis.xlsx'],
  },
  {
    id: 'review-validation',
    label: 'Review & Validation',
    shortLabel: 'Review',
    order: 4,
    owner: 'Analyst',
    status: 'not-started',
    uiType: 'review',
    description: 'Exception-based review for high-value vendors (>$50K)',
    currentTime: '~20 mins-1h',
    futureTime: '~5-10 mins',
    inputs: [
      { id: 'threshold', label: 'Review Threshold', type: 'select', options: ['$50K+', '$100K+', '$250K+', 'All'] },
      { id: 'autoApprove', label: 'Auto-approve under threshold', type: 'checkbox', defaultValue: true },
    ],
    suggestedActions: [
      { id: 'approve-all', label: 'Approve All', variant: 'primary', icon: 'check-circle' },
      { id: 'flag-exception', label: 'Flag Exception', variant: 'warning', icon: 'alert-triangle' },
    ],
    expectedArtifacts: ['review_summary.pdf', 'approved_items.json'],
  },
  {
    id: 'value-statement',
    label: 'Value Statement',
    shortLabel: 'Value',
    order: 5,
    owner: 'Agent',
    status: 'done',  // Changed to done so we can see the intelligence panel
    uiType: 'document-preview',
    description: 'Auto-generate value statement document',
    currentTime: 'TBD',
    futureTime: '~1-5 mins',
    inputs: [
      { id: 'template', label: 'Template', type: 'select', options: ['Standard', 'Enterprise', 'Custom'] },
      { id: 'includeROI', label: 'Include ROI Analysis', type: 'checkbox', defaultValue: true },
      { id: 'language', label: 'Language', type: 'select', options: ['English', 'Spanish', 'French'] },
    ],
    suggestedActions: [
      { id: 'generate', label: 'Generate Statement', variant: 'primary', icon: 'file-text' },
      { id: 'edit', label: 'Edit Manually', variant: 'secondary', icon: 'edit' },
      { id: 'regenerate', label: 'Regenerate', variant: 'secondary', icon: 'refresh-cw' },
    ],
    expectedArtifacts: ['value_statement.pdf', 'value_statement.docx'],
  },
  {
    id: 'pricing-materials',
    label: 'Pricing & Materials',
    shortLabel: 'Pricing',
    order: 6,
    owner: 'Agent',
    status: 'not-started',
    uiType: 'data-preview',
    description: 'Calculate pricing, generate booking info, and create sales materials',
    currentTime: '~5 mins + TBD',
    futureTime: '~1-2 mins',
    inputs: [
      { id: 'pricingModel', label: 'Pricing Model', type: 'select', options: ['Standard', 'Volume', 'Custom'] },
      { id: 'generateDeck', label: 'Generate Sales Deck', type: 'checkbox', defaultValue: false },
      { id: 'generateDashboard', label: 'Generate Dashboard', type: 'checkbox', defaultValue: true },
    ],
    suggestedActions: [
      { id: 'calculate', label: 'Calculate Pricing', variant: 'primary', icon: 'calculator' },
      { id: 'generate-materials', label: 'Generate Materials', variant: 'secondary', icon: 'presentation' },
    ],
    expectedArtifacts: ['pricing_sheet.xlsx', 'booking_form.pdf', 'sales_dashboard.pdf'],
  },
  {
    id: 'submit-close',
    label: 'Submit & Close',
    shortLabel: 'Submit',
    order: 7,
    owner: 'API',
    status: 'not-started',
    uiType: 'status-only',
    description: 'Submit to MC/Visa, send results, and close in Salesforce',
    currentTime: 'TBD',
    futureTime: '~1-3 mins',
    inputs: [],
    suggestedActions: [
      { id: 'submit', label: 'Submit All', variant: 'primary', icon: 'send' },
      { id: 'close-sf', label: 'Close in Salesforce', variant: 'secondary', icon: 'check-square' },
    ],
    subSteps: [
      { id: 'mc-submit', label: 'Mastercard Submission', status: 'not-started' },
      { id: 'visa-submit', label: 'Visa Submission', status: 'not-started' },
      { id: 'email-results', label: 'Email Results', status: 'not-started' },
      { id: 'sf-update', label: 'Salesforce Update', status: 'not-started' },
    ],
    expectedArtifacts: ['submission_confirmation.pdf', 'audit_trail.json'],
  },
];

export function getStepById(stepId: string): StepSchema | undefined {
  return stepsSchema.find(step => step.id === stepId);
}

export function getStepByOrder(order: number): StepSchema | undefined {
  return stepsSchema.find(step => step.order === order);
}
