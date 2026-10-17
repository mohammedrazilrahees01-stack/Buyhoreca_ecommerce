BUYHORECA — FULL SOURCE AUDIT & FIXES
Date: 16 October 2026

This archive includes the latest source corrections after discovering that earlier static checks had missed a broken blog loop/spacing behavior.

Key fixes:
- Blog marquee offset direction/normalization and consistent 9px/12px loop spacing.
- Responsive carousel duplication, pause behavior, and reduced-motion manual scrolling.
- Removed conflicting motion CSS that re-enabled image zoom for reduced-motion users.
- Cursor-paginated blog/article sitemap handling with nested Shopify connection support and repeated-cursor guard.
- JSON-LD escaping before script insertion and quote page excluded from sitemap.
- Fixed mobile “New Items” sorting, duplicate mobile navigation keys/routes, and direct-product quote-row quantity/removal.
- Separate hero image fallback and guarded collection pagination.

Latest source checks: comprehensive audit 170 PASS / 0 FAIL / 1 WARN; release-hardening 21/21; product/blog 14/14; brand directory 18/18; responsive/SEO 53/53; interactions 15/15; checkout source wiring 10/10; availability 5/5; inventory 10/10; wishlist PASS. The CSS-backed isolated Chromium fixture passed 17 viewport widths and hover/reduced-motion checks. Refer to FINAL_QA_RESULTS_2026-10-16.md for the full list.

IMPORTANT: This is not a production-certified/deployed release. The complete Next.js build, full-project lint/typecheck, authenticated Shopify checkout and promotion validation, deployment/domain alignment, and live performance/SEO checks remain unfinished because dependency access/authenticated production environment is unavailable here. English/Arabic + RTL is not implemented yet. Read FULL_SITE_AUDIT_AND_FIX_LOG_2026-10-16.md and RELEASE_STATUS_2026-10-16.md before deploying.
