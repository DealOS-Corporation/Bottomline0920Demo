# Renders the step 7 preview assets from the decks the app actually generates.
#
#   engine/steps/step7_deck.py  ->  generated.pptx  (one per bank template)
#   PowerPoint COM              ->  public/deck/<key>/slide-NN.png
#   scripts/slide_manifest.py   ->  lib/deckRender.ts
#
# BofA/Authentic Brands is deliberately absent: that deal shipped value models,
# never a slide deck, so step 7 is not applicable there.
#
# Requires PowerPoint installed. Re-run whenever a template or File 9 changes.

$ErrorActionPreference = 'Stop'

$app = Split-Path -Parent $PSScriptRoot
$pocRoot = if ($env:DEALOS_POC_DIR) { $env:DEALOS_POC_DIR } else { Join-Path (Split-Path -Parent $app) 'POC Deals' }

$decks = @(
  @{
    key      = 'jpm'
    map      = 'jpm'
    folder   = 'JPM'
    template = '10_Sales Material_JPM Paymode_ROI Slides_Denton Co Electric Coop_2026_01_16.pptx'
    source   = '9_File to Build Out Slide Deck_JPM_Internal ROI Analysis_Denton Co Electric Coop_2026_01_16.xlsx'
  },
  @{
    key      = 'illume'
    map      = 'illume'
    folder   = '53'
    template = '10_Sales MaterialFifth Third_Paymode_ROI Slides_Illume Ag_2025_11_07_1.pptx'
    source   = '9_File to build out slide deck_Fifth Third_Internal Value Statement_Illume Ag_2025_11_07.xlsx'
  }
)

$work = Join-Path $env:TEMP 'dealos_deck_render'
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Path $work | Out-Null

# 1) Generate each deck from its own bank template + File 9.
foreach ($d in $decks) {
  $poc = Join-Path $pocRoot $d.folder
  $template = Join-Path $poc $d.template
  $source = Join-Path $poc $d.source
  foreach ($p in @($template, $source)) {
    if (-not (Test-Path -LiteralPath $p)) { throw "Source file not found: $p" }
  }
  $d.deck = Join-Path $work ($d.key + '.pptx')

  Write-Host ('generating ' + $d.key + ' deck from the real template...')
  Push-Location (Join-Path $app 'engine')
  python 'steps\step7_deck.py' --template $template --source $source --out $d.deck --map $d.map | Out-Null
  if ($LASTEXITCODE -ne 0) { Pop-Location; throw ($d.key + ' deck build failed') }
  Pop-Location
}

# 2) Export every deck to PNG (preview) and PDF (exact print copy) in one session.
Write-Host 'exporting slides via PowerPoint...'
$ppSaveAsPDF = 32
$pp = New-Object -ComObject PowerPoint.Application
try {
  foreach ($d in $decks) {
    $png = Join-Path $work ($d.key + '_png')
    New-Item -ItemType Directory -Path $png -Force | Out-Null
    $pres = $pp.Presentations.Open($d.deck, $true, $false, $false)
    $pres.Export($png, 'PNG', 1600, 900)
    $d.count = $pres.Slides.Count

    $dest = Join-Path $app ('public\deck\' + $d.key)
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    $pres.SaveAs((Join-Path $dest 'deck.pdf'), $ppSaveAsPDF)
    $pres.Close()

    for ($i = 1; $i -le $d.count; $i++) {
      Copy-Item (Join-Path $png ('Slide{0}.PNG' -f $i)) (Join-Path $dest ('slide-{0:d2}.png' -f $i))
    }
    $d.png = $dest
    Write-Host ('  ' + $d.key + ': ' + $d.count + ' slides + deck.pdf')
  }
} finally {
  $pp.Quit()
  Start-Sleep -Milliseconds 500
  Get-Process POWERPNT -ErrorAction SilentlyContinue | Stop-Process -Force
}

# Drop the old flat slide-NN.png set left over from the JPM-only layout.
Get-ChildItem -LiteralPath (Join-Path $app 'public\deck') -File -Filter 'slide-*.png' -ErrorAction SilentlyContinue |
  Remove-Item -Force

Write-Host 'writing lib/deckRender.ts...'
$deckArgs = @()
foreach ($d in $decks) { $deckArgs += '--deck'; $deckArgs += ($d.key + '=' + $d.deck) }
python (Join-Path $PSScriptRoot 'slide_manifest.py') @deckArgs --out (Join-Path $app 'lib\deckRender.ts')

Write-Host 'writing lib/deckFields.ts...'
$fieldArgs = @()
foreach ($d in $decks) { $fieldArgs += '--deck'; $fieldArgs += ($d.key + '=' + $d.deck + '::' + $d.png) }
python (Join-Path $PSScriptRoot 'deck_fields.py') @fieldArgs --out (Join-Path $app 'lib\deckFields.ts')

$kb = [math]::Round(((Get-ChildItem (Join-Path $app 'public\deck') -Recurse -File | Measure-Object Length -Sum).Sum) / 1KB)
Write-Host "done: $kb KB in public/deck"
