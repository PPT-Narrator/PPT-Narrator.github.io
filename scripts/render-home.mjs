import { homeCopy } from '../i18n/home.mjs';
import { localizedAlternates, route } from './localized-routes.mjs';

const origin = 'https://tingbo.app';
const stores = [['https://apps.apple.com/us/app/id6806785922', 'Download on App Store'], ['https://play.google.com/store/apps/details?id=com.ff.narrator', 'Download on Google Play']];
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const link = (url, text, attrs = '') => `<a href="${escape(url)}"${attrs}>${escape(text)}</a>`;
const storeButtons = () => stores.map(([url, text]) => link(url, text, ' class="button store-button" rel="noopener"')).join('');

export function renderHome(locale, data) {
  const code = locale.code;
  const copy = homeCopy[code];
  const h = data.home;
  const nav = data.nav;
  const url = origin + route('home', code);
  const chinese = code === 'zh-Hans' || code === 'zh-Hant';
  const brand = code === 'zh-Hans' ? '听播 Tingbo' : code === 'zh-Hant' ? '聽播 Tingbo' : 'Tingbo';
  const appName = code === 'zh-Hans' ? '听播 Tingbo · PPT听稿' : code === 'zh-Hant' ? '聽播 Tingbo · PPT聽稿' : 'Tingbo: Hear Speaker Notes';
  const title = code === 'en' ? `${appName} | PPT Notes Reader` : chinese ? `${appName} | PPT ${code === 'zh-Hans' ? '备注朗读' : '備註朗讀'}` : `${h.title} | Tingbo`;
  const featureItems = data.features.length === 3 ? data.features : [data.features[0], data.features[3], data.features[2]];
  const intro = code === 'en' || code === 'zh-Hans' ? h.intro : data.features[0][1];
  const storyLanguage = chinese ? 'zh' : 'en';
  const faqs = [...data.faq, [copy.privacyQuestion, copy.privacyAnswer]];
  const alternatives = localizedAlternates('home');
  const languageLinks = alternatives.map(item => link(item.path, item.label, ` lang="${item.code}"${item.code === code ? ' aria-current="page"' : ''}`)).join('');
  const privacy = kind => route(kind, code) ? link(route(kind, code), nav.privacy) : link('/harmony/privacy.html', `${nav.privacy} · 中文`, ' lang="zh-Hans"');
  const schema = {
    '@context': 'https://schema.org', '@graph': [
      { '@type': 'MobileApplication', '@id': origin + '/#app', name: 'Tingbo: Hear Speaker Notes', alternateName: '听播 Tingbo · PPT听稿', url: origin + '/', downloadUrl: stores.map(item => item[0]), sameAs: stores.map(item => item[0]), applicationCategory: 'BusinessApplication', operatingSystem: 'iOS, Android', inLanguage: code, isAccessibleForFree: true, description: h.description, image: origin + '/images/tingbo-app-icon.png', screenshot: origin + '/images/ios-slide-notes.webp', featureList: data.features.map(item => item[0]), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      { '@type': 'VideoObject', '@id': url + '#demo', name: 'Tingbo: Hear Speaker Notes', description: copy.demoText, thumbnailUrl: origin + '/images/demo-poster.webp', uploadDate: '2026-09-12T22:58:39+08:00', duration: 'PT45S', contentUrl: origin + '/demo.mp4', inLanguage: 'en', isFamilyFriendly: true },
      { '@type': 'VideoObject', '@id': url + '#story', name: copy.story, description: copy.storyText, thumbnailUrl: origin + `/images/story-${storyLanguage}.jpg`, uploadDate: '2026-09-13', duration: 'PT75.8S', contentUrl: origin + `/videos/story-${storyLanguage}.mp4`, inLanguage: chinese ? 'zh-Hans' : 'en', isFamilyFriendly: true },
      { '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faqs.map(([q, answer]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: answer } })) }
    ]
  };
  return `<!DOCTYPE html>
<html lang="${code}"${code === 'ar' ? ' dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(h.description)}">
  <meta name="theme-color" content="#112a2c">
  <meta name="apple-itunes-app" content="app-id=6806785922">
  <link rel="canonical" href="${url}">
  ${alternatives.map(item => `<link rel="alternate" hreflang="${item.code}" href="${origin}${item.path}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${origin}/">
  <link rel="icon" href="/images/tingbo-app-icon.png" type="image/png">
  <link rel="apple-touch-icon" href="/images/tingbo-app-icon.png">
  <link rel="stylesheet" href="/assets/site.css">
  <link rel="stylesheet" href="/assets/home.css">
  <script src="/assets/home.js" defer></script>
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Tingbo">
  <meta property="og:title" content="${escape(appName)}">
  <meta property="og:description" content="${escape(h.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${origin}/images/og-${chinese ? 'zh' : 'en'}.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escape(h.screenshotAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(appName)}">
  <meta name="twitter:description" content="${escape(h.description)}">
  <meta name="twitter:image" content="${origin}/images/og-${chinese ? 'zh' : 'en'}.jpg">
  <meta property="al:ios:app_store_id" content="6806785922">
  <meta property="al:ios:app_name" content="Tingbo: Hear Speaker Notes">
  <meta property="al:android:package" content="com.ff.narrator">
  <meta property="al:android:app_name" content="Tingbo: Hear Speaker Notes">
  <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
</head>
<body class="product-home">
  <a class="skip-link" href="#main">${escape(nav.skip)}</a>
  <header class="site-header"><nav class="nav" aria-label="${escape(nav.navigation)}">
    <a class="brand" href="${route('home', code)}"><img src="/images/tingbo-app-icon.png" width="42" height="42" alt="Tingbo"><span>${brand}</span></a>
    <div class="nav-links">${link(route('features', code), nav.features)}${link('#demo', copy.watch, ' class="optional"')}<details class="language-menu"><summary aria-label="${escape(nav.language)}">${escape(locale.label)}</summary><div class="language-options">${languageLinks}</div></details></div>
  </nav></header>
  <main id="main">
    <section class="product-hero" aria-labelledby="home-title"><div class="section-inner product-hero-layout">
      <div class="product-hero-copy"><h1 id="home-title">${brand}</h1><p class="product-tagline">${escape(h.title)}</p><p class="product-intro">${escape(intro)}</p>
        <div class="actions">${storeButtons()}</div><p class="product-facts">${escape(h.formats)}</p>${link('#demo', copy.watch, ' class="demo-link"')}
      </div>
      <figure class="app-view"><div class="app-crop app-slide"><img src="/images/ios-slide-notes.webp" width="1206" height="2622" fetchpriority="high" alt="${escape(h.screenshotAlt)}"></div><div class="app-crop app-note"><img src="/images/ios-slide-notes.webp" width="1206" height="2622" alt="${escape(featureItems[1][0])}"></div><div class="app-crop app-playback"><img src="/images/ios-slide-notes.webp" width="1206" height="2622" alt="${escape(data.notes.steps[1][0])}"></div><figcaption>${escape(copy.caption)}</figcaption></figure>
    </div></section>
    <section class="section demo-section" id="demo" aria-labelledby="demo-title"><div class="section-inner demo-layout">
      <div class="demo-copy"><p class="eyebrow">Tingbo · iOS</p><h2 id="demo-title">${escape(copy.demoTitle)}</h2><p>${escape(copy.demoText)}</p><ol class="demo-steps" aria-label="${escape(copy.walkthrough)}">${data.notes.steps.map(([title]) => `<li>${escape(title)}</li>`).join('')}</ol>${link(route('notes', code), nav.notes, ' class="text-link"')}</div>
      <figure class="demo-video"><video controls playsinline preload="none" poster="/images/demo-poster.webp" width="1080" height="1920" aria-label="${escape(copy.demoTitle)}"><source src="/demo.mp4" type="video/mp4"><track kind="captions" src="/captions/demo-en.vtt" srclang="en" label="English"${chinese ? '' : ' default'}><track kind="captions" src="/captions/demo-zh.vtt" srclang="zh-Hans" label="简体中文"${chinese ? ' default' : ''}>${link('/demo.mp4', copy.watch)}</video><figcaption>English · 0:45</figcaption></figure>
    </div></section>
    <section class="section product-features" aria-labelledby="features-title"><div class="section-inner"><div class="section-heading"><h2 id="features-title">${escape(h.featureTitle)}</h2><p>${escape(h.featureIntro)}</p></div><div class="benefit-grid">${featureItems.map(([title, text], order) => `<article><span class="benefit-number" aria-hidden="true">0${order + 1}</span><h3>${escape(title)}</h3><p>${escape(text)}</p></article>`).join('')}</div>${link(route('features', code), nav.allFeatures, ' class="text-link"')}</div></section>
    <section class="section product-workflow" aria-labelledby="workflow-title"><div class="section-inner"><div class="section-heading"><h2 id="workflow-title">${escape(h.stepsTitle)}</h2></div><div class="workflow">${data.notes.steps.map(([title, text], index) => `<article><span class="step-number">${index + 1}</span><h3>${escape(title)}</h3><p>${escape(text)}</p></article>`).join('')}</div><div class="guide-links">${link(route('notes', code), nav.notes)}${link(route('rehearsal', code), nav.rehearsal)}${code === 'en' ? link('/google-slides-speaker-notes/', 'Google Slides speaker notes') : code === 'zh-Hans' ? link('/zh/google-slides-speaker-notes/', 'Google Slides 备注朗读') : ''}</div></div></section>
    <section class="section product-platforms" aria-labelledby="platform-title"><div class="section-inner"><div class="section-heading"><h2 id="platform-title">${escape(copy.platforms)}</h2></div><div class="platform-grid"><article><h3>iPhone & iPad</h3><p>${escape(copy.ios)}</p>${privacy('privacy')}</article><article><h3>Android</h3><p>${escape(copy.android)}</p>${privacy('androidPrivacy')}</article></div><p class="harmony-note">${escape(copy.harmony)} ${privacy('harmonyPrivacy')}</p></div></section>
    <section class="section product-faq" id="faq" aria-labelledby="faq-title"><div class="section-inner faq"><div class="section-heading"><h2 id="faq-title">${escape(h.faqTitle)}</h2></div>${faqs.map(([q, answer]) => `<details><summary>${escape(q)}</summary><p>${escape(answer)}</p></details>`).join('')}
      <details class="product-story" id="story"><summary>${escape(copy.story)}</summary><p>${escape(copy.storyText)}</p><video controls playsinline preload="none" width="1080" height="1920" poster="/images/story-${storyLanguage}.jpg" aria-label="${escape(copy.story)}"><source src="/videos/story-${storyLanguage}.mp4" type="video/mp4"><track kind="captions" src="/captions/story-${storyLanguage}.vtt" srclang="${chinese ? 'zh-Hans' : 'en'}" label="${chinese ? '中文' : 'English'}" default>${link(`/videos/story-${storyLanguage}.mp4`, copy.story)}</video></details>
    </div></section>
    <section class="section product-cta"><div class="section-inner"><h2>${escape(h.ctaTitle)}</h2><p>${escape(h.ctaText)}</p><div class="actions">${storeButtons()}</div></div></section>
  </main>
  <footer class="site-footer"><div class="footer-inner"><span>© 2026 Tingbo.</span><div class="footer-links">${link(route('features', code), nav.features)}${link(route('privacy', code), nav.privacy)}${link(route('terms', code), nav.terms)}${link('mailto:m15568817011@163.com', nav.support)}</div></div></footer>
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "1afbc61212cf4e1c8385cf85122aefff"}'></script>
</body>
</html>
`;
}
