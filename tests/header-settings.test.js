#!/usr/bin/env node
'use strict';
/*
 * Header behaviour test: settings offered by the UI for the running header must have an effect.
 *  - same_as_even (primary/odd-page slot) must resolve to the verso (even-page) type instead of rendering an empty slot.
 *  - hdr-h1-title-mode: 'full' keeps the whole H1 text in the header (default), 'main' keeps only the part before the first dash.
 * Offline; fails on any external request.   Usage: node tests/header-settings.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, renderPage, makeChecker } = require('./lib/harness');

async function headers(browser, baseUrl, text, overrides, external) {
  const page = await renderPage(browser, baseUrl, text, overrides, external);
  const rows = await page.evaluate(() => Array.from(document.querySelectorAll('.top-header-grid')).map(g => {
    const t = s => (g.querySelector(s)?.textContent || '').trim();
    return { parity: g.dataset.headerParity, r: t('.header-col-r'), c: t('.header-col-c'), l: t('.header-col-l') };
  }));
  await page.close();
  return rows;
}
const first = (rows, parity) => rows.find(r => r.parity === parity);

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const external = [];
  const { check, finish } = makeChecker();
  const text = 'כותרת 1 מספר 1 - הקדמות וכללים - יום השבת\n' + fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch42.txt'), 'utf8');
  try {
    const distinct = { 'hdr-distinct-even-odd': true, 'hdr-verso-r-type': 'h2', 'hdr-verso-c-type': 'same_as_odd', 'hdr-verso-l-type': 'same_as_odd' };

    // 1. regression guard: verso type differs from the odd-page type when set explicitly.
    const d = await headers(browser, baseUrl, text, distinct, external);
    const dOdd = first(d, 'odd'), dEven = first(d, 'even');
    check('distinct even/odd: verso R uses its own type', !!dOdd && !!dEven && dEven.r !== dOdd.r && dEven.r !== '', `odd R='${dOdd?.r}' even R='${dEven?.r}'`);

    // 2. same_as_even on the odd-page slot must resolve to the verso type (R: h2).
    const e = await headers(browser, baseUrl, text, { ...distinct, 'hdr-r-type': 'same_as_even' }, external);
    const eOdd = first(e, 'odd'), eEven = first(e, 'even');
    check('same_as_even resolves to the verso type on odd pages', !!eOdd && !!eEven && eOdd.r !== '' && eOdd.r === eEven.r, `odd R='${eOdd?.r}' even R='${eEven?.r}'`);

    // 3. same_as_even <-> same_as_odd cycle must not crash and must leave the slot empty (documented behaviour).
    const c = await headers(browser, baseUrl, text, { ...distinct, 'hdr-r-type': 'same_as_even', 'hdr-verso-r-type': 'same_as_odd' }, external);
    check('same_as_even/same_as_odd cycle renders an empty slot without error', !!first(c, 'odd') && first(c, 'odd').r === '', `odd R='${first(c, 'odd')?.r}'`);

    // 4. hdr-h1-title-mode: default 'full' keeps the dash part, 'main' removes it.
    const full = await headers(browser, baseUrl, text, {}, external);
    const main = await headers(browser, baseUrl, text, { 'hdr-h1-title-mode': 'main' }, external);
    const fullC = full.map(r => r.c).find(x => x.includes('הקדמות')) || '';
    const mainC = main.map(r => r.c).find(x => x.includes('הקדמות')) || '';
    check("hdr-h1-title-mode default shows the full H1 text", /הקדמות וכללים\s*-\s*יום השבת/.test(fullC), `C='${fullC}'`);
    check("hdr-h1-title-mode='main' keeps only the part before the first dash", mainC.includes('הקדמות וכללים') && !/-\s*יום/.test(mainC), `C='${mainC}'`);
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
