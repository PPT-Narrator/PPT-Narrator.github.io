import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { locales, route } from './localized-routes.mjs';

const root = new URL('../', import.meta.url);
for (const locale of locales) {
  const page = new URL(`.${route('home', locale.code)}index.html`, root);
  const html = await readFile(page, 'utf8');
  const label = locale.code;
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${label}: single product H1`);
  assert.equal((html.match(/class="button store-button"/g) ?? []).length, 4, `${label}: two stores in hero and CTA`);
  assert.ok(html.indexOf('id="demo"') < html.indexOf('id="features-title"'), `${label}: demo before feature details`);
  assert.ok(html.includes(`href="https://tingbo.app${route('home', locale.code)}"`), `${label}: canonical URL`);
  assert.equal((html.match(/hreflang=/g) ?? []).length, 13, `${label}: all language alternates`);
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /alt="[^"]+"/, `${label}: meaningful image alternative`);
  }
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const faq = schema['@graph'].find(item => item['@type'] === 'FAQPage');
  assert.ok(faq.mainEntity.length >= 4, `${label}: product and privacy answers`);
  for (const item of faq.mainEntity) {
    assert.ok(html.includes(item.name.replaceAll('&', '&amp;').replaceAll("'", '&#39;')), `${label}: FAQ matches visible copy`);
  }
  const demo = schema['@graph'].find(item => item['@id'].endsWith('#demo'));
  assert.equal(demo.thumbnailUrl, 'https://tingbo.app/images/demo-poster.webp', `${label}: portrait video poster`);
  for (const attribute of html.matchAll(/(?:href|src|poster)="(\/[^"#]+)"/g)) {
    const path = decodeURIComponent(attribute[1]);
    await access(new URL(`.${path}${path.endsWith('/') ? 'index.html' : ''}`, root));
  }
}
console.log('12 homepages: metadata, assets, links, download actions and FAQ verified.');
