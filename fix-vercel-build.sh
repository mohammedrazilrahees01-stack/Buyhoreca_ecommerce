#!/usr/bin/env bash
set -e
python3 - <<'PY'
from pathlib import Path
p=Path("app/[[...slug]]/Storefront.tsx")
s=p.read_text()
old='<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(categorySchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(categoryBreadcrumb)}}/>'
if old in s:
    p.write_text(s.replace(old,''), newline='')
elif "categorySchema" in s or "categoryBreadcrumb" in s:
    raise SystemExit("Schema references exist but do not match expected code.")
p=Path("app/manifest.ts")
s=p.read_text()
if 'purpose: "any maskable"' in s:
    p.write_text(s.replace('purpose: "any maskable"','purpose: "maskable"'), newline='')
PY
npm run build
