# Step 6 + 7 workbooks — produced the way the analyst produces them: paste the
# reviewed rows into the real value statement, let Excel recalculate the whole
# model, then carry its converted tab into the real ROI analysis workbook.
#
# Excel COM is used rather than openpyxl on purpose: these workbooks carry 32,500
# formulas, charts and 24 hidden sheets, and a Python resave would drop them.
#
#   -ValueStatementTemplate  File 8 workbook (the model)
#   -RoiTemplate             File 9 workbook (the client-facing ROI analysis)
#   -ReviewedPricing         File 7 workbook (reviewed vendor rows to paste)
#   -DealConfig              deal metadata + reviewer overrides (JSON)
#   -OutDir                  where file8.xlsx / file9.xlsx are written
#
# Emits one JSON line on stdout; progress goes to stderr.

param(
  [Parameter(Mandatory = $true)][string]$ValueStatementTemplate,
  [Parameter(Mandatory = $true)][string]$RoiTemplate,
  [Parameter(Mandatory = $true)][string]$ReviewedPricing,
  [Parameter(Mandatory = $true)][string]$DealConfig,
  [Parameter(Mandatory = $true)][string]$OutDir,
  # Each bank has its own converted tab in the shared multi-bank model.
  [string]$ConvertedTab = 'JPM Data Converted (Paymode VC)',
  # ...and its own name for the tab that data lands on in the ROI workbook.
  [string]$RoiInputTab = 'Bottomline Data Converted'
)

$ErrorActionPreference = 'Stop'

# VHF row 2 holds the headers, vendor rows start at row 3.
# Columns A..AJ mirror File 7's first 36 columns position for position; AK is the
# normalized payment type (a copy of E); AL is unused; AM..CL are the model's own
# formula columns and must never be written to.
$VHF_FIRST_ROW = 3
$F7_FIRST_ROW = 2
$PASTE_COLS = 36
$VHF_NORMALIZED_TYPE_COL = 37
$VHF_PAYMENT_TYPE_COL = 5
$VHF_LAST_INPUT_COL = 38

# File 8's converted tab is pasted wholesale into File 9's input tab.
$CONVERTED_TAB = $ConvertedTab
$ROI_INPUT_TAB = $RoiInputTab
$CONVERTED_ROWS = 224
$CONVERTED_COLS = 9

# Deal metadata the analyst types onto the 'Variables Internal' tab.
$VAR_TAB = 'Variables Internal'
$VAR_CLIENT_CELL = 'C6'
$VAR_DATE_CELL = 'C7'
$VAR_PRICING_TYPES_CELL = 'C13'

# Hidden tab holding the per-deal enrollment-rate assumptions.
$BOOKING_TAB = 'Booking Calc'

# xl constants
$xlCalculationManual = -4135
$xlCalculationAutomatic = -4105
$xlSheetHidden = 0

function Log($msg) { [Console]::Error.WriteLine($msg) }

function Get-ColumnLetter([int]$n) {
  $s = ''
  while ($n -gt 0) {
    $m = ($n - 1) % 26
    $s = [char](65 + $m) + $s
    $n = [int](($n - $m) / 26)
  }
  return $s
}

