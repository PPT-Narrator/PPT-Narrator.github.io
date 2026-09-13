import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = execFileSync("git", ["ls-files", "-z", "--", "*.html"], {
  cwd: root,
  encoding: "utf8"
}).split("\0").filter(Boolean);
const source = "https://static.cloudflareinsights.com/beacon.min.js";
const token = "1afbc61212cf4e1c8385cf85122aefff";
let checked = 0;

for (const file of files) {
  const html = readFileSync(new URL(file, new URL("../", import.meta.url)), "utf8");
  if (!/<body\b/i.test(html)) continue; // Search-engine verification files are not pages.
  const beacons = [...html.matchAll(/<script\b[^>]*\bdata-cf-beacon='([^']+)'[^>]*><\/script>/g)];
  assert.equal(beacons.length, 1, `${file}: expected one analytics beacon`);
  assert.equal(html.split(source).length - 1, 1, `${file}: duplicate beacon source`);
  assert.equal(JSON.parse(beacons[0][1]).token, token, `${file}: wrong site token`);
  assert.ok(beacons[0][0].includes(`src="${source}"`), `${file}: wrong beacon source`);
  assert.ok(beacons[0][0].includes('type="module"'), `${file}: use the dashboard-provided module snippet`);
  assert.ok(beacons[0].index < html.lastIndexOf("</body>"), `${file}: beacon must be inside body`);
  checked++;
}

assert.ok(checked > 0, "No HTML pages found");
console.log(`Analytics verified on ${checked} HTML pages.`);
