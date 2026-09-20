$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$outputDir = Join-Path $repoRoot 'docs\client-prework'
$workbookPath = Join-Path $outputDir 'Bottomline_POC_Salesforce_Template.xlsx'
$wordPath = Join-Path $outputDir 'Bottomline_POC_Client_Email.docx'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$extraFiles = @(
    'Bottomline_POC_Client_Email_Note.md',
    'Bottomline_POC_Client_Email_Word.rtf',
    'Bottomline_POC_Prework_Client_Email.md',
    'Bottomline_POC_Paymode_Salesforce_Template.xlsx',
    'Bottomline_POC_Prework_Data_Request.xlsx',
    '_excel_com_test.xlsx'
)
foreach ($file in $extraFiles) {
    $path = Join-Path $outputDir $file
    if (Test-Path $path) { Remove-Item $path -Force }
}
Get-ChildItem -Path $outputDir -Filter '~$*' -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
$wordLocked = $false
foreach ($path in @($workbookPath, $wordPath)) {
    if (Test-Path $path) {
        try {
            Remove-Item $path -Force
        }
        catch {
            if ($path -eq $wordPath) {
                $wordLocked = $true
                Write-Warning "Word document is open; skipping file overwrite for $wordPath"
            }
            else {
                throw
            }
        }
    }
}

function Convert-HexToExcelColor {
    param([string] $Hex)
    $clean = $Hex.TrimStart('#')
    $red = [Convert]::ToInt32($clean.Substring(0, 2), 16)
    $green = [Convert]::ToInt32($clean.Substring(2, 2), 16)
    $blue = [Convert]::ToInt32($clean.Substring(4, 2), 16)
    return $red + ($green * 256) + ($blue * 65536)
}

function Escape-XmlText {
    param([string] $Text)
    return [System.Security.SecurityElement]::Escape($Text)
}

function Add-DocParagraph {
    param(
        [System.Text.StringBuilder] $Builder,
        [string] $Text,
        [bool] $Bold = $false,
        [bool] $Heading = $false
    )
    $escaped = Escape-XmlText $Text
    $boldXml = if ($Bold -or $Heading) { '<w:b/>' } else { '' }
    $size = if ($Heading) { '28' } else { '22' }
    $color = if ($Heading) { '<w:color w:val="16345E"/>' } else { '' }
    [void]$Builder.Append('<w:p><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/>')
    [void]$Builder.Append($boldXml)
    [void]$Builder.Append($color)
    [void]$Builder.Append('<w:sz w:val="')
    [void]$Builder.Append($size)
    [void]$Builder.Append('"/></w:rPr><w:t xml:space="preserve">')
    [void]$Builder.Append($escaped)
    [void]$Builder.Append('</w:t></w:r></w:p>')
}

function New-ClientEmailDocx {
    param([string] $Path)

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $tempDir '_rels') | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $tempDir 'word') | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $tempDir 'word\_rels') | Out-Null

    $contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
'@
    $rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
'@
    $docRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
