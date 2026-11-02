#!/usr/bin/env node
'use strict';
/*
 * End-to-end UI test: the real index.html with its iframe renderer, exactly as the published GitHub Pages site serves it
 * (static files, no build). It checks what the renderer-only tests cannot: that the UI window and the iframe work together
 * (settings travel by postMessage, JSON assets are loaded in BOTH windows, the new controls are populated and effective).
 * Offline: any request to a non-local host fails the test.   Usage: node tests/ui-e2e.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, makeChecker } = require('./lib/harness');

const TEXT = 'כותרת 1 מספר 1 - הקדמות וכללים - יום השבת\n' + fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch42.txt'), 'utf8');

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const { check, finish } = makeChecker();
  const external = [], pageErrors = [], consoleErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith('http://127.0.0.1:') || /^(data|blob|about):/.test(u)) return route.continue();
      external.push(u); return route.abort();
    });
    page.on('pageerror', e => pageErrors.push(String(e.message || e).slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
    await page.addInitScript(() => { window.__renderDone = 0; window.addEventListener('message', e => { if (e.data && e.data.type === 'render-done') window.__renderDone++; }); });
    await page.goto(baseUrl + '/index.html', { waitUntil: 'load', timeout: 180000 });
    // the renderer (iframe) must have loaded its JSON assets; typesetDocument() queues the request until the renderer is ready
    await page.waitForFunction(() => window.frames.length > 0 && window.frames[0].__rendererAssetsLoaded === true, null, { timeout: 180000 });
    check('UI loads and the iframe renderer finished loading its assets', true, '');

    const frame = () => page.frames().find(f => f !== page.mainFrame());
    // ---- the new controls exist and are populated from the JSON assets (the UI window loads them asynchronously: wait for the biggest list)
    await page.waitForFunction(() => document.querySelectorAll('#h2-ornament-top-style option').length > 100, null, { timeout: 120000 });
    const counts = await page.evaluate(() => {
      const n = id => document.querySelectorAll('#' + id + ' option').length;
      return { div3: n('heading-divider-h3'), div6: n('heading-divider-h6'), shaarMain: n('shaar-main-divider'), shaarSub: n('shaar-sub-divider'),
               h2top: n('h2-ornament-top-style'), scope: n('h2-orn-scope'), h1mode: n('hdr-h1-title-mode'), h1modeValue: document.getElementById('hdr-h1-title-mode').value };
    });
    check('heading divider selects are populated from JSON (levels 3 and 6)', counts.div3 > 10 && counts.div6 > 10, JSON.stringify(counts));
    check('shaar divider selects are populated from JSON', counts.shaarMain > 10 && counts.shaarSub > 10, JSON.stringify(counts));
    check('H2 ornament select lists JSON ornaments', counts.h2top > 100, JSON.stringify(counts));
    check('h2-orn-scope has 3 options and hdr-h1-title-mode defaults to "main" in the UI', counts.scope === 3 && counts.h1mode === 2 && counts.h1modeValue === 'main', JSON.stringify(counts));

    // ---- helper: change UI controls, typeset through the UI, wait until the iframe finished and is stable
    const typeset = async (controls, textOverride) => {
      const before = await page.evaluate(() => window.__renderDone);
      await page.evaluate(({ text, controls }) => {
        document.getElementById('raw-input').value = text;
        Object.entries(controls).forEach(([id, v]) => {
          const el = document.getElementById(id); if (!el) throw new Error('missing control ' + id);
          if (el.type === 'checkbox') el.checked = !!v; else el.value = v;
        });
        typesetDocument();
      }, { text: textOverride || TEXT, controls });
      await page.waitForFunction(b => window.__renderDone > b, before, { timeout: 240000 });
      let last = -1, stable = 0;
      for (let i = 0; i < 60 && stable < 3; i++) { // stable = no further render-done for 3 polls
        await page.waitForTimeout(700);
        const cur = await page.evaluate(() => window.__renderDone);
        stable = cur === last ? stable + 1 : 0; last = cur;
      }
    };
    const headerC = async () => frame().evaluate(() => Array.from(document.querySelectorAll('.top-header-grid .header-col-c')).map(e => e.textContent.trim()).find(x => x.includes('הקדמות')) || '');

    // ---- default H1 header text (editor decision: only the part before the first dash)
    await typeset({ 'h2-auto-siman': true });
    const pages = await frame().evaluate(() => document.querySelectorAll('.a4-page').length);
    check('typesetting through the UI renders pages in the iframe', pages >= 5, `pages=${pages}`);
    const c1 = await headerC();
    check('default: header shows only the part of H1 before the first dash', c1.includes('הקדמות וכללים') && !/-\s*יום/.test(c1), `C='${c1}'`);
    await typeset({ 'hdr-h1-title-mode': 'full' });
    const c2 = await headerC();
    check('UI select "full" shows the whole H1 text', /הקדמות וכללים\s*-\s*יום השבת/.test(c2), `C='${c2}'`);

    // ---- JSON ornament chosen in the UI reaches the iframe (the bug fixed in 4F)
    const jsonInIframe = await frame().evaluate(() => Object.keys(ORNAMENTS_UD).length);
    check('iframe has the JSON ornaments registered', jsonInIframe > 100, `ORNAMENTS_UD in iframe: ${jsonInIframe}`);
    await typeset({ 'h2-ornament-top-style': 'orn_ud_022', 'h2-ornament-bottom-style': 'orn_ud_022', 'h2-auto-siman': true });
    const orn = await frame().evaluate(() => document.querySelectorAll('.h2-ornament-top .heading-ornament-wrap').length);
    check('H2 ornament chosen from the UI list is rendered', orn >= 1, `top ornaments: ${orn}`);

    // ---- a heading divider chosen in the UI is rendered
    // a thin divider (aspect 17:1). About a third of the JSON dividers are near-square and taller than a page; the engine refuses those on purpose.
    const divId = 'ext_393___down_svg';
    check('the chosen divider is offered by the UI list', await page.evaluate(id => !!document.querySelector('#heading-divider-h3 option[value="' + id + '"]'), divId), divId);
    // ch42 has no consecutive headings of the same level, so use ch03 (18 H3/H4 headings) for this step
    await typeset({ 'heading-divider-h3': divId, 'heading-divider-h4': divId }, fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch03.txt'), 'utf8'));
    const dividers = await frame().evaluate(() => document.querySelectorAll('.heading-divider-wrap').length);
    check('heading divider chosen from the UI list is rendered', dividers >= 1, `dividers: ${dividers} (id ${divId})`);

    // ---- file:// is not supported (editor decision): opening index.html directly must say so, a local server must not
    const httpBanner = await page.evaluate(() => { const b = document.getElementById('file-protocol-warning'); return !!b && getComputedStyle(b).display !== 'none'; });
    check('over http the unsupported-file:// warning is hidden', httpBanner === false, `visible=${httpBanner}`);
    const filePage = await browser.newPage();
    await filePage.goto('file://' + path.join(root, 'index.html'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const fileBanner = await filePage.evaluate(() => { const b = document.getElementById('file-protocol-warning'); return b ? { shown: getComputedStyle(b).display !== 'none', text: b.textContent.trim().slice(0, 60) } : null; });
    await filePage.close();
    check('opened as file:// the page shows the "local server only" warning', !!fileBanner && fileBanner.shown, JSON.stringify(fileBanner));

    check('no page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
    check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