if (-not (Test-Path -LiteralPath $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$deal = Get-Content -LiteralPath $DealConfig -Raw -Encoding UTF8 | ConvertFrom-Json
$file8 = Join-Path $OutDir 'file8.xlsx'
$file9 = Join-Path $OutDir 'file9.xlsx'
Copy-Item -LiteralPath $ValueStatementTemplate -Destination $file8 -Force
Copy-Item -LiteralPath $RoiTemplate -Destination $file9 -Force

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.ScreenUpdating = $false
$excel.EnableEvents = $false
$excel.AskToUpdateLinks = $false

$vendorRows = 0
try {
  # ---- File 7 -> File 8 VHF ------------------------------------------------
  Log 'opening the value statement model (File 8)'
  $wb8 = $excel.Workbooks.Open($file8, 0, $false)
  # Only settable once a workbook is open.
  $excel.Calculation = $xlCalculationManual

  Log 'reading reviewed pricing output (File 7)'
  $wb7 = $excel.Workbooks.Open($ReviewedPricing, 0, $true)
  $ws7 = $wb7.Worksheets.Item(1)
  $lastRow = $ws7.Cells.Item($ws7.Rows.Count, 1).End(-4162).Row
  $vendorRows = $lastRow - $F7_FIRST_ROW + 1
  $pasteCol = Get-ColumnLetter $PASTE_COLS
  $reviewed = $ws7.Range("A$F7_FIRST_ROW`:$pasteCol$lastRow").Value2
  $wb7.Close($false)
  Log "read $vendorRows reviewed vendor rows x $PASTE_COLS columns"

  Log 'pasting into VHF and recalculating the value statement'
  $vhf = $wb8.Worksheets.Item('VHF')
  $inputCol = Get-ColumnLetter $VHF_LAST_INPUT_COL
  $existingLast = [Math]::Max($vhf.UsedRange.Rows.Count, $VHF_FIRST_ROW)
  $vhf.Range("A$VHF_FIRST_ROW`:$inputCol$existingLast").ClearContents()

  $vhfLast = $VHF_FIRST_ROW + $vendorRows - 1
  # The ROC ID column is text; without this Excel would coerce it to a number.
  $vhf.Range("A$VHF_FIRST_ROW`:A$vhfLast").NumberFormat = '@'
  $vhf.Range("A$VHF_FIRST_ROW`:$pasteCol$vhfLast").Value2 = $reviewed

  $typeCol = Get-ColumnLetter $VHF_PAYMENT_TYPE_COL
  $normCol = Get-ColumnLetter $VHF_NORMALIZED_TYPE_COL
  $rawTypes = $vhf.Range("$typeCol$VHF_FIRST_ROW`:$typeCol$vhfLast").Value2

  # Most banks already send the model's own vocabulary, so the normalized column
  # is a straight copy. Banks that send their own codes (BofA sends SWIFT / INT /
  # PAID_MAN / D_WIRE) carry a map in their deal config; without it those vendors
  # match no column in the model and silently drop out of every total.
  $typeMap = @{}
  if ($deal.PSObject.Properties.Name -contains 'paymentTypeMap' -and $deal.paymentTypeMap) {
    foreach ($p in $deal.paymentTypeMap.PSObject.Properties) {
      $typeMap[$p.Name] = [string]$p.Value
    }
  }
  if ($typeMap.Count -gt 0) {
    $mapped = 0
    for ($i = 1; $i -le $vendorRows; $i++) {
      $raw = [string]$rawTypes[$i, 1]
      if ($typeMap.ContainsKey($raw)) {
        $rawTypes[$i, 1] = $typeMap[$raw]
        $mapped++
      }
    }
    Log "normalized $mapped of $vendorRows payment types through the deal's map"
  }

  $vhf.Range("$normCol$VHF_FIRST_ROW`:$normCol$vhfLast").Value2 = $rawTypes

  foreach ($o in $deal.vhfOverrides) {
    $vhf.Range($o.cell).Value2 = $o.value
    Log "override VHF!$($o.cell) ($($o.field)) -> '$($o.value)'"
  }

  $vars = $wb8.Worksheets.Item($VAR_TAB)
  $vars.Range($VAR_CLIENT_CELL).Value2 = $deal.client
  $vars.Range($VAR_DATE_CELL).Value2 = ([datetime]$deal.analysisDate).ToOADate()
  $vars.Range($VAR_PRICING_TYPES_CELL).Value2 = $deal.pricingTypes

  $booking = $wb8.Worksheets.Item($BOOKING_TAB)
  foreach ($a in $deal.bookingAssumptions) {
    $booking.Range($a.cell).Value2 = [double]$a.value
  }
  Log "applied $(@($deal.bookingAssumptions).Count) booking assumptions"

  $excel.Calculation = $xlCalculationAutomatic
  $excel.CalculateFullRebuild()

  # The released copy hides the Salesforce staging tab.
  $wb8.Worksheets.Item('Pricing Details for SF').Visible = $xlSheetHidden
  $wb8.Worksheets.Item('VHF').Activate()
  $wb8.Save()

  # ---- File 8 converted tab -> File 9 input tab -----------------------------
  Log 'carrying the converted tab into the ROI analysis workbook'
  $convertedCol = Get-ColumnLetter $CONVERTED_COLS
  $converted = $wb8.Worksheets.Item($CONVERTED_TAB).Range("A1:$convertedCol$CONVERTED_ROWS").Value2
  $wb8.Close($false)

  $wb9 = $excel.Workbooks.Open($file9, 0, $false)
  $wb9.Worksheets.Item($ROI_INPUT_TAB).Range("A1:$convertedCol$CONVERTED_ROWS").Value2 = $converted
  $excel.CalculateFullRebuild()
  $wb9.Worksheets.Item($ROI_INPUT_TAB).Activate()
  $wb9.Save()
  $wb9.Close($false)
} finally {
  $excel.Quit()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

$result = [ordered]@{
  status      = 'ok'
  file8       = $file8
  file9       = $file9
  vendorRows  = $vendorRows
  overrides   = @($deal.vhfOverrides).Count
  cellsPasted = ($vendorRows * ($PASTE_COLS + 1)) + ($CONVERTED_ROWS * $CONVERTED_COLS)
}
Write-Output ($result | ConvertTo-Json -Compress)
