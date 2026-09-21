import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translations } from '../i18n/locales.mjs';
import { locales, pageKinds, route, localizedAlternates } from './localized-routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://tingbo.app';
const beacon = '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "1afbc61212cf4e1c8385cf85122aefff"}\'></script>';
const appStore = 'https://apps.apple.com/us/app/id6806785922';

function escape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function a(href, label, attrs = '') {
  return `<a href="${escape(href)}"${attrs}>${escape(label)}</a>`;
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
  <meta property="og:image" content="https://tingbo.app/images/og-en.jpg">
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

function card(title, description) {
  return `<article class="feature-item"><strong>${escape(title)}</strong><p>${escape(description)}</p></article>`;
}

function home(locale, data) {
  const h = data.home;
  const body = `
  <section class="section localized-hero" aria-labelledby="home-title"><div class="section-inner localized-hero-layout">
    <div><p class="eyebrow">${escape(h.eyebrow)}</p><h1 id="home-title">${escape(h.title)}</h1>
    <p class="hero-lede">${escape(h.intro)}</p>
    <div class="actions">${a(appStore, data.nav.download, ' class="button" rel="noopener"')}${a(route('notes', locale.code), data.nav.notes, ' class="button button-secondary"')}</div>
    <p class="hero-facts">${escape(h.formats)}</p></div>
    <div class="localized-audio-art" aria-hidden="true"><div class="localized-slide"><span></span><span></span><span></span></div><div class="localized-player"><i>▶</i><b></b><b></b><b></b><b></b><b></b></div></div>
  </div></section>
  <section class="section" aria-labelledby="home-features"><div class="section-inner">
    <div class="section-heading"><p class="eyebrow">${escape(h.featureEyebrow)}</p><h2 id="home-features">${escape(h.featureTitle)}</h2><p>${escape(h.featureIntro)}</p></div>
    <div class="feature-grid">${data.features.slice(0, 3).map(item => card(...item)).join('')}</div>
    <div class="actions">${a(route('features', locale.code), data.nav.allFeatures, ' class="button"')}</div>
  </div></section>
  <section class="section reader-spotlight" aria-labelledby="reader-title"><div class="section-inner reader-layout">
    <div class="reader-copy"><p class="eyebrow">${escape(h.readerEyebrow)}</p><h2 id="reader-title">${escape(h.readerTitle)}</h2>
      <p class="reader-lede">${escape(h.readerText)}</p><p class="reader-formats">${escape(h.formats)}</p>
      ${a(route('rehearsal', locale.code), data.nav.rehearsal, ' class="text-link"')}
    </div>
    <figure class="reader-visual"><img src="/images/en-slide-and-script.webp" width="720" height="1461" loading="lazy" alt="${escape(h.screenshotAlt)}"><figcaption>${escape(h.screenshotCaption)}</figcaption></figure>
  </div></section>
  <section class="section section-soft" aria-labelledby="home-steps"><div class="section-inner"><div class="section-heading"><h2 id="home-steps">${escape(h.stepsTitle)}</h2></div>
    <div class="workflow">${data.rehearsal.steps.map(([title, text], index) => `<article><span class="step-number">${index + 1}</span><h3>${escape(title)}</h3><p>${escape(text)}</p></article>`).join('')}</div>
  </div></section>
  <section class="section" aria-labelledby="faq-title"><div class="section-inner faq"><div class="section-heading"><h2 id="faq-title">${escape(h.faqTitle)}</h2></div>
    ${data.faq.map(([q, answer]) => `<details><summary>${escape(q)}</summary><p>${escape(answer)}</p></details>`).join('')}
  </div></section>
  <section class="section cta-band"><div class="section-inner cta-row"><div><h2>${escape(h.ctaTitle)}</h2><p>${escape(h.ctaText)}</p></div>${a(appStore, data.nav.download, ' class="button" rel="noopener"')}</div></section>`;
  return shell('home', locale, data, h.title, h.description, body);
}

function article(kind, locale, data, content, blocks) {
  const body = `<div class="article-shell"><article class="article">
    <div class="breadcrumbs">${a(route('home', locale.code), data.nav.home)} / ${escape(content.title)}</div>
    <h1>${escape(content.title)}</h1><p class="article-lede">${escape(content.intro)}</p>
    ${blocks}
    <div class="actions">${a(appStore, data.nav.download, ' class="button" rel="noopener"')}</div>
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
  const date = { privacy: '2026-09-22', terms: '2026-08-30', androidPrivacy: '2026-09-15', harmonyPrivacy: '2026-09-13' }[kind];
  const blocks = `<p class="policy-date"><time datetime="${date}">${date}</time></p>` +
    content.sections.map(([title, text], index) => `<h2>${index + 1}. ${escape(title)}</h2><p>${escape(text)}</p>`).join('') +
    `<p>${a(english, data.nav.originalVersion)} · ${a('mailto:m15568817011@163.com', 'm15568817011@163.com')}</p>`;
  return article(kind, locale, data, content, blocks);
}

for (const locale of locales.filter(locale => locale.prefix)) {
  const data = translations[locale.code];
  if (!data) throw new Error(`Missing translation for ${locale.code}`);
  const expectedSections = { privacy: 10, terms: 13, androidPrivacy: 9, harmonyPrivacy: 10 };
  if (data.features.length !== 6 || data.notes.steps.length !== 3 || data.rehearsal.steps.length !== 3 || data.faq.length < 3) {
    throw new Error(`Incomplete product translation for ${locale.code}`);
  }
  for (const [kind, count] of Object.entries(expectedSections)) {
    if (data[kind].sections.length !== count) throw new Error(`Incomplete ${kind} translation for ${locale.code}`);
  }
  for (const kind of pageKinds) {
    const markup = kind === 'home' ? home(locale, data) : kind === 'features' ? features(locale, data)
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
console.log(`${locales.length - 2} languages × ${pageKinds.length} page types verified${process.argv.includes('--check') ? '' : ' or generated'}.`);
