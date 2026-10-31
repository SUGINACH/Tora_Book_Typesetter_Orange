#!/usr/bin/env node
'use strict';
/*
 * Renderer asset test: the renderer (the iframe in the UI, renderer.html in the CLI) must load the JSON ornament assets itself,
 * because the UI window only hands it text + settings. Before the fix, window.onload returned early in renderer mode, so an
 * ornament chosen from the JSON files (e.g. orn_ud_022) was never available and silently did not render.
 * The typeset message is posted immediately after load, so this also proves that typesetting waits for the assets.   Offline.
 * Usage: node tests/renderer-assets.test.js
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
  const ids = JSON.parse(fs.readFileSync(path.join(root, 'ornaments_up_down.json'), 'utf8')).map(x => x.id);
  try {
    check('fixture JSON contains orn_ud_022', ids.includes('orn_ud_022'), `first ids: ${ids.slice(0, 3)}`);
    const page = await renderPage(browser, baseUrl, text, { 'h2-auto-siman': true, 'h2-ornament-top-style': 'orn_ud_022', 'h2-ornament-bottom-style': 'orn_ud_022' }, external);
    const f = await page.evaluate(() => ({
      udCount: Object.keys(ORNAMENTS_UD).length,
      registered: !!ORNAMENTS_UD['orn_ud_022'],
      assetsFlag: window.__rendererAssetsLoaded === true,
      topWraps: document.querySelectorAll('.h2-ornament-top .heading-ornament-wrap').length,
      bottomWraps: document.querySelectorAll('.h2-ornament-bottom .heading-ornament-wrap').length
    }));
    await page.close();
    check('JSON up/down ornaments are registered in the renderer', f.udCount > 100 && f.registered, `ORNAMENTS_UD has ${f.udCount} entries, orn_ud_022 registered=${f.registered}`);
    check('renderer reports that its assets are loaded', f.assetsFlag, 'window.__rendererAssetsLoaded is not true');
    check('H2 top ornament chosen from JSON is rendered', f.topWraps >= 1, `top ornaments: ${f.topWraps}`);
    check('H2 bottom ornament chosen from JSON is rendered', f.bottomWraps >= 1, `bottom ornaments: ${f.bottomWraps}`);
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
