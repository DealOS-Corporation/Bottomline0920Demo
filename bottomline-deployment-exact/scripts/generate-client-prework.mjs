import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'docs', 'client-prework');

const workbookName = 'Bottomline_POC_Prework_Data_Request.xlsx';
const emailName = 'Bottomline_POC_Prework_Client_Email.md';

const sheets = [
  {
    name: 'Read Me',
    title: 'Bottomline POC Pre-Work Data Request',
    subtitle: 'Lightweight request for 5 anonymized or mocked Salesforce deals and supporting client workbook inputs.',
    widths: [28, 110],
    headers: ['Section', 'Guidance'],
    rows: [
      ['Purpose', 'Provide enough sample data to validate the POC workflow from Salesforce intake through ROC/enrichment, value statement, pricing, and Salesforce sync.'],
      ['POC scope', 'Please provide five representative deals only. Customer names can be anonymized as Customer A, Customer B, etc. Mocked values are acceptable where production data cannot be shared.'],
      ['Minimum Salesforce extract', 'Populate the SF Deals - 5 Deal POC tab, or provide an equivalent Salesforce report/export with those fields. Opportunity, Account, channel, stage, amount, timing, product, and ROI/pricing fields are the most useful.'],
      ['Client workbook template', 'Populate the Client Deal Template tab with the client-facing summary fields. The Vendor Payments and ROI Assumptions tabs are helpful if available, but not required for a first POC pass.'],
      ['Privacy guidance', 'Do not include bank account numbers, tax IDs, login credentials, full payment instructions, personal identifiers, or other sensitive data. Use masked, aggregated, anonymized, or mocked values.'],
      ['Preferred format', 'Excel .xlsx is preferred. CSV exports are also acceptable if each file clearly maps to one tab in this workbook.'],
      ['How to use', 'Replace the example rows with client-provided values, or keep the example rows as mock POC data if approved. Mark unavailable fields as Not Available rather than leaving the row unclear.'],
      ['Deadline', 'Please return the available files before the POC preparation session so the team can validate fields, map the data, and prepare the walkthrough.'],
    ],
  },
  {
    name: 'SF Deals - 5 Deal POC',
    title: 'Salesforce Deal Extract - 5 Deal POC',
    subtitle: 'Example rows show the level of detail requested from Salesforce. Replace with anonymized client values where available.',
    widths: [14, 22, 34, 26, 20, 24, 30, 22, 16, 14, 14, 14, 18, 20, 22, 22, 24, 18, 18, 22, 24, 22, 38, 32, 14, 42],
    headers: [
      'POC Deal ID',
      'Salesforce Opportunity ID',
      'Opportunity Name',
      'Account Name (Anonymized)',
      'Client Industry',
      'Channel / Bank Partner',
      'Product / Solution',
      'Opportunity Owner',
      'Stage',
      'Probability %',
      'Close Date',
      'Created Date',
      'Last Modified Date',
      'Annual Contract Value',
      'Total Spend Analyzed',
      'Card-Eligible Spend',
      'Estimated Rebate Revenue',
      'ARR / License Fee',
      'Number of Vendors',
      'Invoice / Payment Count',
      'Current Payment Methods',
      'ERP / AP System',
      'Primary Pain Point',
      'Next Step / Sales Motion',
      'Priority',
      'Salesforce Notes',
    ],
    rows: [
      ['POC-001', '006XX00000A001A', 'Customer A - AP Automation', 'Customer A', 'Manufacturing', 'Bank of America', 'AP Automation', 'Sales Owner 1', 'Proposal', '72%', '2026-03-15', '2026-01-02', '2026-01-05', '$254,600', '$892,000,000', '$145,000,000', '$2,400,000', '$254,600', '1,245', '15,000/month', 'ACH; Check; Wire', 'Oracle ERP', 'Manual invoice intake; duplicate payment risk', 'ROI review and pricing approval', 'High', 'Example only - anonymized values are acceptable'],
      ['POC-002', '006XX00000A002A', 'Customer B - Global Cash Management Hub', 'Customer B', 'Technology', 'US Bank', 'Global Cash Management Hub', 'Sales Owner 2', 'Discovery', '55%', '2026-04-30', '2025-12-28', '2026-01-04', '$180,000', '$320,000,000', '$68,000,000', '$980,000', '$180,000', '640', '4,200/month', 'ACH; Wire', 'NetSuite', 'Manual cash position consolidation', 'Treasury workshop scheduled', 'High', 'Use nearest Salesforce fields if custom fields differ'],
      ['POC-003', '006XX00000A003A', 'Customer C - Business Payments Network', 'Customer C', 'Financial Services', 'Wells Fargo', 'Business Payments Network', 'Sales Owner 3', 'Value Review', '68%', '2026-03-31', '2025-12-18', '2026-01-05', '$310,000', '$1,100,000,000', '$210,000,000', '$3,150,000', '$310,000', '1,870', '22,500/month', 'Check; ACH; Card', 'SAP', 'Low supplier card adoption', 'Campaign classification review', 'Critical', 'Mock values are fine for restricted fields'],
      ['POC-004', '006XX00000A004A', 'Customer D - Payer Pricing', 'Customer D', 'Healthcare', 'JPMorgan Chase', 'Payer Pricing and Optimization', 'Sales Owner 4', 'Negotiation', '80%', '2026-02-28', '2025-11-20', '2026-01-06', '$420,000', '$760,000,000', '$130,000,000', '$1,850,000', '$420,000', '980', '9,800/month', 'ACH; Card', 'Workday Financials', 'Pricing approval and margin guardrails', 'Deal desk package in progress', 'High', 'Include latest stage and close date if possible'],
      ['POC-005', '006XX00000A005A', 'Customer E - AP Automation Expansion', 'Customer E', 'Retail', 'Citi', 'AP Automation Expansion', 'Sales Owner 5', 'Qualification', '40%', '2026-05-15', '2026-01-03', '2026-01-08', '$145,000', '$250,000,000', '$42,000,000', '$620,000', '$145,000', '410', '3,600/month', 'Check; ACH', 'Microsoft Dynamics 365', 'Fragmented vendor data and manual reviews', 'Data readiness call requested', 'Medium', 'Can be replaced with a net-new opportunity'],
    ],
  },
  {
    name: 'SF Field Request',
    title: 'Salesforce Field Request',
    subtitle: 'Minimum and helpful fields to request from Salesforce for the 5-deal POC.',
    widths: [22, 28, 30, 16, 28, 62, 48],
    headers: ['SF Object', 'SF Field / API Name', 'Business Label', 'POC Priority', 'Example Value', 'Purpose', 'Notes / Mapping'],
    rows: [
      ['Opportunity', 'Id', 'Opportunity ID', 'Required', '006XX00000A001A', 'Stable record identifier for mapping and sync audit.', 'Use Salesforce 15 or 18 character ID.'],
      ['Opportunity', 'Name', 'Opportunity Name', 'Required', 'Customer A - AP Automation', 'Used as the core deal name in the workspace and Salesforce sync.', 'Customer name may be anonymized.'],
      ['Opportunity', 'Account.Name', 'Account Name', 'Required', 'Customer A', 'Connects the opportunity to the customer/account.', 'Anonymized account names are preferred for POC.'],
      ['Account', 'Industry', 'Industry', 'Helpful', 'Manufacturing', 'Supports enrichment, peer comparison, and pricing context.', 'Use picklist value or free text.'],
      ['Opportunity', 'StageName', 'Sales Stage', 'Required', 'Proposal', 'Sets deal status and demo workflow position.', 'Use current Salesforce stage.'],
      ['Opportunity', 'Amount', 'Opportunity Amount', 'Required', '$254,600', 'Baseline deal value used by pricing/value statement views.', 'Annual contract value or expected booking value.'],
      ['Opportunity', 'Probability', 'Win Probability', 'Helpful', '72%', 'Supports prioritization and forecast context.', 'Percent value only is fine.'],
      ['Opportunity', 'CloseDate', 'Close Date', 'Required', '2026-03-15', 'Used for POC timing, alerts, and prioritization.', 'YYYY-MM-DD preferred.'],
      ['Opportunity', 'CreatedDate', 'Created Date', 'Helpful', '2026-01-02', 'Supports lifecycle and aging analysis.', 'YYYY-MM-DD preferred.'],
      ['Opportunity', 'LastModifiedDate', 'Last Modified Date', 'Helpful', '2026-01-05', 'Helps identify stale or active deals.', 'YYYY-MM-DD preferred.'],
      ['Opportunity', 'Owner.Name', 'Opportunity Owner', 'Helpful', 'Sales Owner 1', 'Allows the demo to show responsible seller/team.', 'Role or anonymized owner name is acceptable.'],
      ['Opportunity', 'NextStep', 'Next Step', 'Required', 'ROI review and pricing approval', 'Drives recommended workflow actions.', 'Use latest rep-entered next step.'],
      ['Opportunity', 'Description', 'Deal Notes', 'Helpful', 'Manual invoice intake; duplicate payment risk', 'Provides narrative context for agent summarization.', 'Remove confidential details.'],
      ['Opportunity', 'Channel__c', 'Channel / Bank Partner', 'Required', 'Bank of America', 'Used for channel-specific templates and ROI materials.', 'Use nearest equivalent if field name differs.'],
      ['Opportunity', 'Product_Family__c', 'Product / Solution', 'Required', 'AP Automation', 'Identifies which demo flow and artifacts should be generated.', 'Examples: AP Automation, Cash Management, Business Payments.'],
      ['Opportunity', 'Priority__c', 'Priority', 'Helpful', 'High', 'Supports dashboard sorting and POC narrative.', 'Any internal priority flag is acceptable.'],
      ['Opportunity', 'ARR__c', 'ARR / License Fee', 'Required', '$254,600', 'Feeds internal value statement and pricing output.', 'If unavailable, send Opportunity Amount.'],
      ['Opportunity', 'Total_Spend_Analyzed__c', 'Total Spend Analyzed', 'Helpful', '$892,000,000', 'Used by ROI and value statement calculations.', 'Aggregated spend is acceptable.'],
      ['Opportunity', 'Card_Eligible_Spend__c', 'Card-Eligible Spend', 'Helpful', '$145,000,000', 'Supports rebate and card conversion modeling.', 'Can be estimated or mocked.'],
      ['Opportunity', 'Target_Count__c', 'Campaign Targets / Vendor Count', 'Helpful', '1,245', 'Used by campaign classification and ROI summary.', 'Vendor count or target supplier count.'],
      ['Opportunity', 'Conversion_Rate__c', 'Expected Conversion Rate', 'Helpful', '12.0%', 'Used by pricing/value statement assumptions.', 'Historical, estimated, or mocked value.'],
      ['Opportunity', 'Rebate_Rate__c', 'Blended Rebate Rate', 'Helpful', '1.95%', 'Used to estimate rebate revenue.', 'Channel average is acceptable.'],
      ['Account', 'ERP_System__c', 'ERP / AP System', 'Helpful', 'Oracle ERP', 'Supports implementation and integration context.', 'Use nearest field or notes.'],
      ['ContentDocumentLink', 'ContentDocument.Title', 'Attached File Name', 'Optional', 'roi_deck_v3.pptx', 'Shows how generated materials are attached back to Salesforce.', 'Send filenames only, not the actual file if restricted.'],
      ['Attachment / File', 'FileType', 'File Type', 'Optional', 'PowerPoint; Excel; PDF', 'Helps validate document handling in the POC.', 'Optional for first pass.'],
    ],
  },
  {
    name: 'Client Deal Template',
    title: 'Client Deal Summary Template',
    subtitle: 'Use this tab if the client prefers to provide a simple POC workbook instead of a direct Salesforce export.',
    widths: [14, 28, 28, 20, 18, 24, 22, 22, 16, 34, 24, 42, 34, 26, 24, 42],
    headers: ['POC Deal ID', 'Anonymized Customer Name', 'Deal Scenario', 'Industry', 'Region', 'ERP / AP System', 'Annual AP Spend', 'Annual Payment Count', 'Vendor Count', 'Current Payment Mix', 'Current Manual Effort', 'Main Pain Point', 'Desired Outcome', 'Timeline', 'Data Contact Role', 'Notes'],
    rows: [
      ['POC-001', 'Customer A', 'AP Automation', 'Manufacturing', 'US', 'Oracle ERP', '$892,000,000', '180,000', '1,245', 'ACH 45%; Check 35%; Wire 20%', '8 FTE; 12 day cycle', 'Manual data entry and duplicate payment exposure', 'Reduce cycle time and increase rebate capture', 'Q2 2026', 'Finance Operations', 'Example row - replace as needed'],
      ['POC-002', 'Customer B', 'Global Cash Management', 'Technology', 'US / EU / UK', 'NetSuite', '$320,000,000', '50,400', '640', 'ACH 55%; Wire 45%', '4 hours/day treasury consolidation', 'No real-time liquidity visibility', 'Automate cash visibility and forecast reporting', 'Q2 2026', 'Treasury', 'Use aggregated values only'],
      ['POC-003', 'Customer C', 'Business Payments Network', 'Financial Services', 'US', 'SAP', '$1,100,000,000', '270,000', '1,870', 'Check 40%; ACH 45%; Card 15%', 'Manual supplier campaign review', 'Low supplier card adoption', 'Classify vendors and expand card campaign', 'Q1 2026', 'Payments Product', 'Anonymize customer and supplier names'],
      ['POC-004', 'Customer D', 'Payer Pricing', 'Healthcare', 'US', 'Workday Financials', '$760,000,000', '117,600', '980', 'ACH 60%; Card 25%; Check 15%', 'Manual pricing approvals', 'Need faster quote and margin governance', 'Generate pricing package and approval audit', 'Q1 2026', 'Revenue Operations', 'Mock values acceptable'],
      ['POC-005', 'Customer E', 'AP Automation Expansion', 'Retail', 'North America', 'Microsoft Dynamics 365', '$250,000,000', '43,200', '410', 'Check 50%; ACH 45%; Card 5%', 'Fragmented vendor cleanup', 'Incomplete vendor and payment data', 'Validate intake and missing-field workflow', 'Q2 2026', 'AP Operations', 'Optional lower-complexity sample deal'],
    ],
  },
  {
    name: 'Vendor Payments',
    title: 'Vendor Payment Detail Template',
    subtitle: 'Optional supporting detail for ROC/enrichment and ROI calculations. Provide a small representative sample only.',
    widths: [14, 16, 30, 24, 18, 16, 18, 18, 18, 18, 16, 22, 16, 16, 42],
    headers: ['POC Deal ID', 'Vendor ID', 'Vendor Name (Anonymized)', 'Vendor Category', 'Vendor Country', 'Vendor State', 'Payment Method', 'Annual Spend', 'Transaction Count', 'Avg Payment Amount', 'Payment Terms', 'Card Acceptance Known', 'ACH Eligible', 'Exclusion Flag', 'Notes'],
    rows: [
      ['POC-001', 'V-A001', 'Vendor A-001', 'Office Supplies', 'US', 'MA', 'ACH', '$245,000', '156', '$1,571', 'Net 30', 'Unknown', 'Yes', 'No', 'No bank details or tax IDs'],
      ['POC-001', 'V-A002', 'Vendor A-002', 'Technology Services', 'US', 'CA', 'Wire', '$1,890,000', '89', '$21,236', 'Net 45', 'Yes', 'Yes', 'No', 'High-spend vendor example'],
      ['POC-002', 'V-B001', 'Vendor B-001', 'Cloud Infrastructure', 'US', 'WA', 'ACH', '$456,000', '67', '$6,806', 'Net 30', 'Yes', 'Yes', 'No', 'Recurring technology spend'],
      ['POC-002', 'V-B002', 'Vendor B-002', 'Payroll Services', 'US', 'NY', 'Wire', '$980,000', '24', '$40,833', 'Net 15', 'No', 'Yes', 'No', 'Treasury visibility use case'],
      ['POC-003', 'V-C001', 'Vendor C-001', 'Logistics', 'US', 'FL', 'Wire', '$2,340,000', '312', '$7,500', 'Net 60', 'Yes', 'Yes', 'No', 'Campaign target example'],
      ['POC-003', 'V-C002', 'Vendor C-002', 'Restricted Category', 'US', 'NV', 'ACH', '$120,000', '18', '$6,667', 'Net 30', 'Unknown', 'Yes', 'Yes', 'Use for exclusion handling only'],
      ['POC-004', 'V-D001', 'Vendor D-001', 'Medical Supplies', 'US', 'IL', 'Card', '$760,000', '141', '$5,390', 'Net 30', 'Yes', 'Yes', 'No', 'Card-eligible supplier'],
      ['POC-004', 'V-D002', 'Vendor D-002', 'Professional Services', 'US', 'TX', 'ACH', '$330,000', '44', '$7,500', 'Net 45', 'Unknown', 'Yes', 'No', 'Pricing context sample'],
      ['POC-005', 'V-E001', 'Vendor E-001', 'Facilities', 'US', 'GA', 'Check', '$185,000', '96', '$1,927', 'Net 30', 'No', 'Yes', 'No', 'Check-to-electronic conversion example'],
      ['POC-005', 'V-E002', 'Vendor E-002', 'Marketing Services', 'US', 'CO', 'ACH', '$123,000', '45', '$2,733', 'Net 15', 'Yes', 'Yes', 'No', 'Smaller supplier example'],
    ],
  },
  {
    name: 'ROI Assumptions',
    title: 'ROI and Pricing Assumptions',
    subtitle: 'Helpful assumptions for value statement, booking calculator, pricing recommendation, and ROI deck generation.',
    widths: [14, 22, 22, 24, 20, 28, 28, 26, 28, 18, 18, 24, 18, 42],
    headers: ['POC Deal ID', 'Total Spend Analyzed', 'Card-Eligible Spend', 'Estimated Conversion Rate', 'Blended Rebate Rate', 'Current Processing Cost / Invoice', 'Target Processing Cost / Invoice', 'Duplicate Payment Baseline', 'Early Pay Discount Capture', 'License / ARR', 'Implementation Fee', 'Year 1 Rebate Estimate', 'Payback Period', 'Notes'],
    rows: [
      ['POC-001', '$892,000,000', '$145,000,000', '12.0%', '1.95%', '$45', '$12', '$200,000/year', '2% current; 45% target', '$254,600', '$45,000', '$2,400,000', '4.2 months', 'Matches internal value statement demo assumptions'],
      ['POC-002', '$320,000,000', '$68,000,000', '9.0%', '1.60%', '$38', '$14', '$75,000/year', '5% current; 35% target', '$180,000', '$35,000', '$980,000', '5.8 months', 'Cash visibility use case'],
      ['POC-003', '$1,100,000,000', '$210,000,000', '15.0%', '2.05%', '$42', '$11', '$250,000/year', '3% current; 50% target', '$310,000', '$60,000', '$3,150,000', '3.6 months', 'Supplier campaign classification use case'],
      ['POC-004', '$760,000,000', '$130,000,000', '11.5%', '1.85%', '$40', '$13', '$140,000/year', '4% current; 42% target', '$420,000', '$55,000', '$1,850,000', '6.1 months', 'Pricing governance use case'],
      ['POC-005', '$250,000,000', '$42,000,000', '8.0%', '1.70%', '$48', '$15', '$60,000/year', '1% current; 30% target', '$145,000', '$25,000', '$620,000', '7.0 months', 'Lower-complexity data readiness case'],
    ],
  },
  {
    name: 'File Checklist',
    title: 'POC File and Data Checklist',
    subtitle: 'Use this checklist to coordinate which files are available before the POC working session.',
    widths: [34, 18, 24, 28, 24, 64, 34],
    headers: ['Item', 'Required for POC?', 'Likely Owner', 'Preferred Format', 'Minimum Sample', 'Privacy Guidance', 'Status / Notes'],
    rows: [
      ['Salesforce Opportunity export', 'Yes', 'Sales Operations / CRM Admin', 'Excel or CSV', '5 opportunities', 'Anonymize account/customer names. Remove confidential notes if needed.', 'Requested'],
      ['Salesforce Account fields', 'Yes, if separate', 'Sales Operations / CRM Admin', 'Excel or CSV', '5 related accounts', 'Use anonymized account names and non-sensitive firmographic fields.', 'Requested'],
      ['Current client requirements workbook', 'Helpful', 'Process Owner / Business Analyst', 'Excel', 'Most recent template', 'Remove credentials, bank details, tax IDs, and sensitive customer data.', 'Requested'],
      ['Vendor/payment detail sample', 'Helpful', 'AP Operations / Treasury', 'Excel or CSV', '10-25 rows across the 5 deals', 'Use vendor aliases and aggregated payment values only.', 'Optional'],
      ['ROI or value statement assumptions', 'Helpful', 'Finance / Sales Engineering', 'Excel', '5 deal-level assumption rows', 'Estimates and mock values are acceptable.', 'Optional'],
      ['Pricing or deal desk workbook', 'Optional', 'Revenue Operations', 'Excel', 'Template or sanitized example', 'Remove internal approval comments if sensitive.', 'Optional'],
      ['Sample ROI deck or generated materials', 'Optional', 'Sales / Marketing', 'PowerPoint or PDF', 'One sanitized sample', 'Send template or filenames only if content cannot be shared.', 'Optional'],
      ['Salesforce field mapping notes', 'Optional', 'CRM Admin / Integration Owner', 'Excel or document', 'Current field/API names', 'No API keys, credentials, endpoint secrets, or access tokens.', 'Optional'],
      ['Sandbox field list or object export', 'Optional', 'CRM Admin', 'CSV', 'Opportunity and Account field list', 'Metadata only is preferred.', 'Optional'],
    ],
  },
];

