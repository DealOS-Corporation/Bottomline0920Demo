// Step-specific check results and preview data for every step in the pipeline
import { CheckResultItem } from '@/components/CheckStatusBoard';
import { PreviewTableData } from '@/components/StepCenterPanel';
import { ValidationCheck } from '@/components/ValidationChecksModule';

// == Per-step validation checks ==
export const stepChecks: Record<string, ValidationCheck[]> = {
  'intake': [
    { id: 'request-context', label: 'Bank Request Context', description: 'Bank channel, corporate payer, analysis type, and requester are identified', enabled: true, category: 'completeness' },
    { id: 'attachment-detection', label: 'Attachment Detection', description: 'Original vendor payment file and any supporting templates are detected', enabled: true, category: 'multifile' },
    { id: 'required-fields', label: 'Required Payment Fields', description: 'Vendor, payment method, spend, transaction count, address, and tax/vendor IDs are present or flagged', enabled: true, category: 'completeness' },
    { id: 'field-ambiguity', label: 'Field Ambiguity', description: 'Multiple candidate columns for the same business concept are flagged for review', enabled: true, category: 'ambiguity' },
    { id: 'duplicate-files', label: 'Duplicate File Check', description: 'Repeated original files, duplicate tabs, or duplicate vendor records are detected', enabled: true, category: 'multifile' },
    { id: 'payment-method', label: 'Payment Method Normalization', description: 'Check, ACH, wire, card, and other payment labels can be normalized for processing', enabled: true, category: 'payment' },
    { id: 'ready-decision', label: 'Ready for Processing Decision', description: 'Deal is marked Ready, Needs Clarification, or Blocked before Step 2', enabled: true, category: 'mapping' },
  ],
  'processing': [
    { id: 'field-mapping', label: 'Alteryx Field Mapping', description: 'All source fields correctly mapped to target schema', enabled: true, category: 'mapping' },
    { id: 'data-types', label: 'Data Type Consistency', description: 'Source and target data types match', enabled: true, category: 'types' },
    { id: 'workflow-status', label: 'Alteryx Workflow Status', description: 'Alteryx workflow completed without errors', enabled: true, category: 'execution' },
    { id: 'roc-upload', label: 'ROC File Upload', description: 'All files uploaded to ROC server', enabled: true, category: 'upload' },
    { id: 'roc-schema', label: 'ROC Schema Validation', description: 'Input matches ROC expected schema', enabled: true, category: 'schema' },
    { id: 'roc-exec', label: 'ROC Execution', description: 'ROC processing completed successfully', enabled: true, category: 'execution' },
    { id: 'output-validation', label: 'Output Row Count', description: 'Output row count matches expected count', enabled: true, category: 'validation' },
  ],
  'campaign-classification': [
    { id: 'vendor-classification', label: 'Vendor Classification', description: 'Vendors classified by industry using approved reference data', enabled: true, category: 'classification' },
    { id: 'entity-resolution', label: 'Entity Resolution', description: 'Fuzzy matching resolves vendor identities against the reference database', enabled: true, category: 'resolution' },
    { id: 'confidence-scoring', label: 'Confidence Scoring', description: 'Classification confidence above threshold', enabled: true, category: 'confidence' },
    { id: 'restricted-categories', label: 'Restricted Categories', description: 'Flagged vendors in restricted or excluded industries (insurance, govt, adult, gambling)', enabled: true, category: 'exclusion' },
    { id: 'enrichment-match', label: 'Enrichment Match Rate', description: 'Percentage of records successfully enriched via external data', enabled: true, category: 'enrichment' },
    { id: 'duplicate-check', label: 'Duplicate Detection', description: 'No duplicate vendor entries', enabled: true, category: 'dedup' },
    { id: 'campaign-type', label: 'Campaign Type Assignment', description: 'Card / ACH / Premium suggested per vendor', enabled: true, category: 'campaign' },
  ],
  'internal-value-statement': [
    { id: 'booking-calc', label: 'Booking Calculator', description: 'Booking calculator tab populated correctly', enabled: true, category: 'calculation' },
    { id: 'arr-revenue', label: 'ARR Revenue Tab', description: 'Annual recurring revenue calculations verified', enabled: true, category: 'revenue' },
    { id: 'roi-calculation', label: 'ROI Calculation', description: 'ROI figures calculated and validated', enabled: true, category: 'calculation' },
    { id: 'metric-accuracy', label: 'Metric Accuracy', description: 'All metrics sourced from verified data', enabled: true, category: 'accuracy' },
  ],
  'external-roi': [
    { id: 'template-match', label: 'Template Selection', description: 'Channel-specific PowerPoint template applied correctly', enabled: true, category: 'template' },
    { id: 'data-mapping', label: 'Data Population', description: 'All ROI figures mapped from Internal Value Statement to slides', enabled: true, category: 'accuracy' },
    { id: 'chart-rendering', label: 'Chart Rendering', description: 'All charts and visual elements render correctly', enabled: true, category: 'rendering' },
    { id: 'brand-compliance', label: 'Brand Compliance', description: 'Materials follow bank/channel brand guidelines', enabled: true, category: 'brand' },
    { id: 'legal-review', label: 'Legal Review', description: 'No unapproved claims or language', enabled: true, category: 'legal' },
  ],
  'salesforce-sync': [
    { id: 'sf-connection', label: 'Salesforce Connection', description: 'Connected to correct SF environment via API', enabled: true, category: 'connection' },
    { id: 'field-mapping', label: 'Field Mapping (140+)', description: 'All 140+ columns mapped to SF Opportunity fields', enabled: true, category: 'mapping' },
    { id: 'data-validation', label: 'Data Validation', description: 'Data integrity verified before sync', enabled: true, category: 'validation' },
    { id: 'sync-status', label: 'Sync Status', description: 'Records successfully synced to Salesforce', enabled: true, category: 'status' },
    { id: 'deck-attachment', label: 'Deck Attachment', description: 'ROI deck attached to SF Opportunity record', enabled: true, category: 'attachment' },
  ],
};