'@

    $paragraphs = @(
        @{ Text = 'Client Email Draft'; Bold = $true; Heading = $true },
        @{ Text = 'Subject: Bottomline DealOS POC - Minimal Prework Request'; Bold = $true },
        @{ Text = '' },
        @{ Text = 'Hi [Client Name],' },
        @{ Text = '' },
        @{ Text = 'For the POC, please complete the attached Salesforce template for 3 anonymized example quotes/deals. Use the same 3 quotes/deals for the samples below.' },
        @{ Text = '' },
        @{ Text = 'Please anonymize all payer, customer, vendor, and supplier names. We do not need rep names, account owner names, bank account numbers, tax IDs, credentials, or other sensitive data.' },
        @{ Text = '' },
        @{ Text = 'In addition to the Salesforce template, please send only the minimum templates, rules, and before/after samples below.' },
        @{ Text = '' },
        @{ Text = '1. Step 1 - Intake / Cleaning'; Bold = $true },
        @{ Text = '- Intake file template/schema used today.' },
        @{ Text = '- For each of the same 3 quotes/deals: raw intake file before cleaning and cleaned file after cleaning.' },
        @{ Text = '- Simple cleaning rules used to create the after file, such as required columns, column mapping, duplicate handling, formatting, address cleanup, and payment type cleanup.' },
        @{ Text = '' },
        @{ Text = '2. Step 2 - Processing'; Bold = $true },
        @{ Text = '- For each of the same 3 quotes/deals: Alteryx input sample and Alteryx output sample.' },
        @{ Text = '- For each of the same 3 quotes/deals: ROC input sample and ROC output sample.' },
        @{ Text = '' },
        @{ Text = '3. Step 3 - Campaign Classification'; Bold = $true },
        @{ Text = '- Campaign classification template/output format.' },
        @{ Text = '- For each of the same 3 quotes/deals: input before classification and output after classification.' },
        @{ Text = '- Simple rules for campaign type assignment and vendor/category exclusions.' },
        @{ Text = '' },
        @{ Text = '4. Step 4 - Internal Value Statement'; Bold = $true },
        @{ Text = '- Internal value statement / ROI calculator template.' },
        @{ Text = '- For each of the same 3 quotes/deals: input before value statement generation and output after value statement generation.' },
        @{ Text = '- Simple calculation rules or formulas not already captured in the Salesforce template.' },
        @{ Text = '' },
        @{ Text = '5. Step 5 - PowerPoint / ROI Deck'; Bold = $true },
        @{ Text = '- PowerPoint or ROI deck template.' },
        @{ Text = '- For each of the same 3 quotes/deals: source/input before deck creation and generated deck/output after deck creation.' },
        @{ Text = '- Simple slide population rules, number formatting rules, and required disclaimer/brand rules.' },
        @{ Text = '' },
        @{ Text = 'Thank you,' },
        @{ Text = '' },
        @{ Text = '[Your Name]' }
    )

    $body = New-Object System.Text.StringBuilder
    foreach ($paragraph in $paragraphs) {
        Add-DocParagraph -Builder $body -Text $paragraph.Text -Bold ([bool]$paragraph.Bold) -Heading ([bool]$paragraph.Heading)
    }

    $document = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    $body
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>
"@

    [System.IO.File]::WriteAllText((Join-Path $tempDir '[Content_Types].xml'), $contentTypes, $script:utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempDir '_rels\.rels'), $rels, $script:utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempDir 'word\document.xml'), $document, $script:utf8NoBom)
    [System.IO.File]::WriteAllText((Join-Path $tempDir 'word\_rels\document.xml.rels'), $docRels, $script:utf8NoBom)
        $archive = [System.IO.Compression.ZipFile]::Open($Path, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $zipEntries = @(
            @{ Name = '[Content_Types].xml'; File = (Join-Path $tempDir '[Content_Types].xml') },
            @{ Name = '_rels/.rels'; File = (Join-Path $tempDir '_rels\.rels') },
            @{ Name = 'word/document.xml'; File = (Join-Path $tempDir 'word\document.xml') },
            @{ Name = 'word/_rels/document.xml.rels'; File = (Join-Path $tempDir 'word\_rels\document.xml.rels') }
        )
        foreach ($zipEntry in $zipEntries) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $zipEntry.File, $zipEntry.Name) | Out-Null
        }
    }
    finally {
        $archive.Dispose()
    }
    Remove-Item $tempDir -Recurse -Force
}

if (-not $wordLocked) {
    New-ClientEmailDocx -Path $wordPath
}

