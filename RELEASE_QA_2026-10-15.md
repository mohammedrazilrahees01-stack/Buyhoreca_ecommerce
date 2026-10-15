# BuyHoreca Corrected Release — 15 October 2026

## Source scope
This release starts from the saved BuyHoreca production source and applies fixes to the source files in this archive. It is not a copy of the older ZIP: the storefront and audit script have been updated.

## Fixes in this archive
- Corrected the production TypeScript union in the brand/business mega menu: collection UI only iterates Shopify collection objects, while business-type links iterate the business label array.
- Corrected the Product Type filter type guard so it returns a boolean for a confirmed string value.
- Corrected nested wheel handling so the browser owns native scrolling; the handler does not mutate scrollTop or call preventDefault, and lets page scrolling resume at nested-scroll boundaries.
- Rebuilt horizontal product rails with keyboard focus/region labels, vertical overflow containment, and previous/next controls.
- Set the WhatsApp control to an explicit fixed-position CSS rule, removed conflicting Tailwind position utilities, raised it to `bottom: calc(82px + env(safe-area-inset-bottom, 0px))` on mobile, and raised its stacking order above the bottom bar.
- Bounded the Shopify API proxy request payload to 192 KiB, with early `Content-Length` rejection and a post-read byte-size check, while preserving the existing GraphQL query and variable validation.
- Made the comprehensive audit TypeScript parser prefer the project-local `typescript` dependency, with a fallback for the original build environment.
- Preserved Shopify as the source of truth, stock-safe add-to-cart / quote rules, dynamic product/collection/brand/article SEO, canonical/OG/Twitter metadata, JSON-LD, sitemap and robots logic, eight primary navigation groups, and responsive breakpoints already in the project.

## Automated verification of this local package
This archive is built from the corrected project source and is re-opened and validated after packing. Automated source audits verify responsive breakpoints, SEO metadata/schema, navigation, accessibility labels, the WhatsApp positioning fix, and Shopify proxy input validation. The production build still requires the project dependencies; do not interpret a static audit as a successful deployment.

## Runtime verification and limits
A connected Vercel release-audit workspace on 15 October ran `npx tsc --noEmit` and `npm run build` successfully on its workspace dependency tree (Next.js 16.4.1). This downloadable archive preserves the saved project's package/lockfile versions (Next.js 16.3.2); because dependencies could not be installed in this local artifact-building runtime, a successful build of this exact ZIP has **not** been independently re-run here. The workspace also reported:
- Responsive/SEO audit: 49 PASS / 0 FAIL / 0 WARN.
- Interaction audit: 15 PASS / 0 FAIL.
- Wishlist test: PASS.
- Production-only `npm audit --omit=dev`: zero vulnerabilities.

## Outstanding issues — deliberately not hidden
- Vercel's connected project reports the latest production deployment on `main` failed at the build step. This ZIP does not push to GitHub, change Vercel project settings, or attach `buyhoreca.com` to a Vercel project.
- The official domain currently serves a different storefront from the Next.js project preview. Domain/source-of-truth alignment must be completed in the correct hosting platform before a new Next.js build can replace the live storefront.
- Vercel recorded Shopify connection timeouts/resets on storefront routes. Payload size is now bounded, but upstream reliability, live cart and checkout, and real environment settings still require a production-like smoke test.
- The Shopify proxy still accepts GraphQL query text from the browser. A persisted-operation allow-list and platform-level rate limiting are recommended before treating the proxy as fully hardened.
- The existing codebase lint command still reports legacy issues, including `@typescript-eslint/no-explicit-any`, React Hooks state/effect rules, and image-element warnings; these have not been falsely labelled as fixed.
- The precise archive dependency tree still needs a fresh `npm audit` after `npm ci`. A related workspace reported five high-severity findings in development lint tooling (no high/critical production dependency findings in that workspace); do not assume its counts apply identically to this lockfile.
- Real Shopify-authenticated cart/checkout and Vercel environment-variable behaviour must be smoke-tested against the configured preview before promoting a new production deployment.
- The connected GitHub integration refused write operations, so this ZIP does not claim its fixes were committed to `main` or already deployed to production.

## Build
Use Node.js 22 or a supported newer version. From the project root run:

```bash
npm ci
npx tsc --noEmit
npm run build
npm run audit:final
npm run audit:responsive-seo
npm run audit:interaction
npm run test:wishlist
```

Configure Shopify/Vercel environment variables in the deployment platform. Do not add real `.env.local` secrets to the archive or source control.

## Exact downloadable archive checks performed in this session
- Comprehensive static + TS/TSX parser audit on the packaged source: 143 PASS / 0 FAIL / 1 WARN. The only warning is that this local container did not have `node_modules`, so its audit skipped running `next build`; the connected Vercel workspace separately completed TypeScript and the production build successfully after the same build-error fixes.
- Responsive/SEO source audit against the packaged source: 50 PASS / 0 FAIL / 0 WARN.
- Interaction audit against the packaged source: 15 PASS / 0 FAIL.
- Wishlist test: PASS.
- `package.json` dependencies/devDependencies declarations matched `package-lock.json` root declarations.
- ZIP file opened successfully and passed CRC/integrity check after packaging; targeted TypeScript, scroll-handler and menu fixes were verified inside the archive itself.


## Featured category image square-fill correction

- The homepage Featured Categories image containers now use true 1:1 square frames, full-width/full-height images, `object-fit: cover`, and `object-position: center`.
- Removed the circular clipping mask, gray placeholder surround, and large scale transform that made source photography look like a narrow horizontal band inside a circle.
- Image frames stay responsive within the existing category grid and have no borders and use 12px rounded corners. Product image containment and brand logo proportions remain unchanged.
- Verified the code by source checks and static audits; production visual QA still requires deploying the intended app/domain and testing on real device widths.
