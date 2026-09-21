export const locales = [
  { code: 'en', label: 'English' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文', prefix: 'zh-hant' },
  { code: 'ja', label: '日本語', prefix: 'ja' },
  { code: 'ko', label: '한국어', prefix: 'ko' },
  { code: 'es', label: 'Español', prefix: 'es' },
  { code: 'fr', label: 'Français', prefix: 'fr' },
  { code: 'de', label: 'Deutsch', prefix: 'de' },
  { code: 'pt-BR', label: 'Português (Brasil)', prefix: 'pt-br' },
  { code: 'ru', label: 'Русский', prefix: 'ru' },
  { code: 'ar', label: 'العربية', prefix: 'ar' },
  { code: 'hi', label: 'हिन्दी', prefix: 'hi' }
];

export const pageKinds = [
  'home', 'features', 'notes', 'rehearsal', 'privacy', 'terms', 'androidPrivacy', 'harmonyPrivacy'
];

export function route(kind, code) {
  if (code === 'en') {
    return {
      home: '/', features: '/features/', notes: '/how-to-read-ppt-notes-aloud/',
      rehearsal: '/presentation-rehearsal/', privacy: '/privacy.html',
      terms: '/terms.html', androidPrivacy: '/android/privacy.html'
    }[kind] ?? null;
  }
  if (code === 'zh-Hans') {
    return {
      home: '/zh/', features: '/zh/features/', notes: '/zh/ppt备注朗读/',
      rehearsal: '/zh/presentation-rehearsal/', privacy: '/zh/privacy.html',
      terms: '/zh/terms.html', androidPrivacy: '/android/zh/privacy.html',
      harmonyPrivacy: '/harmony/privacy.html'
    }[kind] ?? null;
  }
  const prefix = locales.find(locale => locale.code === code)?.prefix;
  if (!prefix) throw new Error(`Unsupported locale: ${code}`);
  const root = `/${prefix}/`;
  return {
    home: root, features: `${root}features/`, notes: `${root}notes-guide/`,
    rehearsal: `${root}rehearsal/`, privacy: `${root}privacy.html`,
    terms: `${root}terms.html`, androidPrivacy: `${root}android/privacy.html`,
    harmonyPrivacy: `${root}harmony/privacy.html`
  }[kind] ?? null;
}

export function localizedAlternates(kind) {
  return locales.flatMap(locale => {
    const path = route(kind, locale.code);
    return path ? [{ ...locale, path }] : [];
  });
}
