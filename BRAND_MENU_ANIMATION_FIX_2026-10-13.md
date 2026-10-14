# Brand Menu Fix — 2026-10-13

The previous brand drawer layout could appear visually collapsed/offset because its content sizing depended on inherited grid/block rules. The active source now uses:

- a dedicated `.bh-brand-mega-body` full-width wrapper;
- a full-width scroll area;
- an auto-fill responsive grid;
- a dedicated `bhMegaDrop` animation that keeps `translateX(-50%)` during opening;
- complete brand rendering on mobile with no 60-item data truncation.

The collection image from Shopify remains the logo source of truth.
