#!/usr/bin/env node
'use strict';
/*
 * H2 ornament scope test: h2-orn-scope decides where the top/bottom ornaments of an H2 block are placed relative to the
 * siman badge and the title:  both -> [top, siman, title, bottom];  siman_only -> [top, siman, bottom, title];
 * title_only -> [siman, top, title, bottom].   Offline.   Usage: node tests/h2-ornament-scope.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, renderPage, makeChecker } = require('./lib/harness');

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const external = [];
  const { check, finish } = makeChecker();
  const text = fs.readFileSync(path.join(root, 'tests/fixtures/ornament-geometry-smoke.txt'), 'utf8');
  try {
    const probe = await renderPage(browser, baseUrl, text, {}, external);
    const style = await probe.evaluate(() => Object.keys(ORNAMENTS_UD)[0]);
    await probe.close();
    check('a built-in up/down ornament exists for the test', !!style, 'ORNAMENTS_UD is empty');
    const order = async scope => {
      const page = await renderPage(browser, baseUrl, text, { 'h2-auto-siman': true, 'h2-ornament-top-style': style, 'h2-ornament-bottom-style': style, 'h2-orn-scope': scope }, external);
      const seq = await page.evaluate(() => {
        const top = document.querySelector('.h2-ornament-top'); if (!top) return null;
        const kind = el => el.classList.contains('h2-ornament-top') ? 'top' : el.classList.contains('h2-ornament-bottom') ? 'bottom'
          : el.classList.contains('h2-siman-badge') ? 'siman' : /title-level-2/.test(el.className) ? 'title' : null;
        return Array.from(top.parentNode.children).map(kind).filter(Boolean);
      });
      await page.close();
      return seq;
    };
    const expected = { both: 'top,siman,title,bottom', siman_only: 'top,siman,bottom,title', title_only: 'siman,top,title,bottom' };
    for (const [scope, exp] of Object.entries(expected)) {
      const got = await order(scope);
      check(`h2-orn-scope=${scope} places ornaments as ${exp}`, !!got && got.join(',') === exp, `got ${got ? got.join(',') : 'no ornament'}`);
    }
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
