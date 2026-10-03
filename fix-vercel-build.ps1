$ErrorActionPreference = "Stop"
$storefront = Join-Path $PWD "app\[[...slug]]\Storefront.tsx"
$manifest = Join-Path $PWD "app\manifest.ts"
if (!(Test-Path -LiteralPath $storefront)) { throw "Storefront.tsx not found. Run from the BuyHoreca repository root." }
if (!(Test-Path -LiteralPath $manifest)) { throw "app/manifest.ts not found. Run from the BuyHoreca repository root." }

$s = Get-Content -Raw -LiteralPath $storefront
$old = '<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(categorySchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(categoryBreadcrumb)}}/>'
if ($s.Contains($old)) {
  Set-Content -LiteralPath $storefront -Value $s.Replace($old, '') -NoNewline
  Write-Host "Fixed Storefront.tsx" -ForegroundColor Green
} elseif ($s -match 'categorySchema|categoryBreadcrumb') {
  throw "Schema references exist but do not match the expected current code. No change made."
} else {
  Write-Host "Storefront.tsx already fixed." -ForegroundColor Green
}

$m = Get-Content -Raw -LiteralPath $manifest
if ($m.Contains('purpose: "any maskable"')) {
  Set-Content -LiteralPath $manifest -Value $m.Replace('purpose: "any maskable"', 'purpose: "maskable"') -NoNewline
  Write-Host "Fixed manifest.ts" -ForegroundColor Green
}

if ((Get-Content -Raw -LiteralPath $storefront) -match 'categorySchema|categoryBreadcrumb') {
  throw "Undefined category schema references remain."
}

npm run build
if ($LASTEXITCODE -ne 0) { throw "Production build failed." }
Write-Host "SUCCESS: BuyHoreca production build passed." -ForegroundColor Green