const emailDraft = `# Client Email Draft

**Subject:** POC Pre-Work Request: Salesforce Deal Data and Workbook Templates

Hi [Client Name],

Ahead of our POC preparation session, could you please send any pre-work materials the teams should use, including available data templates, requirements workbooks, current process files, or Salesforce exports?

To keep this lightweight, we only need a small anonymized sample for five representative deals. Customer names can be replaced with values such as Customer A, Customer B, etc., and mocked values are completely fine where production data cannot be shared.

I have attached a pre-work workbook with the requested format. The most important tab is **SF Deals - 5 Deal POC**, which outlines the Salesforce fields that would be most helpful for the POC. If it is easier, you can send an equivalent Salesforce report/export rather than filling out the tab directly.

For the first pass, the ideal materials are:

- A Salesforce Opportunity export for five representative deals, including account, stage, amount, owner, close date, product/solution, channel, next step, and any available ROI/pricing fields.
- Any existing client Excel templates or requirements workbooks the teams currently use for intake, value statement, ROI, pricing, or deal desk review.
- If available, a small vendor/payment sample with anonymized vendor names and aggregated payment values.
- Any assumptions used today for rebate rate, conversion rate, card-eligible spend, processing cost, or expected ARR/license fee.

Please do not include bank account numbers, tax IDs, login credentials, full payment instructions, API keys, or sensitive personal data. Anonymized, aggregated, masked, or mocked data is preferred for the POC.

If any fields are unavailable, please mark them as Not Available rather than spending extra time recreating them. The goal is to give the teams enough representative data to validate the workflow and prepare the demo discussion.

Thank you,

[Your Name]
`;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index) {
  let name = '';
  let current = index;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function cellXml(rowNumber, columnIndex, value, styleIndex) {
  const ref = `${columnName(columnIndex)}${rowNumber}`;
  return `<c r="${ref}" s="${styleIndex}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function rowXml(rowNumber, values, styleIndex, height) {
  const heightXml = height ? ` ht="${height}" customHeight="1"` : '';
  const cells = values.map((value, index) => cellXml(rowNumber, index + 1, value, styleIndex)).join('');
  return `<row r="${rowNumber}"${heightXml}>${cells}</row>`;
}

function worksheetXml(sheet) {
  const columnCount = Math.max(sheet.headers.length, ...sheet.rows.map((row) => row.length));
  const lastColumn = columnName(columnCount);
  const lastRow = sheet.rows.length + 3;
  const widths = Array.from({ length: columnCount }, (_, index) => sheet.widths[index] ?? 18)
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join('');

  const rows = [
    rowXml(1, [sheet.title, ...Array(columnCount - 1).fill('')], 1, 28),
    rowXml(2, [sheet.subtitle, ...Array(columnCount - 1).fill('')], 4, 42),
    rowXml(3, sheet.headers, 2, 30),
    ...sheet.rows.map((row, index) => rowXml(index + 4, row, 5, 36)),
  ].join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A4" sqref="A4"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${widths}</cols>
  <sheetData>${rows}</sheetData>
  <mergeCells count="2">
    <mergeCell ref="A1:${lastColumn}1"/>
    <mergeCell ref="A2:${lastColumn}2"/>
  </mergeCells>
  <autoFilter ref="A3:${lastColumn}${lastRow}"/>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
}

function workbookXml(sheetList) {
  const sheetNodes = sheetList
    .map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <fileVersion appName="xl"/>
  <workbookPr defaultThemeVersion="124226"/>
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="15000"/></bookViews>
  <sheets>${sheetNodes}</sheets>
  <calcPr calcId="171027"/>
</workbook>`;
}

function workbookRelationshipsXml(sheetList) {
  const sheetRelationships = sheetList
    .map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`)
    .join('');
  const stylesId = sheetList.length + 1;
  const themeId = sheetList.length + 2;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRelationships}
  <Relationship Id="rId${stylesId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId${themeId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`;
}

function rootRelationshipsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function contentTypesXml(sheetList) {
  const sheetOverrides = sheetList
    .map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${sheetOverrides}
  <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font><sz val="11"/><color rgb="FF111827"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/><family val="2"/></font>
    <font><i/><sz val="11"/><color rgb="FF334155"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FF0F172A"/><name val="Aptos"/><family val="2"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF16345E"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2563EB"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
}

function themeXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Bottomline POC Theme">
  <a:themeElements>
    <a:clrScheme name="Bottomline">
      <a:dk1><a:srgbClr val="111827"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="16345E"/></a:dk2>
      <a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>
      <a:accent1><a:srgbClr val="2563EB"/></a:accent1>
      <a:accent2><a:srgbClr val="059669"/></a:accent2>
      <a:accent3><a:srgbClr val="D97706"/></a:accent3>
      <a:accent4><a:srgbClr val="DC2626"/></a:accent4>
      <a:accent5><a:srgbClr val="64748B"/></a:accent5>
      <a:accent6><a:srgbClr val="0F766E"/></a:accent6>
      <a:hlink><a:srgbClr val="2563EB"/></a:hlink>
      <a:folHlink><a:srgbClr val="475569"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Bottomline Fonts">
      <a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont>
      <a:minorFont><a:latin typeface="Aptos"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Bottomline Format"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>`;
}