// == Per-step check results ==
export const stepCheckResults: Record<string, CheckResultItem[]> = {
  'intake': [
    { checkId: 'request-context', checkLabel: 'Bank Request Context', status: 'green', confidence: 96, issues: ['Requester, bank channel, and corporate payer detected from email thread'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'attachment-detection', checkLabel: 'Attachment Detection', status: 'yellow', confidence: 82, issues: ['Original vendor payment file appears twice'], suggestedFixes: ['Keep the numbered original vendor file as the primary intake file'], clarificationQuestions: [] },
    { checkId: 'required-fields', checkLabel: 'Required Payment Fields', status: 'green', confidence: 94, issues: ['Vendor name, payment method, spend, address, and tax/vendor identifiers detected'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'field-ambiguity', checkLabel: 'Field Ambiguity', status: 'yellow', confidence: 72, issues: ['Payment count and transaction count may need confirmation if both appear'], suggestedFixes: ['Map the authoritative count field before Step 2'], clarificationQuestions: ['Which count field should drive pricing and supplier prioritization?'] },
    { checkId: 'duplicate-files', checkLabel: 'Duplicate File Check', status: 'yellow', confidence: 80, issues: ['Potential duplicate attachment detected'], suggestedFixes: ['Mark duplicate as reference-only'], clarificationQuestions: [] },
    { checkId: 'payment-method', checkLabel: 'Payment Method Normalization', status: 'green', confidence: 98, issues: ['Check, ACH, and direct deposit labels can be normalized'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'ready-decision', checkLabel: 'Ready for Processing Decision', status: 'green', confidence: 91, issues: ['Deal can proceed after duplicate file designation'], suggestedFixes: [], clarificationQuestions: [] },
  ],
  'processing': [
    { checkId: 'field-mapping', checkLabel: 'Alteryx Field Mapping', status: 'green', confidence: 96, issues: ['36 of 38 fields auto-mapped'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'data-types', checkLabel: 'Data Type Consistency', status: 'yellow', confidence: 78, issues: ['"Transaction Date" parsed as string, expected date', '"Amount" contains currency symbols in 12 rows'], suggestedFixes: ['Convert Transaction Date to DATE format', 'Strip currency symbols from Amount column'], clarificationQuestions: [] },
    { checkId: 'workflow-status', checkLabel: 'Alteryx Workflow Status', status: 'green', confidence: 100, issues: [], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'roc-upload', checkLabel: 'ROC File Upload', status: 'green', confidence: 100, issues: [], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'roc-schema', checkLabel: 'ROC Schema Validation', status: 'green', confidence: 95, issues: ['Schema matched Template A'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'roc-exec', checkLabel: 'ROC Execution', status: 'running', confidence: 0, issues: [], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'output-validation', checkLabel: 'Output Row Count', status: 'green', confidence: 99, issues: ['Input: 1,245 rows -> Output: 1,245 rows'], suggestedFixes: [], clarificationQuestions: [] },
  ],
  'campaign-classification': [
    { checkId: 'vendor-classification', checkLabel: 'Vendor Classification', status: 'green', confidence: 94, issues: ['1,173 of 1,245 vendors classified (94.2%)'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'entity-resolution', checkLabel: 'Entity Resolution', status: 'yellow', confidence: 82, issues: ['15 vendor names resolved via fuzzy match', '4 vendors unresolved -- no match in vendor DB'], suggestedFixes: ['Auto-merge 12 high-confidence matches', 'Flag 3 for manual review'], clarificationQuestions: ['Are "ABC Corp" and "ABC Corporation" the same vendor?'] },
    { checkId: 'confidence-scoring', checkLabel: 'Confidence Scoring', status: 'green', confidence: 91, issues: ['Average confidence: 91.3%', '23 vendors below 80% threshold'], suggestedFixes: ['Route low-confidence vendors to manual review'], clarificationQuestions: ['Should threshold be lowered to 75% for this batch?'] },
    { checkId: 'restricted-categories', checkLabel: 'Restricted Categories', status: 'yellow', confidence: 76, issues: ['5 vendors in potentially restricted industries', '2 vendors flagged for adult entertainment category', '1 vendor flagged for gambling'], suggestedFixes: ['Auto-exclude 3 restricted category vendors', 'Flag 2 others for manual review'], clarificationQuestions: ['Should gambling-adjacent vendors be excluded?'] },
    { checkId: 'enrichment-match', checkLabel: 'Enrichment Match Rate', status: 'green', confidence: 91, issues: ['Revenue field populated for 98% of records'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'duplicate-check', checkLabel: 'Duplicate Detection', status: 'yellow', confidence: 72, issues: ['3 potential duplicate vendor entries found'], suggestedFixes: ['Merge V-10234 and V-10235 (keep V-10234)', 'Flag for manual review'], clarificationQuestions: ['Are "ABC Corp" and "ABC Corporation" the same vendor?'] },
    { checkId: 'campaign-type', checkLabel: 'Campaign Type Assignment', status: 'green', confidence: 88, issues: ['Card: 623 vendors', 'ACH: 412 vendors', 'Premium: 138 vendors', 'Unassigned: 72 vendors'], suggestedFixes: ['Auto-assign 72 unassigned based on payment history'], clarificationQuestions: ['Default unassigned vendors to ACH or Card?'] },
  ],
  'internal-value-statement': [
    { checkId: 'booking-calc', checkLabel: 'Booking Calculator', status: 'green', confidence: 97, issues: ['Year 1 ROI: 312% | Year 3 ROI: 487%'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'arr-revenue', checkLabel: 'ARR Revenue Tab', status: 'green', confidence: 93, issues: ['All ARR metrics traced to source data'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'roi-calculation', checkLabel: 'ROI Calculation', status: 'green', confidence: 100, issues: [], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'metric-accuracy', checkLabel: 'Metric Accuracy', status: 'yellow', confidence: 68, issues: ['CFO priorities not explicitly addressed', 'Missing competitive comparison section'], suggestedFixes: ['Add CFO-specific cost reduction section', 'Generate competitive comparison table'], clarificationQuestions: ['Should we include competitor pricing comparison?'] },
  ],
  'external-roi': [
    { checkId: 'template-match', checkLabel: 'Template Selection', status: 'green', confidence: 99, issues: ['Bank of America template applied'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'data-mapping', checkLabel: 'Data Population', status: 'green', confidence: 96, issues: ['All ROI figures updated as of Jan 2026', '8 slides populated from value statement'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'chart-rendering', checkLabel: 'Chart Rendering', status: 'green', confidence: 94, issues: ['All 6 charts rendered successfully'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'brand-compliance', checkLabel: 'Brand Compliance', status: 'green', confidence: 100, issues: [], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'legal-review', checkLabel: 'Legal Review', status: 'yellow', confidence: 74, issues: ['Claim "industry-leading" needs substantiation', 'ROI guarantee language may need legal disclaimer'], suggestedFixes: ['Replace "industry-leading" with "top-tier"', 'Add standard ROI disclaimer footnote'], clarificationQuestions: [] },
  ],
  'salesforce-sync': [
    { checkId: 'sf-connection', checkLabel: 'Salesforce Connection', status: 'green', confidence: 100, issues: ['Connected to Production environment via API'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'field-mapping', checkLabel: 'Field Mapping (140+)', status: 'green', confidence: 95, issues: ['138 of 142 fields mapped', '4 custom fields need manual mapping'], suggestedFixes: ['Auto-create 4 custom fields in sandbox first'], clarificationQuestions: [] },
    { checkId: 'data-validation', checkLabel: 'Data Validation', status: 'green', confidence: 92, issues: ['Data integrity verified -- no null required fields'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'sync-status', checkLabel: 'Sync Status', status: 'green', confidence: 100, issues: ['All records synced successfully'], suggestedFixes: [], clarificationQuestions: [] },
    { checkId: 'deck-attachment', checkLabel: 'Deck Attachment', status: 'green', confidence: 100, issues: ['ROI deck attached to Opportunity record'], suggestedFixes: [], clarificationQuestions: [] },
  ],
};

// == Per-step preview tables (clean processed data) ==
export const stepPreviewTables: Record<string, PreviewTableData> = {
  'intake': {
    title: 'intake_validation_report.json',
    subtitle: 'Bank request + original vendor payment file checked',
    headers: ['Item', 'Detected Value', 'Business Meaning', 'Status', 'Next Action'],
    rows: [
      ['Bank channel', 'JPMorgan Chase', 'Bank that will take the analysis back to the corporate client', 'Ready', 'Use JPM template downstream'],
      ['Corporate payer', 'Denton County Electric Cooperative', 'Company that pays the suppliers', 'Ready', 'Use as deal/account name'],
      ['Analysis request', 'Strategic payables analysis', 'Request to analyze supplier payments for Paymode opportunity', 'Ready', 'Route to processing'],
      ['Primary attachment', 'Vendor Payments 03.2023 thru 02.2024', 'Historical supplier payment file', 'Ready', 'Use as source file'],
      ['Duplicate attachment', 'Repeated vendor payment workbook', 'Likely same source file attached twice', 'Review', 'Mark reference-only'],
      ['Payment methods', 'Check, ACH, direct deposit', 'Current ways the payer sends money to suppliers', 'Ready', 'Normalize labels'],
      ['Core fields', 'Vendor, spend, date, address, tax ID', 'Fields needed to match suppliers and calculate opportunity', 'Ready', 'Draft field mapping'],
      ['Intake decision', 'Ready with minor review', 'Can move to Step 2 after duplicate designation', 'Ready', 'Create field mapping draft'],
    ],
  },
  'processing': {
    title: 'processing_orchestration_output.xlsx',
    subtitle: '1,245 records  Alteryx mapped + ROC analyzed',
    headers: ['Record ID', 'Payer Name', 'Pay Method', 'Card Type', 'Gross Amount', 'Net Amount', 'Rebate Rate', 'Estimated Rebate', 'Status'],
    rows: [
      ['R-001', 'Office Supplies Co.', 'ACH', 'Visa', '$245,000', '$243,550', '1.85%', '$4,533', 'Complete'],
      ['R-002', 'Tech Solutions Inc.', 'Wire', 'Mastercard', '$1,890,000', '$1,871,100', '2.10%', '$39,690', 'Complete'],
      ['R-003', 'Industrial Parts LLC', 'Check', 'Visa', '$567,000', '$561,330', '1.65%', '$9,356', 'Complete'],
      ['R-004', 'Marketing Agency Pro', 'ACH', 'Amex', '$123,000', '$122,385', '2.50%', '$3,075', 'Review'],
      ['R-005', 'Logistics Partners', 'Wire', 'Visa', '$2,340,000', '$2,316,600', '1.95%', '$45,630', 'Complete'],
      ['R-006', 'Cloud Services Corp', 'ACH', 'Mastercard', '$456,000', '$451,440', '2.00%', '$9,120', 'Complete'],
      ['R-007', 'Green Energy Ltd', 'Check', 'Visa', '$789,000', '$781,110', '1.75%', '$13,808', 'Complete'],
      ['R-008', 'Data Analytics Inc', 'Wire', 'Amex', '$345,000', '$341,550', '2.30%', '$7,935', 'Review'],
    ],
  },
  'campaign-classification': {
    title: 'campaign_classification_output.xlsx',
    subtitle: '1,245 vendors classified with confidence scores',
    headers: ['Vendor', 'Industry', 'Campaign Type', 'Confidence', 'Excluded?', 'Revenue (est.)', 'Entity Match', 'Override'],
    rows: [
      ['Office Supplies Co.', 'Retail', 'Card', '96%', 'No', '$24M', 'Exact', '--'],
      ['Tech Solutions Inc.', 'Technology', 'Premium', '98%', 'No', '$480M', 'Exact', '--'],
      ['Industrial Parts LLC', 'Manufacturing', 'Card', '91%', 'No', '$89M', 'Fuzzy', '--'],
      ['Marketing Agency Pro', 'Services', 'ACH', '84%', 'No', '$12M', 'Fuzzy', 'Pending'],
      ['Logistics Partners', 'Transportation', 'Card', '95%', 'No', '$312M', 'Exact', '--'],
      ['Adult Entertain Corp', 'Entertainment', 'N/A', '99%', 'Yes', '$8M', 'Exact', 'Auto-excluded'],
      ['Green Energy Ltd', 'Energy', 'Premium', '92%', 'No', '$67M', 'Exact', '--'],
      ['Casino Gaming LLC', 'Gambling', 'N/A', '97%', 'Yes', '$45M', 'Exact', 'Auto-excluded'],
    ],
  },
  'internal-value-statement': {
    title: 'internal_value_statement.xlsx',
    subtitle: 'Booking Calculator + ARR Revenue  3-year horizon',
    headers: ['Metric', 'Current State', 'Year 1', 'Year 2', 'Year 3', 'Cumulative Impact'],
    rows: [
      ['Invoice Processing Cost', '$45/invoice', '$12/invoice', '$9/invoice', '$7/invoice', '$2,850,000'],
      ['Processing Time', '12 days', '3 days', '2.5 days', '2 days', '--'],
      ['Duplicate Payments', '$200K/yr', '$20K/yr', '$10K/yr', '$5K/yr', '$565,000'],
      ['Early Payment Discounts', '2% captured', '45% captured', '62% captured', '78% captured', '$1,450,000'],
      ['FTE Reallocation', '8 FTEs', '3 FTEs', '2.5 FTEs', '2 FTEs', '$1,800,000'],
      ['Annual Card Rebates', '$0', '$125,000', '$165,000', '$195,000', '$485,000'],
      ['ARR Booking', '--', '$254,600', '$254,600', '$254,600', '$763,800'],
      ['Total ROI', '--', '312%', '425%', '487%', '$7,150,000'],
    ],
  },
  'external-roi': {
    title: 'roi_deck_presentation.pptx',
    subtitle: 'Channel-specific ROI slides  Auto-generated from value statement',
    headers: ['Slide', 'Title', 'Content Type', 'Template', 'Data Source', 'Status'],
    rows: [
      ['1', 'Executive Summary', 'Overview', 'Bank of America', 'Value Statement', 'Complete'],
      ['2', 'Current State Analysis', 'Data + Charts', 'Standard', 'Intake Data', 'Complete'],
      ['3', 'ROI Projection', 'Financial Model', 'Standard', 'Booking Calculator', 'Complete'],
      ['4', 'Cost Savings Breakdown', 'Table', 'Standard', 'ARR Tab', 'Complete'],
      ['5', 'Implementation Timeline', 'Gantt Chart', 'Standard', 'Auto-generated', 'Complete'],
      ['6', 'Card Rebate Opportunity', 'Data + Charts', 'Channel-Specific', 'ROC Output', 'Complete'],
      ['7', 'Case Study Reference', 'Narrative', 'Standard', 'Template Library', 'In Review'],
      ['8', 'Next Steps and Contact', 'CTA', 'Channel-Specific', 'SF Opp Data', 'Complete'],
    ],
  },
  'salesforce-sync': {
    title: 'salesforce_sync_manifest.json',
    subtitle: '142 fields  API sync to SF Opportunity',
    headers: ['Field', 'Value', 'SF Object', 'SF Field', 'Sync Status', 'Notes'],
    rows: [
      ['Deal Name', 'Acme Corp - Payer Pricing', 'Opportunity', 'Name', 'Synced', 'Auto-generated'],
      ['Amount', '$254,600', 'Opportunity', 'Amount', 'Synced', 'Annual contract value'],
      ['Stage', 'Proposal', 'Opportunity', 'StageName', 'Synced', 'Auto-set from workflow'],
      ['Close Date', '2026-03-15', 'Opportunity', 'CloseDate', 'Synced', 'Estimated'],
      ['ROI Deck', 'roi_deck_v3.pptx', 'Attachment', 'File', 'Synced', 'Auto-attached'],
      ['Value Statement', 'value_statement_v2.xlsx', 'Attachment', 'File', 'Synced', 'Auto-attached'],
      ['Card Type', 'Visa', 'Custom Field', 'Card_Type__c', 'Synced', 'From processing output'],
      ['Campaign Targets', '1,245', 'Custom Field', 'Target_Count__c', 'Synced', 'Classified vendors'],
    ],
  },
};
