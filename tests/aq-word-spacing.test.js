#!/usr/bin/env node
'use strict';
/*
 * Word-spacing balance candidate (the "aq" idea from Gold, re-introduced as a MEASURED candidate):
 * after a two-column block is laid out, if the columns still differ by more than 2 px, the engine tries a small word-spacing
 * change on one paragraph (tall column tighter / short column looser, within +-aq-word-spacing-max em), MEASURES the result and
 * keeps it only if the difference shrinks and nothing overflows. Otherwise everything is restored.
 *   aq-word-spacing      : off by default (no change to existing books)
 *   aq-word-spacing-max  : largest word-spacing change in em (default 0.06)
 * Offline.   Usage: node tests/aq-word-spacing.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, startServer, renderPage, makeChecker } = require('./lib/harness');

const FILES = ['ch62.txt', 'ch73.txt', 'ch75.txt']; // each has a 5-6 px residual imbalance in the current engine
const facts = async page => page.evaluate(() => {
  const blocks = Array.from(document.querySelectorAll('.block-2col'));
  let totalDiff = 0, applied = 0, overflow = 0, maxWs = 0, worse = 0;
  blocks.forEach(b => {
    const r = b.querySelector('.right-col'), l = b.querySelector('.left-col'); if (!r || !l) return;
    const d = Math.abs(r.scrollHeight - l.scrollHeight);
    if (d <= 8) totalDiff += d; // only the small residuals the candidate is meant for
    const flow = b.closest('.page-body-flow'); if (flow && b.getBoundingClientRect().bottom > flow.getBoundingClientRect().bottom + 0.5) overflow++;
    if (b.getAttribute('data-layout-aq-word-spacing') === 'applied') {
      applied++;
      if (parseFloat(b.getAttribute('data-layout-aq-diff-after')) >= parseFloat(b.getAttribute('data-layout-aq-diff-before'))) worse++;
    }
    b.querySelectorAll('p').forEach(p => { const v = parseFloat(p.style.wordSpacing); if (isFinite(v)) maxWs = Math.max(maxWs, Math.abs(v)); });
  });
  return { blocks: blocks.length, totalDiff, applied, overflow, maxWs, worse };
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
    const defaults = JSON.parse(fs.readFileSync(path.join(root, 'default_settings.json'), 'utf8'));
    check('defaults: aq-word-spacing false, aq-word-spacing-max 0.06', defaults['aq-word-spacing'] === false && defaults['aq-word-spacing-max'] === '0.06', JSON.stringify([defaults['aq-word-spacing'], defaults['aq-word-spacing-max']]));
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    check('the UI has both controls', /id="aq-word-spacing"/.test(html) && /id="aq-word-spacing-max"/.test(html), 'controls missing');

    let off = { totalDiff: 0, applied: 0, overflow: 0, maxWs: 0, worse: 0 }, on = { totalDiff: 0, applied: 0, overflow: 0, maxWs: 0, worse: 0 };
    for (const f of FILES) {
      const text = fs.readFileSync(path.join(root, 'fixtures/chapters_focus', f), 'utf8');
      for (const [mode, ov, acc] of [['off', {}, off], ['on', { 'aq-word-spacing': true }, on]]) {
        const p = await renderPage(browser, baseUrl, text, ov, external);
        const x = await facts(p); await p.close();
        Object.keys(acc).forEach(k => { acc[k] = k === 'maxWs' ? Math.max(acc[k], x[k]) : acc[k] + x[k]; });
      }
    }
    check('off (default): the candidate never runs', off.applied === 0 && off.maxWs === 0, JSON.stringify(off));
    // Real chapters: the remaining imbalances of the engine are 5-6 px, i.e. less than one line. Word spacing can only add or remove
    // WHOLE lines, so it cannot improve them; the measured candidate must therefore leave them alone and never make anything worse.
    check('on (real chapters): never worse than off, nothing overflows', on.totalDiff <= off.totalDiff && on.worse === 0 && on.overflow === 0 && off.overflow === 0, `off=${off.totalDiff}px on=${on.totalDiff}px ${JSON.stringify({ worse: on.worse, overflowOn: on.overflow, overflowOff: off.overflow })}`);
    check('on (real chapters): word-spacing stays within the configured +-0.06em', on.maxWs <= 0.06 + 1e-6, `max ${on.maxWs}em`);

    // Controlled scenario: make the right column exactly one runt line taller (a last line with a single short word) and let the
    // candidate try to remove that line by tightening word spacing of the last paragraph.
    const text = fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch42.txt'), 'utf8');
    const scenario = async (stretchOnly, extraSettings) => {
      const p = await renderPage(browser, baseUrl, text, { 'aq-word-spacing': false, ...extraSettings }, external);
      const r = await p.evaluate(stretchOnly => {
        const blocks = Array.from(document.querySelectorAll('.block-2col')).filter(b => {
          const R = b.querySelector('.right-col'), L = b.querySelector('.left-col');
          return R && L && R.lastElementChild && R.lastElementChild.tagName === 'P' && L.lastElementChild && L.lastElementChild.tagName === 'P' && R.scrollHeight > 60 && Math.abs(R.scrollHeight - L.scrollHeight) <= 2;
        });
        const b = blocks[0]; const R = b.querySelector('.right-col'), L = b.querySelector('.left-col');
        const p = R.lastElementChild; const h0 = R.scrollHeight; let n = 0;
        // grow the paragraph word by word until it just gets one more line (the last line then holds one short word)
        while (R.scrollHeight <= h0 + 2 && n < 80) { p.appendChild(document.createTextNode(' א')); n++; } // append a text node: textContent would wipe the inline markup
        const heightsBefore = { r: R.scrollHeight, l: L.scrollHeight };
        document.getElementById('aq-word-spacing').checked = true;
        tryWordSpacingBalance(b, R, L, 100000, stretchOnly);
        return { n, heightsBefore, after: { r: R.scrollHeight, l: L.scrollHeight }, state: b.getAttribute('data-layout-aq-word-spacing'),
                 ws: parseFloat(b.getAttribute('data-layout-aq-ws')), dBefore: parseFloat(b.getAttribute('data-layout-aq-diff-before')), dAfter: parseFloat(b.getAttribute('data-layout-aq-diff-after')) };
      }, stretchOnly);
      await p.close(); return r;
    };
    const sc = await scenario(false, { 'aq-word-spacing-max': '0.1' });
    check('scenario: the block starts balanced and the added runt line makes the right column taller', sc.heightsBefore.r - sc.heightsBefore.l > 10, JSON.stringify(sc));
    check('scenario: the candidate removes the runt line (word spacing tightened)', sc.state === 'applied' && sc.ws < 0 && sc.dAfter < sc.dBefore, JSON.stringify(sc));
    check('scenario: the block did not grow', Math.max(sc.after.r, sc.after.l) <= Math.max(sc.heightsBefore.r, sc.heightsBefore.l) + 0.5, JSON.stringify(sc));
    const so = await scenario(true, { 'aq-word-spacing-max': '0.1' });
    check('scenario, stretch-only mode (chapter end): a taller column is never tightened', so.state !== 'applied' || so.ws > 0, JSON.stringify(so));
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (err) {
    check('test run completed', false, err.message);
  } finally {
    await browser.close(); server.close();
  }
  process.exit(finish());
})();