function coreXml() {
  const timestamp = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Bottomline POC Team</dc:creator>
  <cp:lastModifiedBy>Bottomline POC Team</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:modified>
  <dc:title>Bottomline POC Pre-Work Data Request</dc:title>
  <dc:subject>Salesforce and client workbook data request for 5-deal POC</dc:subject>
</cp:coreProperties>`;
}

function appXml(sheetList) {
  const sheetNames = sheetList.map((sheet) => `<vt:lpstr>${escapeXml(sheet.name)}</vt:lpstr>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheetList.length}</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="${sheetList.length}" baseType="lpstr">${sheetNames}</vt:vector></TitlesOfParts>
  <Company>Bottomline</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>`;
}

function workbookFiles(sheetList) {
  const files = [
    { name: '[Content_Types].xml', data: contentTypesXml(sheetList) },
    { name: '_rels/.rels', data: rootRelationshipsXml() },
    { name: 'xl/workbook.xml', data: workbookXml(sheetList) },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRelationshipsXml(sheetList) },
    { name: 'xl/styles.xml', data: stylesXml() },
    { name: 'xl/theme/theme1.xml', data: themeXml() },
    { name: 'docProps/core.xml', data: coreXml() },
    { name: 'docProps/app.xml', data: appXml(sheetList) },
  ];

  sheetList.forEach((sheet, index) => {
    files.push({ name: `xl/worksheets/sheet${index + 1}.xml`, data: worksheetXml(sheet) });
  });

  return files;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosDate, dosTime } = dosDateTime();

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, 'utf8');
    const dataBuffer = Buffer.from(file.data, 'utf8');
    const checksum = crc32(dataBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, dataBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + dataBuffer.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralSize, 12);
  endRecord.writeUInt32LE(centralOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, endRecord]);
}

mkdirSync(outputDir, { recursive: true });

const workbookPath = path.join(outputDir, workbookName);
const emailPath = path.join(outputDir, emailName);

writeFileSync(workbookPath, createZip(workbookFiles(sheets)));
writeFileSync(emailPath, emailDraft, 'utf8');

console.log(`Created ${path.relative(repoRoot, workbookPath)}`);
console.log(`Created ${path.relative(repoRoot, emailPath)}`);
