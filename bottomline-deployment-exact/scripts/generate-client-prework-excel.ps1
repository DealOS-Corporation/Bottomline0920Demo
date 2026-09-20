$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $repoRoot 'docs\client-prework'
$workbookPath = Join-Path $outputDir 'Bottomline_POC_Prework_Data_Request.xlsx'
$emailPath = Join-Path $outputDir 'Bottomline_POC_Prework_Client_Email.md'

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$emailDraft = @'
# Client Email Draft

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
'@

Set-Content -Path $emailPath -Value $emailDraft -Encoding UTF8

$sheets = @(
  @{
    Name = 'Read Me'
    Widths = @(30, 110)
    Rows = @(
      [object[]]@('Bottomline POC Pre-Work Data Request', '')
      [object[]]@('Lightweight request for 5 anonymized or mocked Salesforce deals and supporting client workbook inputs.', '')
      [object[]]@('Section', 'Guidance')
      [object[]]@('Purpose', 'Provide enough sample data to validate the POC workflow from Salesforce intake through ROC/enrichment, value statement, pricing, and Salesforce sync.')
      [object[]]@('POC scope', 'Please provide five representative deals only. Customer names can be anonymized as Customer A, Customer B, etc. Mocked values are acceptable where production data cannot be shared.')
      [object[]]@('Minimum Salesforce extract', 'Populate the SF Deals - 5 Deal POC tab, or provide an equivalent Salesforce report/export with those fields. Opportunity, Account, channel, stage, amount, timing, product, and ROI/pricing fields are the most useful.')
      [object[]]@('Client workbook template', 'Populate the Client Deal Template tab with the client-facing summary fields. The Vendor Payments and ROI Assumptions tabs are helpful if available, but not required for a first POC pass.')
      [object[]]@('Privacy guidance', 'Do not include bank account numbers, tax IDs, login credentials, full payment instructions, personal identifiers, or other sensitive data. Use masked, aggregated, anonymized, or mocked values.')
      [object[]]@('Preferred format', 'Excel .xlsx is preferred. CSV exports are also acceptable if each file clearly maps to one tab in this workbook.')
      [object[]]@('How to use', 'Replace the example rows with client-provided values, or keep the example rows as mock POC data if approved. Mark unavailable fields as Not Available rather than leaving the row unclear.')
    )
  }
  @{
    Name = 'SF Deals - 5 Deal POC'
    Widths = @(14, 22, 34, 26, 20, 24, 30, 22, 16, 14, 14, 14, 18, 20, 22, 22, 24, 18, 18, 22, 24, 22, 38, 32, 14, 42)
    Rows = @(
      [object[]]@('Salesforce Deal Extract - 5 Deal POC', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('Example rows show the level of detail requested from Salesforce. Replace with anonymized client values where available.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('POC Deal ID', 'Salesforce Opportunity ID', 'Opportunity Name', 'Account Name (Anonymized)', 'Client Industry', 'Channel / Bank Partner', 'Product / Solution', 'Opportunity Owner', 'Stage', 'Probability %', 'Close Date', 'Created Date', 'Last Modified Date', 'Annual Contract Value', 'Total Spend Analyzed', 'Card-Eligible Spend', 'Estimated Rebate Revenue', 'ARR / License Fee', 'Number of Vendors', 'Invoice / Payment Count', 'Current Payment Methods', 'ERP / AP System', 'Primary Pain Point', 'Next Step / Sales Motion', 'Priority', 'Salesforce Notes')
      [object[]]@('POC-001', '006XX00000A001A', 'Customer A - AP Automation', 'Customer A', 'Manufacturing', 'Bank of America', 'AP Automation', 'Sales Owner 1', 'Proposal', '72%', '2026-03-15', '2026-01-02', '2026-01-05', '$254,600', '$892,000,000', '$145,000,000', '$2,400,000', '$254,600', '1,245', '15,000/month', 'ACH; Check; Wire', 'Oracle ERP', 'Manual invoice intake; duplicate payment risk', 'ROI review and pricing approval', 'High', 'Example only - anonymized values are acceptable')
      [object[]]@('POC-002', '006XX00000A002A', 'Customer B - Global Cash Management Hub', 'Customer B', 'Technology', 'US Bank', 'Global Cash Management Hub', 'Sales Owner 2', 'Discovery', '55%', '2026-04-30', '2025-12-28', '2026-01-04', '$180,000', '$320,000,000', '$68,000,000', '$980,000', '$180,000', '640', '4,200/month', 'ACH; Wire', 'NetSuite', 'Manual cash position consolidation', 'Treasury workshop scheduled', 'High', 'Use nearest Salesforce fields if custom fields differ')
      [object[]]@('POC-003', '006XX00000A003A', 'Customer C - Business Payments Network', 'Customer C', 'Financial Services', 'Wells Fargo', 'Business Payments Network', 'Sales Owner 3', 'Value Review', '68%', '2026-03-31', '2025-12-18', '2026-01-05', '$310,000', '$1,100,000,000', '$210,000,000', '$3,150,000', '$310,000', '1,870', '22,500/month', 'Check; ACH; Card', 'SAP', 'Low supplier card adoption', 'Campaign classification review', 'Critical', 'Mock values are fine for restricted fields')
      [object[]]@('POC-004', '006XX00000A004A', 'Customer D - Payer Pricing', 'Customer D', 'Healthcare', 'JPMorgan Chase', 'Payer Pricing and Optimization', 'Sales Owner 4', 'Negotiation', '80%', '2026-02-28', '2025-11-20', '2026-01-06', '$420,000', '$760,000,000', '$130,000,000', '$1,850,000', '$420,000', '980', '9,800/month', 'ACH; Card', 'Workday Financials', 'Pricing approval and margin guardrails', 'Deal desk package in progress', 'High', 'Include latest stage and close date if possible')
      [object[]]@('POC-005', '006XX00000A005A', 'Customer E - AP Automation Expansion', 'Customer E', 'Retail', 'Citi', 'AP Automation Expansion', 'Sales Owner 5', 'Qualification', '40%', '2026-05-15', '2026-01-03', '2026-01-08', '$145,000', '$250,000,000', '$42,000,000', '$620,000', '$145,000', '410', '3,600/month', 'Check; ACH', 'Microsoft Dynamics 365', 'Fragmented vendor data and manual reviews', 'Data readiness call requested', 'Medium', 'Can be replaced with a net-new opportunity')
    )
  }
  @{
    Name = 'SF Field Request'
    Widths = @(22, 28, 30, 16, 28, 62, 48)
    Rows = @(
      [object[]]@('Salesforce Field Request', '', '', '', '', '', '')
      [object[]]@('Minimum and helpful fields to request from Salesforce for the 5-deal POC.', '', '', '', '', '', '')
      [object[]]@('SF Object', 'SF Field / API Name', 'Business Label', 'POC Priority', 'Example Value', 'Purpose', 'Notes / Mapping')
      [object[]]@('Opportunity', 'Id', 'Opportunity ID', 'Required', '006XX00000A001A', 'Stable record identifier for mapping and sync audit.', 'Use Salesforce 15 or 18 character ID.')
      [object[]]@('Opportunity', 'Name', 'Opportunity Name', 'Required', 'Customer A - AP Automation', 'Used as the core deal name in the workspace and Salesforce sync.', 'Customer name may be anonymized.')
      [object[]]@('Opportunity', 'Account.Name', 'Account Name', 'Required', 'Customer A', 'Connects the opportunity to the customer/account.', 'Anonymized account names are preferred for POC.')
      [object[]]@('Account', 'Industry', 'Industry', 'Helpful', 'Manufacturing', 'Supports enrichment, peer comparison, and pricing context.', 'Use picklist value or free text.')
      [object[]]@('Opportunity', 'StageName', 'Sales Stage', 'Required', 'Proposal', 'Sets deal status and demo workflow position.', 'Use current Salesforce stage.')
      [object[]]@('Opportunity', 'Amount', 'Opportunity Amount', 'Required', '$254,600', 'Baseline deal value used by pricing/value statement views.', 'Annual contract value or expected booking value.')
      [object[]]@('Opportunity', 'Probability', 'Win Probability', 'Helpful', '72%', 'Supports prioritization and forecast context.', 'Percent value only is fine.')
      [object[]]@('Opportunity', 'CloseDate', 'Close Date', 'Required', '2026-03-15', 'Used for POC timing, alerts, and prioritization.', 'YYYY-MM-DD preferred.')
      [object[]]@('Opportunity', 'Owner.Name', 'Opportunity Owner', 'Helpful', 'Sales Owner 1', 'Allows the demo to show responsible seller/team.', 'Role or anonymized owner name is acceptable.')
      [object[]]@('Opportunity', 'NextStep', 'Next Step', 'Required', 'ROI review and pricing approval', 'Drives recommended workflow actions.', 'Use latest rep-entered next step.')
      [object[]]@('Opportunity', 'Channel__c', 'Channel / Bank Partner', 'Required', 'Bank of America', 'Used for channel-specific templates and ROI materials.', 'Use nearest equivalent if field name differs.')
      [object[]]@('Opportunity', 'Product_Family__c', 'Product / Solution', 'Required', 'AP Automation', 'Identifies which demo flow and artifacts should be generated.', 'Examples: AP Automation, Cash Management, Business Payments.')
      [object[]]@('Opportunity', 'ARR__c', 'ARR / License Fee', 'Required', '$254,600', 'Feeds internal value statement and pricing output.', 'If unavailable, send Opportunity Amount.')
      [object[]]@('Opportunity', 'Total_Spend_Analyzed__c', 'Total Spend Analyzed', 'Helpful', '$892,000,000', 'Used by ROI and value statement calculations.', 'Aggregated spend is acceptable.')
      [object[]]@('Opportunity', 'Card_Eligible_Spend__c', 'Card-Eligible Spend', 'Helpful', '$145,000,000', 'Supports rebate and card conversion modeling.', 'Can be estimated or mocked.')
      [object[]]@('Opportunity', 'Target_Count__c', 'Campaign Targets / Vendor Count', 'Helpful', '1,245', 'Used by campaign classification and ROI summary.', 'Vendor count or target supplier count.')
      [object[]]@('Opportunity', 'Conversion_Rate__c', 'Expected Conversion Rate', 'Helpful', '12.0%', 'Used by pricing/value statement assumptions.', 'Historical, estimated, or mocked value.')
      [object[]]@('Opportunity', 'Rebate_Rate__c', 'Blended Rebate Rate', 'Helpful', '1.95%', 'Used to estimate rebate revenue.', 'Channel average is acceptable.')
      [object[]]@('Account', 'ERP_System__c', 'ERP / AP System', 'Helpful', 'Oracle ERP', 'Supports implementation and integration context.', 'Use nearest field or notes.')
      [object[]]@('ContentDocumentLink', 'ContentDocument.Title', 'Attached File Name', 'Optional', 'roi_deck_v3.pptx', 'Shows how generated materials are attached back to Salesforce.', 'Send filenames only, not the actual file if restricted.')
    )
  }
  @{
    Name = 'Client Deal Template'
    Widths = @(14, 28, 28, 20, 18, 24, 22, 22, 16, 34, 24, 42, 34, 26, 24, 42)
    Rows = @(
      [object[]]@('Client Deal Summary Template', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('Use this tab if the client prefers to provide a simple POC workbook instead of a direct Salesforce export.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('POC Deal ID', 'Anonymized Customer Name', 'Deal Scenario', 'Industry', 'Region', 'ERP / AP System', 'Annual AP Spend', 'Annual Payment Count', 'Vendor Count', 'Current Payment Mix', 'Current Manual Effort', 'Main Pain Point', 'Desired Outcome', 'Timeline', 'Data Contact Role', 'Notes')
      [object[]]@('POC-001', 'Customer A', 'AP Automation', 'Manufacturing', 'US', 'Oracle ERP', '$892,000,000', '180,000', '1,245', 'ACH 45%; Check 35%; Wire 20%', '8 FTE; 12 day cycle', 'Manual data entry and duplicate payment exposure', 'Reduce cycle time and increase rebate capture', 'Q2 2026', 'Finance Operations', 'Example row - replace as needed')
      [object[]]@('POC-002', 'Customer B', 'Global Cash Management', 'Technology', 'US / EU / UK', 'NetSuite', '$320,000,000', '50,400', '640', 'ACH 55%; Wire 45%', '4 hours/day treasury consolidation', 'No real-time liquidity visibility', 'Automate cash visibility and forecast reporting', 'Q2 2026', 'Treasury', 'Use aggregated values only')
      [object[]]@('POC-003', 'Customer C', 'Business Payments Network', 'Financial Services', 'US', 'SAP', '$1,100,000,000', '270,000', '1,870', 'Check 40%; ACH 45%; Card 15%', 'Manual supplier campaign review', 'Low supplier card adoption', 'Classify vendors and expand card campaign', 'Q1 2026', 'Payments Product', 'Anonymize customer and supplier names')
      [object[]]@('POC-004', 'Customer D', 'Payer Pricing', 'Healthcare', 'US', 'Workday Financials', '$760,000,000', '117,600', '980', 'ACH 60%; Card 25%; Check 15%', 'Manual pricing approvals', 'Need faster quote and margin governance', 'Generate pricing package and approval audit', 'Q1 2026', 'Revenue Operations', 'Mock values acceptable')
      [object[]]@('POC-005', 'Customer E', 'AP Automation Expansion', 'Retail', 'North America', 'Microsoft Dynamics 365', '$250,000,000', '43,200', '410', 'Check 50%; ACH 45%; Card 5%', 'Fragmented vendor cleanup', 'Incomplete vendor and payment data', 'Validate intake and missing-field workflow', 'Q2 2026', 'AP Operations', 'Optional lower-complexity sample deal')
    )
  }
  @{
    Name = 'Vendor Payments'
    Widths = @(14, 16, 30, 24, 18, 16, 18, 18, 18, 18, 16, 22, 16, 16, 42)
    Rows = @(
      [object[]]@('Vendor Payment Detail Template', '', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('Optional supporting detail for ROC/enrichment and ROI calculations. Provide a small representative sample only.', '', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('POC Deal ID', 'Vendor ID', 'Vendor Name (Anonymized)', 'Vendor Category', 'Vendor Country', 'Vendor State', 'Payment Method', 'Annual Spend', 'Transaction Count', 'Avg Payment Amount', 'Payment Terms', 'Card Acceptance Known', 'ACH Eligible', 'Exclusion Flag', 'Notes')
      [object[]]@('POC-001', 'V-A001', 'Vendor A-001', 'Office Supplies', 'US', 'MA', 'ACH', '$245,000', '156', '$1,571', 'Net 30', 'Unknown', 'Yes', 'No', 'No bank details or tax IDs')
      [object[]]@('POC-001', 'V-A002', 'Vendor A-002', 'Technology Services', 'US', 'CA', 'Wire', '$1,890,000', '89', '$21,236', 'Net 45', 'Yes', 'Yes', 'No', 'High-spend vendor example')
      [object[]]@('POC-002', 'V-B001', 'Vendor B-001', 'Cloud Infrastructure', 'US', 'WA', 'ACH', '$456,000', '67', '$6,806', 'Net 30', 'Yes', 'Yes', 'No', 'Recurring technology spend')
      [object[]]@('POC-002', 'V-B002', 'Vendor B-002', 'Payroll Services', 'US', 'NY', 'Wire', '$980,000', '24', '$40,833', 'Net 15', 'No', 'Yes', 'No', 'Treasury visibility use case')
      [object[]]@('POC-003', 'V-C001', 'Vendor C-001', 'Logistics', 'US', 'FL', 'Wire', '$2,340,000', '312', '$7,500', 'Net 60', 'Yes', 'Yes', 'No', 'Campaign target example')
      [object[]]@('POC-003', 'V-C002', 'Vendor C-002', 'Restricted Category', 'US', 'NV', 'ACH', '$120,000', '18', '$6,667', 'Net 30', 'Unknown', 'Yes', 'Yes', 'Use for exclusion handling only')
      [object[]]@('POC-004', 'V-D001', 'Vendor D-001', 'Medical Supplies', 'US', 'IL', 'Card', '$760,000', '141', '$5,390', 'Net 30', 'Yes', 'Yes', 'No', 'Card-eligible supplier')
      [object[]]@('POC-005', 'V-E001', 'Vendor E-001', 'Facilities', 'US', 'GA', 'Check', '$185,000', '96', '$1,927', 'Net 30', 'No', 'Yes', 'No', 'Check-to-electronic conversion example')
    )
  }
  @{
    Name = 'ROI Assumptions'
    Widths = @(14, 22, 22, 24, 20, 28, 28, 26, 28, 18, 18, 24, 18, 42)
    Rows = @(
      [object[]]@('ROI and Pricing Assumptions', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('Helpful assumptions for value statement, booking calculator, pricing recommendation, and ROI deck generation.', '', '', '', '', '', '', '', '', '', '', '', '', '')
      [object[]]@('POC Deal ID', 'Total Spend Analyzed', 'Card-Eligible Spend', 'Estimated Conversion Rate', 'Blended Rebate Rate', 'Current Processing Cost / Invoice', 'Target Processing Cost / Invoice', 'Duplicate Payment Baseline', 'Early Pay Discount Capture', 'License / ARR', 'Implementation Fee', 'Year 1 Rebate Estimate', 'Payback Period', 'Notes')
      [object[]]@('POC-001', '$892,000,000', '$145,000,000', '12.0%', '1.95%', '$45', '$12', '$200,000/year', '2% current; 45% target', '$254,600', '$45,000', '$2,400,000', '4.2 months', 'Matches internal value statement demo assumptions')
      [object[]]@('POC-002', '$320,000,000', '$68,000,000', '9.0%', '1.60%', '$38', '$14', '$75,000/year', '5% current; 35% target', '$180,000', '$35,000', '$980,000', '5.8 months', 'Cash visibility use case')
      [object[]]@('POC-003', '$1,100,000,000', '$210,000,000', '15.0%', '2.05%', '$42', '$11', '$250,000/year', '3% current; 50% target', '$310,000', '$60,000', '$3,150,000', '3.6 months', 'Supplier campaign classification use case')
      [object[]]@('POC-004', '$760,000,000', '$130,000,000', '11.5%', '1.85%', '$40', '$13', '$140,000/year', '4% current; 42% target', '$420,000', '$55,000', '$1,850,000', '6.1 months', 'Pricing governance use case')
      [object[]]@('POC-005', '$250,000,000', '$42,000,000', '8.0%', '1.70%', '$48', '$15', '$60,000/year', '1% current; 30% target', '$145,000', '$25,000', '$620,000', '7.0 months', 'Lower-complexity data readiness case')
    )
  }
  @{
    Name = 'File Checklist'
    Widths = @(34, 18, 24, 28, 24, 64, 34)
    Rows = @(
      [object[]]@('POC File and Data Checklist', '', '', '', '', '', '')
      [object[]]@('Use this checklist to coordinate which files are available before the POC working session.', '', '', '', '', '', '')
      [object[]]@('Item', 'Required for POC?', 'Likely Owner', 'Preferred Format', 'Minimum Sample', 'Privacy Guidance', 'Status / Notes')
      [object[]]@('Salesforce Opportunity export', 'Yes', 'Sales Operations / CRM Admin', 'Excel or CSV', '5 opportunities', 'Anonymize account/customer names. Remove confidential notes if needed.', 'Requested')
      [object[]]@('Salesforce Account fields', 'Yes, if separate', 'Sales Operations / CRM Admin', 'Excel or CSV', '5 related accounts', 'Use anonymized account names and non-sensitive firmographic fields.', 'Requested')
      [object[]]@('Current client requirements workbook', 'Helpful', 'Process Owner / Business Analyst', 'Excel', 'Most recent template', 'Remove credentials, bank details, tax IDs, and sensitive customer data.', 'Requested')
      [object[]]@('Vendor/payment detail sample', 'Helpful', 'AP Operations / Treasury', 'Excel or CSV', '10-25 rows across the 5 deals', 'Use vendor aliases and aggregated payment values only.', 'Optional')
      [object[]]@('ROI or value statement assumptions', 'Helpful', 'Finance / Sales Engineering', 'Excel', '5 deal-level assumption rows', 'Estimates and mock values are acceptable.', 'Optional')
      [object[]]@('Pricing or deal desk workbook', 'Optional', 'Revenue Operations', 'Excel', 'Template or sanitized example', 'Remove internal approval comments if sensitive.', 'Optional')
      [object[]]@('Salesforce field mapping notes', 'Optional', 'CRM Admin / Integration Owner', 'Excel or document', 'Current field/API names', 'No API keys, credentials, endpoint secrets, or access tokens.', 'Optional')
    )
  }
)

if (Test-Path $workbookPath) {
  Remove-Item $workbookPath -Force
}

$excel = $null
$workbook = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $workbook = $excel.Workbooks.Add()

  while ($workbook.Worksheets.Count -lt $sheets.Count) {
    $after = $workbook.Worksheets.Item($workbook.Worksheets.Count)
    $workbook.Worksheets.Add([Type]::Missing, $after) | Out-Null
  }

  while ($workbook.Worksheets.Count -gt $sheets.Count) {
    $workbook.Worksheets.Item($workbook.Worksheets.Count).Delete()
  }

  for ($sheetIndex = 0; $sheetIndex -lt $sheets.Count; $sheetIndex++) {
    $sheet = $sheets[$sheetIndex]
    $worksheet = $workbook.Worksheets.Item($sheetIndex + 1)
    $worksheet.Name = $sheet.Name
    $rows = $sheet.Rows
    $rowCount = $rows.Count
    $colCount = ($rows | ForEach-Object { $_.Count } | Measure-Object -Maximum).Maximum
    $values = New-Object 'object[,]' $rowCount, $colCount

    for ($rowIndex = 0; $rowIndex -lt $rowCount; $rowIndex++) {
      for ($colIndex = 0; $colIndex -lt $colCount; $colIndex++) {
        $values[$rowIndex, $colIndex] = if ($colIndex -lt $rows[$rowIndex].Count) { $rows[$rowIndex][$colIndex] } else { '' }
      }
    }

    $usedRange = $worksheet.Range($worksheet.Cells.Item(1, 1), $worksheet.Cells.Item($rowCount, $colCount))
    $usedRange.Value2 = $values
    $usedRange.WrapText = $true
    $usedRange.VerticalAlignment = -4160
    $usedRange.Borders.LineStyle = 1
    $usedRange.Borders.Color = 14277081

    $titleRange = $worksheet.Range($worksheet.Cells.Item(1, 1), $worksheet.Cells.Item(1, $colCount))
    $titleRange.Merge() | Out-Null
    $titleRange.Interior.Color = 6173726
    $titleRange.Font.Color = 16777215
    $titleRange.Font.Bold = $true
    $titleRange.Font.Size = 16
    $titleRange.RowHeight = 28

    $subtitleRange = $worksheet.Range($worksheet.Cells.Item(2, 1), $worksheet.Cells.Item(2, $colCount))
    $subtitleRange.Merge() | Out-Null
    $subtitleRange.Interior.Color = 16773360
    $subtitleRange.Font.Color = 7829367
    $subtitleRange.RowHeight = 42

    $headerRange = $worksheet.Range($worksheet.Cells.Item(3, 1), $worksheet.Cells.Item(3, $colCount))
    $headerRange.Interior.Color = 15435844
    $headerRange.Font.Color = 16777215
    $headerRange.Font.Bold = $true
    $headerRange.HorizontalAlignment = -4108
    $headerRange.RowHeight = 32

    for ($colIndex = 1; $colIndex -le $colCount; $colIndex++) {
      if ($colIndex -le $sheet.Widths.Count) {
        $worksheet.Columns.Item($colIndex).ColumnWidth = $sheet.Widths[$colIndex - 1]
      }
    }

    if ($rowCount -gt 3) {
      $worksheet.Range($worksheet.Cells.Item(3, 1), $worksheet.Cells.Item($rowCount, $colCount)).AutoFilter() | Out-Null
    }

    $worksheet.Activate() | Out-Null
    $excel.ActiveWindow.SplitRow = 3
    $excel.ActiveWindow.FreezePanes = $true
  }

  $workbook.Worksheets.Item(1).Activate() | Out-Null
  $workbook.SaveAs($workbookPath, 51)
  $workbook.Close($false)
  Write-Output "Created $workbookPath"
  Write-Output "Created $emailPath"
}
finally {
  if ($workbook -ne $null) {
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null } catch {}
  }
  if ($excel -ne $null) {
    try { $excel.Quit() } catch {}
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null } catch {}
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}