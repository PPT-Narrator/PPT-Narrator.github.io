import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageKinds, route, localizedAlternates } from './localized-routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

function menu(kind, code, legal) {
  const label = code === 'en' ? 'English' : '简体中文';
  const links = localizedAlternates(kind).map(item =>
    `<a href="${item.path}" lang="${item.code}"${item.code === code ? ' aria-current="page"' : ''}>${item.label}</a>`
  ).join('');
  const title = code === 'en' ? 'Choose language' : '选择语言';
  const className = legal ? 'legal-language-menu' : 'language-menu';
  return `<details class="${className}"><summary aria-label="${title}">${label}</summary><div class="language-options">${links}</div></details>`;
}

for (const code of ['en', 'zh-Hans']) {
  for (const kind of pageKinds) {
    const url = route(kind, code);
    if (!url) continue;
    const file = path.join(root, url.slice(1), url.endsWith('/') ? 'index.html' : '');
    const original = await readFile(file, 'utf8');
    let result = original.replace(/\s*<link rel="alternate" hreflang="[^"]+" href="[^"]+"\s*\/?>/g, '');
    const alternateTags = localizedAlternates(kind).map(item =>
      `  <link rel="alternate" hreflang="${item.code}" href="https://tingbo.app${encodeURI(item.path)}">`
    ).join('\n');
    const fallback = route(kind, 'en') ?? route(kind, 'zh-Hans');
    const tags = `\n${alternateTags}\n  <link rel="alternate" hreflang="x-default" href="https://tingbo.app${fallback}">`;
    const canonical = /<link rel="canonical"[^>]+>/;
    if (!canonical.test(result)) throw new Error(`No canonical link: ${file}`);
    result = result.replace(canonical, match => match + tags);

    const legal = ['privacy', 'terms', 'androidPrivacy', 'harmonyPrivacy'].includes(kind);
    const selector = legal ? /<(?:div|nav) class="lang-switch">[\s\S]*?<\/(?:div|nav)>|<details class="legal-language-menu">[\s\S]*?<\/details>/ : /<nav class="nav"[^>]*>[\s\S]*?<\/nav>/;
    if (kind === 'harmonyPrivacy') {
      result = result.replace(/\s*<details class="legal-language-menu">[\s\S]*?<\/details>/, '');
      result = result.replace(/(<main>)/, `$1\n    ${menu(kind, code, true)}`);
    } else if (legal) {
      if (!selector.test(result)) throw new Error(`No legal language switch: ${file}`);
      result = result.replace(selector, menu(kind, code, true));
    } else {
      if (!selector.test(result)) throw new Error(`No site nav: ${file}`);
      result = result.replace(selector, nav => {
        const old = /<a href="[^"]+" lang="(?:en|zh-Hans)">[^<]+<\/a>|<details class="language-menu">[\s\S]*?<\/details>/;
        if (!old.test(nav)) throw new Error(`No previous language link: ${file}`);
        return nav.replace(old, menu(kind, code, false));
      });
    }
    if (legal) {
      result = result.replace(/\s*<link rel="stylesheet" href="\/assets\/legal-language-menu.css">/, '');
      result = result.replace(/\s*<\/head>/, '</head>');
      result = result.replace('</head>', '\n  <link rel="stylesheet" href="/assets/legal-language-menu.css">\n</head>');
    }
    if (check) {
      if (result !== original) {
        const index = [...result].findIndex((char, position) => char !== original[position]);
        throw new Error(`${file} needs language links sync near ${index}: ${JSON.stringify(original.slice(index, index + 100))} -> ${JSON.stringify(result.slice(index, index + 100))}`);
      }
    } else {
      await writeFile(file, result);
    }
  }
}
console.log(`Existing language links ${check ? 'checked' : 'synced'}.`);
