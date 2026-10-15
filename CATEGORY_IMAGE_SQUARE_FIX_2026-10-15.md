# Featured Category Image Fill Fix — 15 October 2026

## Change
The Featured Categories rail previously used circular image masks and a `scale(1.45)` zoom, which could leave each landscape collection image appearing as a thin horizontal strip across a gray circle.

It now uses a responsive square (1:1) frame with softly rounded 12px corners, no border, and no background showing through. The Shopify collection image fills the complete square, clipped to the rounded corners, via `width: 100%`, `height: 100%`, and `object-fit: cover`. Image proportions and crop may vary by source aspect ratio; the frame itself remains square.

## Scope
- Updated `app/[[...slug]]/Storefront.tsx` CategoryRail markup.
- Updated `app/globals.css` to remove circle mask and legacy zoom overrides for featured category images.
- Updated `scripts/final-production-audit.mjs` to check the requested square image behavior.
- Product images and brand logos retain their existing containment rules.

## Release note
This is a source-code change only. It will appear on the official website only after the corrected project is connected to the proper production domain and a successful deployment is promoted.
