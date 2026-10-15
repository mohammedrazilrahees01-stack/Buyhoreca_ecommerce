# Mega-menu category thumbnail polish — 2026-10-15

## Change
- Changed category thumbnails from the small 58px square shared brand-logo frame to a dedicated 68×48px (64×46px on narrower desktop widths) landscape frame.
- Applied `object-fit: cover` and `object-position: center` to the category image only so it fills the available thumbnail without distortion or letterboxing.
- Added subtle 7px corner rounding and a restrained hover zoom.
- Replaced the literal “Image” placeholder with a Package icon.
- Kept the separate brand-logo thumbnail component and its `object-fit: contain` behavior unchanged.
- Kept the existing card grid, navigation destinations, category data, and mobile/homepage category tiles unchanged.

## QA performed
- Source assertions confirm the category-only class is used once and the brand-logo class remains in use for brands.
- Run the bundled responsive/SEO, interaction, wishlist, comprehensive static, and TypeScript checks before production release.
- This source archive is not itself a Vercel deployment; production still needs a successful build and smoke test.
