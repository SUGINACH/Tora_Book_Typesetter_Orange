#!/usr/bin/env node
'use strict';
/*
 * Chapter-end balancing test: balance-chapter-end = 'balance' (default) balances the two columns of the last block of a chapter;
 * 'fill' keeps the page-fill order (right column full, then left) when the block fits.   Offline.
 * Usage: node tests/chapter-end.test.js
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
  const text = fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch42.txt'), 'utf8');
  const skipped = async (ov) => {
    const page = await renderPage(browser, baseUrl, text, ov, external);
    const n = await page.evaluate(() => document.querySelectorAll('[data-layout-balance-skip-reason="balance-disabled-by-chapter-end-fill-policy"]').length);
    await page.close(); return n;
  };
  try {
    const defaults = JSON.parse(fs.readFileSync(path.join(root, 'default_settings.json'), 'utf8'));
    check('default_settings.json has balance-chapter-end = "balance"', defaults['balance-chapter-end'] === 'balance', `value=${defaults['balance-chapter-end']}`);
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    check('index.html has the balance-chapter-end select with both options', /id="balance-chapter-end"/.test(html) && /<option value="fill"/.test(html) && /<option value="balance"/.test(html), 'control missing');
    const bal = await skipped({ 'balance-chapter-end': 'balance' });
    check('balance: no block is left unbalanced by the fill policy', bal === 0, `blocks skipped: ${bal}`);
    const fill = await skipped({ 'balance-chapter-end': 'fill' });
    check('fill: the last block of the chapter keeps page-fill order', fill >= 1, `blocks skipped: ${fill}`);
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
