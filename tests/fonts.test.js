#!/usr/bin/env node
'use strict';
/*
 * Fonts test: every font that the UI can offer must exist and must decode in the browser.
 *   1. each file named in fonts/fonts.json, fonts-extended.json and fonts-priority.json exists in fonts/
 *   2. each url('fonts/...') in fonts-def.css and fonts-extended.css exists
 *   3. every font file in fonts/ loads through the FontFace API (a corrupt file silently falls back to another font)
 * Offline.   Usage: node tests/fonts.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, makeChecker } = require('./lib/harness');
const { check, finish } = makeChecker();

const fontsDir = path.join(root, 'fonts');
const present = new Set(fs.readdirSync(fontsDir).filter(f => /\.(woff2?|ttf|otf)$/i.test(f)));
const listed = new Set();
for (const f of ['fonts/fonts.json', 'fonts-extended.json', 'fonts-priority.json']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  (Array.isArray(d) ? d : Object.values(d)).forEach(x => { if (x && x.file) listed.add(x.file); });
}
const cssRefs = new Set();
for (const f of ['fonts-def.css', 'fonts-extended.css']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/url\(\s*['"]?fonts\/([^'")]+)['"]?\s*\)/g)) cssRefs.add(decodeURIComponent(m[1]));
}
const missingListed = [...listed].filter(f => !present.has(f));
const missingCss = [...cssRefs].filter(f => !present.has(f));
check('fonts named in the JSON lists exist', missingListed.length === 0, missingListed.slice(0, 5).join(', '));
check('fonts referenced by the CSS files exist', missingCss.length === 0, missingCss.slice(0, 5).join(', '));

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(baseUrl + '/tests/fixtures/ornament-geometry-smoke.txt');
    const files = [...present];
    const bad = await page.evaluate(async ({ files, baseUrl }) => {
      const bad = []; let i = 0;
      const worker = async () => {
        while (i < files.length) {
          const f = files[i++];
          try {
            const ff = new FontFace('scan' + i, `url(${baseUrl}/fonts/${encodeURIComponent(f)})`);
            await Promise.race([ff.load(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000))]);
          } catch (e) { bad.push(f); }
        }
      };
      await Promise.all(Array.from({ length: 12 }, worker));
      return bad;
    }, { files, baseUrl });
    check(`all ${files.length} font files in fonts/ decode in the browser`, bad.length === 0, `${bad.length} fail: ${bad.slice(0, 6).join(', ')}`);
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
