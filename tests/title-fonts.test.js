#!/usr/bin/env node
'use strict';
/*
 * Title font / spacing test for the settings that used to have no effect:
 *   f-h0 / s-h0    font and size of the H0 (introduction) opening title
 *   f-h1 / s-h1    font and size of the sub-title page (H1 in "sub_shaar" mode)
 *   prop-mt-h2     top margin of a standalone H2 title
 * Defaults must reproduce the look from before these settings were connected (H0 title = H2 title size 17pt;
 * sub-title page title 36pt "Lia Sgula"; H2 top margin 0).   Offline.   Usage: node tests/title-fonts.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, renderPage, makeChecker } = require('./lib/harness');

const TEXT = ['כותרת 0 מספר 1 - הקדמת המחבר', 'פסקת הקדמה עם טקסט ארוך מספיק כדי למלא שורה אחת לפחות ולאפשר מדידה של הגופנים.',
  'כותרת 1 מספר 1 - שער פרק - משנה', 'כותרת 2 מספר 1 - סימן', 'פסקה לבדיקה עם טקסט ארוך מספיק כדי למלא שורה אחת לפחות ולאפשר מדידה.'].join('\n');

const measure = async page => page.evaluate(() => {
  const leaf = txt => Array.from(document.querySelectorAll('.a4-page *')).filter(e => !e.closest('.top-header-grid') && e.children.length === 0 && (e.textContent || '').trim() === txt)[0];
  const cs = e => e ? { ff: getComputedStyle(e).fontFamily, px: parseFloat(getComputedStyle(e).fontSize), mt: getComputedStyle(e).marginTop } : null;
  return { h0: cs(leaf('הקדמת המחבר')), h1: cs(leaf('שער פרק')), h2: cs(leaf('סימן')) };
});

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const external = [];
  const { check, finish } = makeChecker();
  const render = async ov => { const p = await renderPage(browser, baseUrl, TEXT, ov, external); const m = await measure(p); await p.close(); return m; };
  try {
    const defaults = JSON.parse(fs.readFileSync(path.join(root, 'default_settings.json'), 'utf8'));
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const uiValue = id => (new RegExp('id="' + id + '"[^>]*value="([^"]*)"').exec(html) || [])[1];
    check('defaults keep the existing look (s-h0=17, s-h1=36, prop-mt-h2=0) in default_settings.json', defaults['s-h0'] === '17' && defaults['s-h1'] === '36' && defaults['prop-mt-h2'] === '0', JSON.stringify({ h0: defaults['s-h0'], h1: defaults['s-h1'], mt: defaults['prop-mt-h2'] }));
    check('the UI inputs carry the same defaults', uiValue('s-h0') === '17' && uiValue('s-h1') === '36' && uiValue('prop-mt-h2') === '0', JSON.stringify({ h0: uiValue('s-h0'), h1: uiValue('s-h1'), mt: uiValue('prop-mt-h2') }));

    const d = await render({});
    check('default H0 title looks like an H2 title (17pt)', !!d.h0 && !!d.h2 && Math.abs(d.h0.px - d.h2.px) < 0.01 && Math.abs(d.h0.px - 17 * 4 / 3) < 0.01, JSON.stringify(d.h0));
    check('default sub-title page title is 36pt Lia Sgula', !!d.h1 && Math.abs(d.h1.px - 48) < 0.01 && /Lia Sgula/.test(d.h1.ff), JSON.stringify(d.h1));
    check('default H2 top margin is 0', !!d.h2 && d.h2.mt === '0px', JSON.stringify(d.h2));

    const c = await render({ 'f-h0': 'Rubik', 's-h0': '30', 'f-h1': 'Rubik', 's-h1': '44', 'prop-mt-h2': '30' });
    check('f-h0 / s-h0 change the H0 title', !!c.h0 && /Rubik/.test(c.h0.ff) && Math.abs(c.h0.px - 40) < 0.01, JSON.stringify(c.h0));
    check('f-h1 / s-h1 change the sub-title page title', !!c.h1 && /Rubik/.test(c.h1.ff) && Math.abs(c.h1.px - 58.6667) < 0.01, JSON.stringify(c.h1));
    check('prop-mt-h2 changes the H2 top margin', !!c.h2 && c.h2.mt === '30px', JSON.stringify(c.h2));
    check('changing the H0 settings does not change the H2 title', !!c.h2 && !!d.h2 && Math.abs(c.h2.px - d.h2.px) < 0.01, `h2 default ${d.h2 && d.h2.px}px, h2 changed ${c.h2 && c.h2.px}px`);
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
