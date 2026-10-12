import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translations } from '../i18n/locales.mjs';
import { primaryHome } from '../i18n/home.mjs';
import { renderHome } from './render-home.mjs';
import { locales, pageKinds, route, localizedAlternates } from './localized-routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://tingbo.app';
const beacon = '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "1afbc61212cf4e1c8385cf85122aefff"}\'></script>';
const appStore = 'https://apps.apple.com/us/app/id6806785922';
const googlePlay = 'https://play.google.com/store/apps/details?id=com.ff.narrator';
const appStoreLabel = 'Download on App Store';
const googlePlayLabel = 'Download on Google Play';

function escape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function a(href, label, attrs = '') {
  return `<a href="${escape(href)}"${attrs}>${escape(label)}</a>`;
}

function storeButton(href, label) {
  return a(href, label, ' class="button" rel="noopener"');
}

function alternates(kind) {
  const links = localizedAlternates(kind).map(locale =>
    `<link rel="alternate" hreflang="${escape(locale.code)}" href="${origin}${escape(locale.path)}">`
  );
  links.push(`<link rel="alternate" hreflang="x-default" href="${origin}${route(kind, 'en') ?? route(kind, 'zh-Hans')}">`);
  return links.join('\n  ');
}

function menu(kind, locale, data) {
  const links = localizedAlternates(kind).map(target =>
    a(target.path, target.label, ` lang="${escape(target.code)}"${target.code === locale.code ? ' aria-current="page"' : ''}`)
  ).join('');
  return `<details class="language-menu"><summary aria-label="${escape(data.nav.language)}">${escape(locale.label)}</summary><div class="language-options">${links}</div></details>`;
}

function header(kind, locale, data) {
  return `<header class="site-header"><nav class="nav" aria-label="${escape(data.nav.navigation)}">
    ${a(route('home', locale.code), 'Tingbo', ' class="brand"')}
    <div class="nav-links">
      ${a(route('features', locale.code), data.nav.features)}
      ${a(route('notes', locale.code), data.nav.notes, ' class="optional"')}
      ${a(route('rehearsal', locale.code), data.nav.rehearsal, ' class="optional"')}
      ${menu(kind, locale, data)}
    </div>
  </nav></header>`;
}

function footer(locale, data) {
  return `<footer class="site-footer"><div class="footer-inner"><span>© 2026 Tingbo.</span><div class="footer-links">
    ${a(route('home', locale.code), data.nav.home)}
    ${a(route('privacy', locale.code), data.nav.privacy)}
    ${a(route('terms', locale.code), data.nav.terms)}
    ${a(route('androidPrivacy', locale.code), data.androidPrivacy.title)}
    ${a(route('harmonyPrivacy', locale.code), data.harmonyPrivacy.title)}
    ${a('mailto:m15568817011@163.com', data.nav.support)}
  </div></div></footer>`;
}

function shell(kind, locale, data, title, description, body) {
  const url = `${origin}${route(kind, locale.code)}`;
  const direction = locale.code === 'ar' ? ' dir="rtl"' : '';
  const appSchema = kind === 'home' ? `
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    '@id': `${origin}/#app`,
    name: 'Tingbo: Hear Speaker Notes',
    alternateName: '听播 Tingbo · PPT听稿',
    url: `${origin}/`,
    downloadUrl: [appStore, googlePlay],
    sameAs: [appStore, googlePlay],
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Presentation software',
    operatingSystem: 'iOS, Android',
    isAccessibleForFree: true,
    inLanguage: locale.code,
    description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }, null, 2)}
  </script>` : '';
  return `<!DOCTYPE html>
<html lang="${escape(locale.code)}"${direction}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)} | Tingbo</title>
  <meta name="description" content="${escape(description)}">
  <link rel="canonical" href="${url}">
  ${alternates(kind)}
  <link rel="icon" href="/images/tingbo-app-icon.png" type="image/png">
  <link rel="stylesheet" href="/assets/site.css">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(title)} | Tingbo">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://tingbo.app/images/og-en.jpg">${appSchema}
