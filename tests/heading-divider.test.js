#!/usr/bin/env node
'use strict';
/*
 * Heading divider test: heading-divider-h3..h6 insert an ornament BEFORE a heading when the previous heading of the SAME level
 * has been seen and no higher-level heading came in between. Rules checked:
 *   - never before the first heading of a level; reset by a higher-level heading
 *   - only for levels with a configured divider; nothing by default
 *   - a divider is never left at the end of a column (it must be directly followed by its heading)
 *   - rendering a real chapter with all four dividers on terminates (Gold's 194f19c fixed an endless loop of exactly this kind)
 * Offline.   Usage: node tests/heading-divider.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, renderPage, makeChecker } = require('./lib/harness');

const para = n => `זהו פסקה מספר ${n} עם טקסט ארוך מספיק כדי למלא שורה אחת לפחות וכדי לאפשר בדיקה של סדר הכותרות והעיטורים בין הפסקאות השונות בטקסט הנבדק כאן.`;
const SAMPLE = [
  'כותרת 1 מספר 1 - ספר בדיקה',
  'כותרת 2 מספר 1 - סימן בדיקה',
  'כותרת 3 מספר 1 - אחת', para(1),
  'כותרת 3 מספר 2 - שתים', para(2),
  'כותרת 4 מספר 1 - שלוש', para(3),
  'כותרת 4 מספר 2 - ארבע', para(4),
  'כותרת 3 מספר 3 - חמש', para(5),
  'כותרת 4 מספר 3 - שש', para(6)
].join('\n');

const sequence = async page => page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.page-body-flow *').forEach(el => {
    const m = /(?:^|\s)title-level-(\d)(?:\s|$)/.exec(el.className || '');
    if (el.classList && el.classList.contains('h3-title-text')) out.push('H3'); // full-width H3 is rendered as .block-h3-span > .h3-title-text
    else if (m && el.getAttribute('data-token-id')) out.push('H' + m[1]);
    else if (el.classList && el.classList.contains('heading-divider-wrap')) out.push('D');
  });
  return out.join(',');
});

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const external = [];
  const { check, finish } = makeChecker();
  try {
    const probe = await renderPage(browser, baseUrl, SAMPLE, {}, external);
    const div = await probe.evaluate(() => Object.keys(SECTION_DIVIDERS)[0]);
    await probe.close();
    check('a built-in section divider exists for the test', !!div, 'SECTION_DIVIDERS is empty');

    const none = await renderPage(browser, baseUrl, SAMPLE, {}, external);
    check('default (all dividers none) renders no heading dividers', !(await sequence(none)).includes('D'), await sequence(none));
    await none.close();

    const p = await renderPage(browser, baseUrl, SAMPLE, { 'heading-divider-h3': div, 'heading-divider-h4': div }, external);
    const seq = await sequence(p);
    // expected: first H3 has none; 2nd H3 gets one; first H4 after an H3 has none (reset); 2nd H4 gets one; 3rd H3 gets one; H4 after H3 has none
    const hOnly = seq.split(',').filter(x => x.startsWith('H')).join(',');
    check('fixture renders all six headings in order', hOnly === 'H3,H3,H4,H4,H3,H4', hOnly);
    check('dividers appear exactly before the 2nd H3, the 2nd H4 and the 3rd H3', seq === 'H3,D,H3,H4,D,H4,D,H3,H4', seq);
    const orphan = await p.evaluate(() => Array.from(document.querySelectorAll('.heading-divider-wrap')).filter(d => {
      const n = d.nextElementSibling; return !(n && (/title-level-\d/.test(n.className) || n.classList.contains('block-h3-span')));
    }).length);
    check('every divider is directly followed by its heading (none left at a column end)', orphan === 0, `${orphan} orphan dividers`);
    await p.close();

    const only4 = await renderPage(browser, baseUrl, SAMPLE, { 'heading-divider-h4': div }, external);
    check('only configured levels get dividers (H4 only)', (await sequence(only4)) === 'H3,H3,H4,D,H4,H3,H4', await sequence(only4));
    await only4.close();

    // termination on a real chapter (18 H3/H4 headings) with every divider level active
    const chapter = fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch03.txt'), 'utf8');
    const all = { 'heading-divider-h3': div, 'heading-divider-h4': div, 'heading-divider-h5': div, 'heading-divider-h6': div };
    const t0 = Date.now();
    const race = await Promise.race([
      renderPage(browser, baseUrl, chapter, all, external).then(async pg => { const s = await sequence(pg); await pg.close(); return s; }),
      new Promise(r => setTimeout(() => r('TIMEOUT'), 150000))
    ]);
    check('real chapter with all heading dividers terminates (no endless loop)', race !== 'TIMEOUT', `no result after ${Math.round((Date.now() - t0) / 1000)}s`);
    if (race !== 'TIMEOUT') check('real chapter produced dividers', race.includes('D'), 'no dividers in output');
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
