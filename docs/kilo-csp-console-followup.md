# Prompt for Kilo — Console Cleanup Verification Fails

Kilo — we double-checked the live console after your "complete cleanup" claim and the violations are still firing. Please tackle the items below before we can sign off:

1. **Stop runtime style injection.**
   * `src/components/CategoryGrid.tsx` still ships a `<style jsx>` block with keyframes (lines 161-188). Under the current `style-src 'self' 'nonce-…'` policy the browser blocks this outright.
   * `src/components/affiliates/AffiliatePartners.tsx` does the same (lines 335-363).
   * `src/components/accessibility/AccessibilityProvider.tsx` dynamically creates a `<style>` element via `document.createElement('style')` on every settings change (lines 132-216).
   → Move these rules into build-time CSS (Tailwind utilities, CSS modules, or `globals.css`) so the CSP no longer sees inline `<style>` tags.

2. **Self-host Inter and drop Google Fonts.**
   * `app/layout.tsx` still imports `Inter` from `next/font/google` and preconnects to `fonts.googleapis.com`/`fonts.gstatic.com` (lines 2, 98-101).
   * Those requests inject inline font CSS that the strict CSP blocks, generating the repeated "Refused to apply inline style" errors we're seeing.
   → Add the Inter variable font to `/public/fonts/`, swap to `next/font/local`, and remove the external preconnect/prefetch tags.

3. **Add the missing CSP report endpoint.**
   * The browser continues to POST to `/api/security/csp-violation` and receives HTTP 405 because the route doesn't exist. There is no `app/api/security/csp-violation/route.ts` in the repo.
   → Create the route, accept `POST` (including `application/csp-report` payloads), log the body safely, and return `204 No Content`.

4. **Restore affiliate logo assets.**
   * `src/data/affiliatePartners.ts` references `/affiliates/amex-platinum-logo.svg` and `/affiliates/up-card-logo.svg`, but `public/affiliates/` still lacks those files.
   → Add the real SVGs (temporary placeholders are fine) or update the data to point at existing assets so we stop throwing 404s.

5. **Regression checklist before you hand it back.**
   * Run `npm run build` locally and load the homepage plus a story page with devtools open.
   * Confirm the console is clear of CSP style violations, 404s, and `POST /api/security/csp-violation 405` errors.
   * Capture a short HAR so we can see the clean run.

Ping us once these are done so we can rerun verification.