</head>
<body class="localized-page">
  <a class="skip-link" href="#main">${escape(data.nav.skip)}</a>
  ${header(kind, locale, data)}
  <main id="main">${body}</main>
  ${footer(locale, data)}
  ${beacon}
</body>
</html>
`;
}

function article(kind, locale, data, content, blocks) {
  const downloadActions = ['features', 'notes', 'rehearsal'].includes(kind)
    ? `${storeButton(appStore, appStoreLabel)}${storeButton(googlePlay, googlePlayLabel)}`
    : storeButton(appStore, appStoreLabel);
  const body = `<div class="article-shell"><article class="article">
    <div class="breadcrumbs">${a(route('home', locale.code), data.nav.home)} / ${escape(content.title)}</div>
    <h1>${escape(content.title)}</h1><p class="article-lede">${escape(content.intro)}</p>
    ${blocks}
    <div class="actions">${downloadActions}</div>
  </article></div>`;
  return shell(kind, locale, data, content.title, content.description ?? content.intro, body);
}

function features(locale, data) {
  const blocks = data.features.map(([title, text]) => `<h2>${escape(title)}</h2><p>${escape(text)}</p>`).join('') +
    `<h2>${escape(data.featuresPage.formatsTitle)}</h2><p>${escape(data.featuresPage.formatsText)}</p>`;
  return article('features', locale, data, data.featuresPage, blocks);
}

function guide(kind, locale, data) {
  const content = data[kind];
  const blocks = content.steps.map(([title, text], index) => `<h2>${index + 1}. ${escape(title)}</h2><p>${escape(text)}</p>`).join('') +
    `<div class="callout">${escape(content.tip)}</div>`;
  return article(kind, locale, data, content, blocks);
}

function legal(kind, locale, data) {
  const content = data[kind];
  const english = route(kind, 'en') ?? route(kind, 'zh-Hans');
  const date = { privacy: '2026-09-22', terms: '2026-09-22', androidPrivacy: '2026-09-15', harmonyPrivacy: '2026-09-13' }[kind];
  const blocks = `<p class="policy-date"><time datetime="${date}">${date}</time></p>` +
    content.sections.map(([title, text], index) => `<h2>${index + 1}. ${escape(title)}</h2><p>${escape(text)}</p>`).join('') +
    `<p>${a(english, data.nav.originalVersion)} · ${a('mailto:m15568817011@163.com', 'm15568817011@163.com')}</p>`;
  return article(kind, locale, data, content, blocks);
}

for (const locale of locales) {
  const data = translations[locale.code] ?? primaryHome[locale.code];
  if (!data) throw new Error(`Missing translation for ${locale.code}`);
  const expectedSections = { privacy: 10, terms: 13, androidPrivacy: 9, harmonyPrivacy: 10 };
  if (locale.prefix && (data.features.length !== 6 || data.notes.steps.length !== 3 || data.rehearsal.steps.length !== 3 || data.faq.length < 3)) {
    throw new Error(`Incomplete product translation for ${locale.code}`);
  }
  for (const [kind, count] of locale.prefix ? Object.entries(expectedSections) : []) {
    if (data[kind].sections.length !== count) throw new Error(`Incomplete ${kind} translation for ${locale.code}`);
  }
  for (const kind of locale.prefix ? pageKinds : ['home']) {
    const markup = kind === 'home' ? renderHome(locale, data) : kind === 'features' ? features(locale, data)
      : kind === 'notes' || kind === 'rehearsal' ? guide(kind, locale, data)
      : legal(kind, locale, data);
    const target = path.join(root, route(kind, locale.code).slice(1),
      route(kind, locale.code).endsWith('/') ? 'index.html' : '');
    await mkdir(path.dirname(target), { recursive: true });
    const previous = await readFile(target, 'utf8').catch(() => null);
    if (process.argv.includes('--check')) {
      if (previous !== markup) throw new Error(`${target} is out of date`);
    } else if (previous !== markup) {
      await writeFile(target, markup);
    }
  }
}
console.log(`12 homepages and 10 languages × 7 article types verified${process.argv.includes('--check') ? '' : ' or generated'}.`);
