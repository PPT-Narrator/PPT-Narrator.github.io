import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(root, "sitemap.xml");
const origin = "https://tingbo.app";
const today = new Date().toISOString().slice(0, 10);

const pairs = {
  home: { en: "/", zh: "/zh/" },
  features: { en: "/features/", zh: "/zh/features/" },
  notes: { en: "/how-to-read-ppt-notes-aloud/", zh: "/zh/ppt%E5%A4%87%E6%B3%A8%E6%9C%97%E8%AF%BB/" },
  rehearsal: { en: "/presentation-rehearsal/", zh: "/zh/presentation-rehearsal/" },
  privacy: { en: "/privacy.html", zh: "/zh/privacy.html" },
  terms: { en: "/terms.html", zh: "/zh/terms.html" }
};

const pages = [
  { url: "/", source: "index.html", pair: "home", video: "en" },
  { url: "/zh/", source: "zh/index.html", pair: "home", video: "zh" },
  { url: "/features/", source: "features/index.html", pair: "features" },
  { url: "/zh/features/", source: "zh/features/index.html", pair: "features" },
  { url: "/how-to-read-ppt-notes-aloud/", source: "how-to-read-ppt-notes-aloud/index.html", pair: "notes" },
  { url: "/zh/ppt%E5%A4%87%E6%B3%A8%E6%9C%97%E8%AF%BB/", source: "zh/ppt备注朗读/index.html", pair: "notes" },
  { url: "/presentation-rehearsal/", source: "presentation-rehearsal/index.html", pair: "rehearsal" },
  { url: "/zh/presentation-rehearsal/", source: "zh/presentation-rehearsal/index.html", pair: "rehearsal" },
  { url: "/privacy.html", source: "privacy.html", pair: "privacy" },
  { url: "/zh/privacy.html", source: "zh/privacy.html", pair: "privacy" },
  { url: "/terms.html", source: "terms.html", pair: "terms" },
  { url: "/zh/terms.html", source: "zh/terms.html", pair: "terms" },
  { url: "/harmony/privacy.html", source: "harmony/privacy.html" }
];

const videos = {
  en: {
    thumbnail: "/images/og-en.jpg",
    title: "How Tingbo reads PowerPoint speaker notes aloud",
    description: "See Tingbo browse slides, keep speaker notes synchronized, rotate to landscape, and start note playback on an iPhone."
  },
  zh: {
    thumbnail: "/images/og-zh.jpg",
    title: "听播逐页朗读 PPT 备注演示",
    description: "在 iPhone 上查看听播的幻灯片浏览、备注同步、横竖屏切换和讲稿播放功能。"
  }
};

function xml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function lastModified(source) {
  try {
    const dirty = execFileSync("git", ["status", "--porcelain", "--", source], { cwd: root, encoding: "utf8" }).trim();
    if (dirty) return today;

    const timestamp = execFileSync("git", ["log", "-1", "--format=%aI", "--", source], { cwd: root, encoding: "utf8" }).trim();
    return timestamp ? timestamp.slice(0, 10) : today;
  } catch {
    return today;
  }
}

function alternateLinks(page) {
  if (!page.pair) return [];
  const pair = pairs[page.pair];
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${origin}${pair.en}" />`,
    `    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${origin}${pair.zh}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${pair.en}" />`
  ];
}

function videoEntry(language) {
  const video = videos[language];
  if (!video) return [];
  return [
    "    <video:video>",
    `      <video:thumbnail_loc>${origin}${video.thumbnail}</video:thumbnail_loc>`,
    `      <video:title>${xml(video.title)}</video:title>`,
    `      <video:description>${xml(video.description)}</video:description>`,
    `      <video:content_loc>${origin}/demo.mp4</video:content_loc>`,
    "      <video:duration>32</video:duration>",
    "      <video:family_friendly>yes</video:family_friendly>",
    "    </video:video>"
  ];
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml"',
  '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">'
];

for (const page of pages) {
  lines.push("  <url>");
  lines.push(`    <loc>${origin}${page.url}</loc>`);
  lines.push(`    <lastmod>${lastModified(page.source)}</lastmod>`);
  lines.push(...alternateLinks(page));
  lines.push(...videoEntry(page.video));
  lines.push("  </url>");
}

lines.push("</urlset>", "");
const generated = lines.join("\n");

if (process.argv.includes("--check")) {
  const current = readFileSync(sitemapPath, "utf8");
  if (current !== generated) {
    console.error("sitemap.xml is out of date. Run npm run generate:sitemap.");
    process.exit(1);
  }
} else {
  writeFileSync(sitemapPath, generated);
  console.log(`Generated ${pages.length} sitemap entries.`);
}