$headers = @('Demo Step','Field Needed','Why Needed','Example Deal 1','Example Deal 2','Example Deal 3','Priority')
$rows = @(
    @('Deal header','Deal / Opportunity Name','Shows in demo header','Demo Deal A - Paymode Optimization','Demo Deal B - Supplier Payments','Demo Deal C - AP Payments','Critical'),
    @('Deal header','Account / Customer Name','Shows in demo header and generated materials','Customer A','Customer B','Customer C','Critical'),
    @('Step 1 - Intake','Payer / Supplier Name','Required schema field shown in Step 1','Supplier A','Supplier B','Supplier C','Critical'),
    @('Step 1 - Intake','Payment Amount','Required schema field shown in Step 1','$245,000','$567,000','$1,890,000','Critical'),
    @('Step 1 - Intake','Payment Type','Required schema field shown in Step 1','ACH','Check','Wire','Critical'),
    @('Step 1 - Intake','Transaction Count','Required schema field shown in Step 1','156','234','89','Critical'),
    @('Step 1 - Intake','Address','Required schema field shown in Step 1','100 Main St','200 Factory Rd','500 Tech Blvd','Critical'),
    @('Step 1 - Intake','City','Required schema field shown in Step 1','Boston','Chicago','San Jose','Critical'),
    @('Step 1 - Intake','State','Required schema field shown in Step 1','MA','IL','CA','Critical'),
    @('Step 1 - Intake','ZIP Code','Required schema field shown in Step 1','02101','60601','95112','Critical'),
    @('Step 1 - Intake','Effective Date','Optional schema field shown in Step 1','2026-01-15','2026-01-20','2026-02-01','Optional'),
    @('Step 1 - Intake','Account Number / Supplier ID','Optional schema field shown in Step 1','V-10001','V-10003','V-10002','Optional'),
    @('Step 2 - Processing','Card Type / Network','Used by processing and ROC configuration if tracked in Salesforce','Visa','Mastercard','Both','Optional'),
    @('Step 3 - Campaign','Account / Supplier Industry','Feeds campaign classification output','Financial Services','Manufacturing','Technology','Critical'),
    @('Step 3 - Campaign','Campaign Name / Program','Salesforce campaign or program name used to align the demo classification','Paymode Premium Campaign','Card Conversion Campaign','ACH Optimization Campaign','Critical'),
    @('Step 3 - Campaign','Campaign Type','Shown as Card / ACH / Premium / Basic target','Premium','Card','ACH','Critical'),
    @('Step 3 - Campaign','Excluded Category Flag','Used for restricted-category handling','No','No','No','Optional'),
    @('Step 4 - Value','Total AP Spend','Feeds internal value statement','$892M','$410M','$1.12B','Critical'),
    @('Step 4 - Value','Supplier / Vendor Count','Shown in value statement and classification summary','1,245','875','1,610','Critical'),
    @('Step 4 - Value','Card-Eligible Spend / Estimated Card Volume','Feeds rebate/value calculation','$145M','$72M','$185M','Critical'),
    @('Step 4 - Value','Conversion Rate Assumption','Shown in value statement assumptions','12.0%','9.5%','15.0%','Critical'),
    @('Step 4 - Value','Rebate Rate Assumption','Feeds projected rebate revenue','1.95%','1.75%','2.05%','Critical'),
    @('Step 4 - Value','Payee / Supplier Processing Fee Assumption','Optional fee assumption if the recipient/supplier fee is tracked in Salesforce','0.35% supplier-paid fee','0.25% supplier-paid fee','No supplier fee','Optional'),
    @('Step 4 - Value','Cost Savings / Net Benefit Assumption','Feeds ROI output','$475K annual net benefit','$210K annual net benefit','$690K annual net benefit','Optional'),
    @('Step 5 - Deck','Deck Template / Channel','Used to select the external ROI PowerPoint template if tracked in Salesforce','Bank of America','Generic','US Bank','Optional')
)

$colors = @{
    Navy = Convert-HexToExcelColor '#16345E'
    White = Convert-HexToExcelColor '#FFFFFF'
    Ink = Convert-HexToExcelColor '#0F172A'
    Slate = Convert-HexToExcelColor '#475569'
    HeaderBand = Convert-HexToExcelColor '#EEF2F7'
    AltBand = Convert-HexToExcelColor '#F8FAFC'
    Border = Convert-HexToExcelColor '#CBD5E1'
    CriticalBg = Convert-HexToExcelColor '#FEE2E2'
    CriticalText = Convert-HexToExcelColor '#991B1B'
    OptionalBg = Convert-HexToExcelColor '#F1F5F9'
    OptionalText = Convert-HexToExcelColor '#475569'
}

