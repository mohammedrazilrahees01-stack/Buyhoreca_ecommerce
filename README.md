# BuyHoreca — Vercel build fix for commit 5afda13

This is a **minimal overlay**, not a replacement copy of the repository.

The latest GitHub repository is the base. Apply these two source fixes without deleting or replacing the existing public/Shopify assets.

## 1. app/manifest.ts
Replace the existing manifest with the supplied file. The only functional change is:

`purpose: "any maskable"` → `purpose: "maskable"`

## 2. app/[[...slug]]/Storefront.tsx
In the existing `CategoryIndex` function, add these two declarations immediately after the opening `{`:

`const categorySchema={"@context":"https://schema.org","@type":"CollectionPage","name":"BuyHoreca Categories","description":"Explore the live BuyHoreca collections.","url":"https://buyhoreca.com/categories"};`

`const categoryBreadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://buyhoreca.com/"},{"@type":"ListItem","position":2,"name":"Categories","item":"https://buyhoreca.com/categories"}]};`

The supplied STORE_FRONT_PATCH.txt also shows the complete corrected CategoryIndex function.

## After applying
Run:

`npm run build`

The two TypeScript errors from the reported Vercel build should be gone. Do not remove existing `public/images`, Shopify configuration, or other project files.
