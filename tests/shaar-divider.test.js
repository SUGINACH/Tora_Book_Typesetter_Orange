#!/usr/bin/env node
'use strict';
/*
 * Shaar divider test: shaar-main-divider / shaar-sub-divider replace the built-in ornament on the main title page and on the
 * sub title page (a divider asset from section_dividers.json); 'none' keeps the built-in SVG.   Offline.
 * Usage: node tests/shaar-divider.test.js
 */
const { startServer, renderPage, makeChecker } = require('./lib/harness');
const TEXT = ['כותרת 1 מספר 1 - ספר בדיקה - חלק ראשון', 'כותרת 2 מספר 1 - סימן בדיקה',
  'זהו פסקה לבדיקה עם טקסט ארוך מספיק כדי להופיע בעמוד התוכן של המסמך הנבדק כאן ולמלא שורה אחת לפחות.'].join('\n');

const facts = async page => page.evaluate(() => {
  const main = document.querySelector('.shaar-main-content');
  const sub = document.querySelector('[data-shaar-type="sub"]');
  const q = (root, sel) => root ? root.querySelectorAll(sel).length : -1;
  return {
    mainFound: !!main, subFound: !!sub,
    mainDivider: q(main, '.heading-divider-wrap'), mainDefaultSvg: q(main, 'svg[viewBox="0 0 400 40"]'),
    subDivider: q(sub, '.heading-divider-wrap'), subDefaultSvg: q(sub, 'svg[viewBox="0 0 300 30"]')
  };
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
    const probe = await renderPage(browser, baseUrl, TEXT, {}, external);
    const div = await probe.evaluate(() => Object.keys(SECTION_DIVIDERS)[0]);
    await probe.close();
    const none = await renderPage(browser, baseUrl, TEXT, {}, external);
    const a = await facts(none); await none.close();
    check('fixture renders a main title page and a sub title page', a.mainFound && a.subFound, JSON.stringify(a));
    check('default (none) keeps the built-in main ornament', a.mainDefaultSvg === 1 && a.mainDivider === 0, JSON.stringify(a));
    check('default (none) keeps the built-in sub ornament', a.subDefaultSvg === 1 && a.subDivider === 0, JSON.stringify(a));
    const on = await renderPage(browser, baseUrl, TEXT, { 'shaar-main-divider': div, 'shaar-sub-divider': div }, external);
    const b = await facts(on); await on.close();
    check('shaar-main-divider replaces the built-in main ornament', b.mainDivider === 1 && b.mainDefaultSvg === 0, JSON.stringify(b));
    check('shaar-sub-divider replaces the built-in sub ornament', b.subDivider === 1 && b.subDefaultSvg === 0, JSON.stringify(b));
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
