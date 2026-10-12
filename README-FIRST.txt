BUYHORECA — FINAL WORKING SOURCE NOTES

Brand system:
Shopify Collection title = brand name
Shopify Collection image = brand logo
Shopify automated collection condition can be Vendor = the same brand
Website automatically discovers matching brand collections and builds brand cards/pages. No local brand-logo folder is required.

Adding a brand requires NO code change:
1) Set product Vendor/Brand.
2) Create matching Shopify Collection.
3) Upload the logo as Collection image.
4) Save.

The active storefront does not use local brand logo files or brand metaobjects.

Audit:
126 PASS / 0 FAIL / 1 WARN in the static comprehensive audit. See COMPREHENSIVE_AUDIT_2026-10-12.txt and FINAL_RELEASE_AUDIT_2026-10-12.md.

Build note:
Static TypeScript/TSX syntax audit passed. A full npm/Next build could not be run because npm dependency installation timed out in this environment.


COMPETITOR / B2B RELEASE
Read COMPLETE_B2B_IMPLEMENTATION_PLAN_2026-10-12.md for the current implemented feature matrix and the remaining data/service requirements.

BRANDS
Create a Shopify Collection whose title exactly matches the brand name. Upload the brand logo as the Collection image. Prefer an automated collection with Vendor equals the same brand name. The storefront uses the Collection image directly; no local brand image file is required.

QUOTE
Use Add to Quote on products to build a multi-item browser-persistent quote basket. Submission currently opens WhatsApp with the consolidated request.

SHOP FILTERS
The main catalogue reads Shopify collection/search ProductFilter definitions. Configure desired filters in Shopify Search & Discovery.

DISCOUNTS
Discount codes are applied through Shopify. The storefront does not hardcode discount eligibility.
