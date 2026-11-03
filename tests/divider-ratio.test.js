#!/usr/bin/env node
'use strict';
/*
 * Divider ratio test: heading dividers can be resized without editing the asset.
 *   heading-divider-width  : width in percent of the column (default 40)
 *   heading-divider-ratio  : 'auto' (natural proportions, default) or a number = width:height (e.g. 8 -> 8:1); the SVG is stretched to it
 * A near-square JSON divider (ext_013_b_svg, ~1000 px tall at natural proportions) is refused by the engine in 'auto' mode and
 * becomes usable with a ratio.   Offline.   Usage: node tests/divider-ratio.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, renderPage, makeChecker } = require('./lib/harness');

const para = n => `זהו פסקה מספר ${n} עם טקסט ארוך מספיק כדי למלא שורה אחת לפחות וכדי לאפשר בדיקה של סדר הכותרות והעיטורים בין הפסקאות השונות בטקסט הנבדק כאן.`;
const SAMPLE = ['כותרת 1 מספר 1 - ספר בדיקה', 'כותרת 2 מספר 1 - סימן בדיקה',
  'כותרת 3 מספר 1 - אחת', para(1), 'כותרת 3 מספר 2 - שתים', para(2), 'כותרת 3 מספר 3 - שלוש', para(3)].join('\n');
const TALL = 'ext_013_b_svg';

const dividers = async page => page.evaluate(() => Array.from(document.querySelectorAll('.heading-divider-wrap')).map(d => {
  const r = d.getBoundingClientRect(); const pr = d.parentElement.getBoundingClientRect();
  return { w: r.width, h: r.height, parentW: pr.width };
}));

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const external = [];
  const { check, finish } = makeChecker();
  const run = async ov => { const p = await renderPage(browser, baseUrl, SAMPLE, { 'heading-divider-h3': TALL, ...ov }, external); const d = await dividers(p); await p.close(); return d; };
  try {
    const defaults = JSON.parse(fs.readFileSync(path.join(root, 'default_settings.json'), 'utf8'));
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    check('defaults: width 40, ratio auto', defaults['heading-divider-width'] === '40' && defaults['heading-divider-ratio'] === 'auto', JSON.stringify([defaults['heading-divider-width'], defaults['heading-divider-ratio']]));
    check('the UI has both controls', /id="heading-divider-width"/.test(html) && /id="heading-divider-ratio"/.test(html), 'controls missing');

    const auto = await run({});
    check("'auto' keeps natural proportions: the ~1000 px divider is refused (no divider, no endless loop)", auto.length === 0, `dividers: ${auto.length}`);
    const r8 = await run({ 'heading-divider-ratio': '8' });
    check('ratio 8 makes the same divider usable', r8.length >= 1, `dividers: ${r8.length}`);
    check('the rendered divider has the requested 8:1 proportion', r8.length >= 1 && r8.every(d => Math.abs(d.w / d.h - 8) < 0.25), JSON.stringify(r8.map(d => Math.round(d.w / d.h * 100) / 100)));
    const w20 = await run({ 'heading-divider-ratio': '8', 'heading-divider-width': '20' });
    check('heading-divider-width sets the width as a percentage of the column', w20.length >= 1 && w20.every(d => Math.abs(d.w / d.parentW - 0.2) < 0.02), JSON.stringify(w20.map(d => Math.round(d.w / d.parentW * 1000) / 1000)));
    const bad = await run({ 'heading-divider-ratio': 'abc' });
    check('an invalid ratio falls back to auto without errors', bad.length === 0, `dividers: ${bad.length}`);
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
