# Tingbo website

The site is published from the `main` branch root to GitHub Pages at https://tingbo.app/.

## Website analytics

- Cloudflare account: the account signed in through the Feifei Chrome profile.
- Site: `tingbo.app`.
- Dashboard: [Tingbo Web Analytics](https://dash.cloudflare.com/e627953ea656d2415ada8eecaf10d0d7/web-analytics/overview?siteTag~in=f6b41b4ec060456490d45fe27f0e1e68&excludeBots=Yes).
- Setup: **Enable with JS Snippet installation** (manual), because the site is served directly by GitHub Pages.
- Every HTML page has one dashboard-provided module beacon before `</body>`. Search-engine verification files are unchanged.
- The `data-cf-beacon` token is a public site identifier, not an account credential. Do not add an API key to these pages.
- Do not enable automatic injection in addition to the manual snippet; this can create duplicate measurements.
- This measures website visits, page views, sources, and performance, not App activity, video-play events, download clicks, or actual app installs. Collection starts after installation; it does not recover earlier visits.
- Website analytics are disclosed separately from App behavior in the privacy pages.

Run `npm run check:analytics` before publishing. After changes to HTML pages, run `npm run generate:sitemap` and `npm run check:sitemap`.

## Languages

The site supports English, Simplified and Traditional Chinese, Japanese, Korean, Spanish, French, German, Brazilian Portuguese, Russian, Arabic, and Hindi across the home page, features, guides, and iOS/Android/HarmonyOS policy pages. Translations live in `i18n/`; the 10 added languages are generated as static HTML with `npm run generate:locales`. Existing English and Simplified Chinese pages keep their hand-authored content; update their static language menus and `hreflang` links with `npm run sync:language-links` after changing routes. Before publishing, run `npm run check:locales`, `npm run check:language-links`, `npm run check:analytics`, and `npm run check:sitemap`.

To verify online, open the English and Chinese pages, confirm a single beacon is present, and check the dashboard after its processing delay. Ad blockers or network restrictions may prevent a browser visit from being counted.

Official setup documentation: https://developers.cloudflare.com/web-analytics/get-started/
