BUYHORECA VERCEL FIX

This package fixes the TypeScript error from the Vercel build for commit 8f23d5c:
- undefined categorySchema
- undefined categoryBreadcrumb

It also safely corrects the old manifest value "any maskable" to "maskable" if that value is present.

IMPORTANT:
This is a minimal fix package, NOT a replacement copy of the whole repository.
Apply it to your current BuyHoreca repo so no products, images, Shopify configuration, or other files are lost.

WINDOWS:
1. Extract this ZIP into your BuyHoreca repo root.
2. Open PowerShell in the repo root.
3. Run: .\fix-vercel-build.ps1
4. Wait for "SUCCESS: BuyHoreca production build passed."
5. Commit and push the changed file(s) to GitHub.
6. Let Vercel redeploy.

GIT PATCH:
git apply BUYHORECA_VERCEL_FIX.patch
npm run build
git add app/[[...slug]]/Storefront.tsx app/manifest.ts
git commit -m "Fix Vercel TypeScript build"
git push