$excel = $null
$workbook = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.SheetsInNewWorkbook = 1
    $workbook = $excel.Workbooks.Add()
    $ws = $workbook.Worksheets.Item(1)
    $ws.Name = 'Salesforce Template'
    $ws.Cells.NumberFormat = '@'

    $colCount = $headers.Count
    $title = $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(1,$colCount))
    $title.Merge() | Out-Null
    $ws.Cells.Item(1,1).Value2 = 'Bottomline DealOS POC - Minimal Salesforce Template'
    $title.Interior.Color = $colors.Navy
    $title.Font.Color = $colors.White
    $title.Font.Name = 'Aptos'
    $title.Font.Bold = $true
    $title.Font.Size = 15
    $ws.Rows.Item(1).RowHeight = 32

    $subtitle = $ws.Range($ws.Cells.Item(2,1), $ws.Cells.Item(2,$colCount))
    $subtitle.Merge() | Out-Null
    $ws.Cells.Item(2,1).Value2 = 'Only the fields needed to populate the current demo. Use anonymized payer/customer/supplier names only; no rep or account owner names are needed. If a field is not in Salesforce, leave it blank and provide it in the source files/templates requested in the Word email.'
    $subtitle.Interior.Color = $colors.HeaderBand
    $subtitle.Font.Color = $colors.Slate
    $subtitle.Font.Name = 'Aptos'
    $subtitle.Font.Italic = $true
    $subtitle.WrapText = $true
    $ws.Rows.Item(2).RowHeight = 30
    $ws.Rows.Item(3).RowHeight = 8

    for ($col = 1; $col -le $colCount; $col++) { $ws.Cells.Item(4,$col).Value2 = $headers[$col - 1] }
    $headerRange = $ws.Range($ws.Cells.Item(4,1), $ws.Cells.Item(4,$colCount))
    $headerRange.Interior.Color = $colors.Navy
    $headerRange.Font.Color = $colors.White
    $headerRange.Font.Name = 'Aptos'
    $headerRange.Font.Bold = $true
    $headerRange.Borders.LineStyle = 1
    $headerRange.Borders.Color = $colors.Border
    $ws.Rows.Item(4).RowHeight = 26

    $rowNumber = 5
    $band = $false
    foreach ($row in $rows) {
        for ($col = 1; $col -le $colCount; $col++) { $ws.Cells.Item($rowNumber,$col).Value2 = [string]$row[$col - 1] }
        $range = $ws.Range($ws.Cells.Item($rowNumber,1), $ws.Cells.Item($rowNumber,$colCount))
        $range.Font.Name = 'Aptos'
        $range.Font.Size = 10
        $range.Font.Color = $colors.Ink
        $range.WrapText = $true
        $range.Borders.LineStyle = 1
        $range.Borders.Color = $colors.Border
        if ($band) { $range.Interior.Color = $colors.AltBand }
        $ws.Rows.Item($rowNumber).RowHeight = 32
        $ws.Cells.Item($rowNumber,2).Font.Bold = $true
        $priority = $ws.Cells.Item($rowNumber,7)
        $priority.Font.Bold = $true
        $priority.HorizontalAlignment = -4108
        if ($row[6] -eq 'Critical') {
            $priority.Interior.Color = $colors.CriticalBg
            $priority.Font.Color = $colors.CriticalText
        } else {
            $priority.Interior.Color = $colors.OptionalBg
            $priority.Font.Color = $colors.OptionalText
        }
        $band = -not $band
        $rowNumber++
    }

    $ws.Range($ws.Cells.Item(4,1), $ws.Cells.Item($rows.Count + 4,$colCount)).AutoFilter() | Out-Null
    $widths = @(24,30,38,24,24,24,12)
    for ($col = 1; $col -le $colCount; $col++) { $ws.Columns.Item($col).ColumnWidth = $widths[$col - 1] }
    $ws.Activate() | Out-Null
    $ws.Range('A5').Select() | Out-Null
    $excel.ActiveWindow.FreezePanes = $true

    $workbook.SaveAs($workbookPath, 51)
    $workbook.Close($false)
    $workbook = $null
}
finally {
    if ($workbook -ne $null) { try { $workbook.Close($false) } catch { } }
    if ($excel -ne $null) { try { $excel.Quit() } catch { } }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Output "Created $workbookPath"
Write-Output "Created $wordPath"
