# Build hotfix — 16 October 2026

## TypeScript error fixed

`app/[[...slug]]/Storefront.tsx` previously accessed `brandEntry.collection` without narrowing the union `BrandDirectoryItem<Collection> | CuratedBrand`. `CuratedBrand` does not define `collection`.

The lookup now checks whether `collection` exists on the selected entry before reading it:

```tsx
const resolvedHandle = brandEntry && "collection" in brandEntry
  ? (brandEntry.collection?.handle || handle)
  : handle;
```

This preserves the previous routing behavior for linked Shopify collections and falls back to the requested handle for a curated brand without a collection.

## Verification limitation

This environment does not contain the project's `node_modules`, so a complete `npm run build` has not been claimed. Run `npm run build` after extracting this archive and installing dependencies. Fix any additional errors reported by that build before deployment.
