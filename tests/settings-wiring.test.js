#!/usr/bin/env node
'use strict';
/*
 * Settings wiring test.
 * Purpose: a setting that is present in default_settings.json / the UI but never read by the engine is a silent defect.
 * For each setting below, the test renders a small fixture twice (setting A vs setting B) and requires an observable DOM
 * difference of the kind the setting promises. It runs offline (only 127.0.0.1) and fails on any external request.
 * Usage: node tests/settings-wiring.test.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf', '.otf':'font/otf', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.txt':'text/plain; charset=utf-8', '.ico':'image/x-icon' };

function startServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const target = path.resolve(root, '.' + pathname);
    if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    fs.stat(target, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404).end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(target).pipe(res);
    });
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function render(browser, baseUrl, text, overrides, external) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1:') || /^(data|blob|about):/.test(u)) return route.continue();
    external.push(u); return route.abort();
  });
  await page.goto(baseUrl + '/renderer.html', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__isRenderer === true && typeof window.__geomAudit?.audit === 'function', null, { timeout: 120000 });
  const settings = Object.assign(JSON.parse(fs.readFileSync(path.join(root, 'default_settings.json'), 'utf8')), overrides);
  await page.evaluate(({ text, settings }) => new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('render timeout')), 240000);
    window.addEventListener('message', e => {
      const m = e.data; if (!m || typeof m !== 'object') return;
      if (m.type === 'render-error') { clearTimeout(t); reject(new Error(m.error || 'render-error')); }
      if (m.type === 'render-done') { clearTimeout(t); resolve(); }
    });
    window.postMessage({ type: 'typeset', text, settings }, '*');
  }), { text, settings });
  const facts = await page.evaluate(() => {
    const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; };
    const footers = Array.from(document.querySelectorAll('.page-number-footer')).map(e => e.textContent.trim());
    const pEnd = document.querySelector('p.p-end');
    return {
      footers,
      shownNumbers: footers.filter(Boolean).length,
      pageCount: document.querySelectorAll('.a4-page').length,
      lastLineAlignVar: document.documentElement.style.getPropertyValue('--last-line-align').trim(),
      pEndTextAlignLast: pEnd ? getComputedStyle(pEnd).textAlignLast : null,
      domHash: hash(document.body.innerHTML)
    };
  });
  await page.close();
  return facts;
}

(async () => {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) { console.error('playwright is not installed'); process.exit(2); }
  const server = await startServer();
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true });
  const external = [];
  const small = fs.readFileSync(path.join(root, 'tests/fixtures/ornament-geometry-smoke.txt'), 'utf8');
  const prose = fs.readFileSync(path.join(root, 'fixtures/chapters_focus/ch42.txt'), 'utf8');
  const results = [];
  const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  ::  ' + detail)); };
  try {
    const numeric = { 'page-num-format': 'numeric', 'page-num-position': 'bottom_center' };
    // default_settings.json does not carry the TOC level selectors (they are checkbox classes in the UI), so without them no TOC page is rendered.
    const tocOn = { 'gtoc-shows': '1,2,3', 'gtoc-groups': '', 'dtoc-shows': '1,2,3', 'dtoc-groups': '' };

    // 1. page-num-initial-value: the first counted page must carry the configured value.
    const a1 = await render(browser, baseUrl, small, { ...numeric, 'page-num-initial-value': '1' }, external);
    const a87 = await render(browser, baseUrl, small, { ...numeric, 'page-num-initial-value': '87' }, external);
    const nums = f => f.footers.filter(x => /^\d+$/.test(x)).map(Number);
    const n1 = nums(a1), n87 = nums(a87);
    check('page-num-initial-value shifts numbering by 86', n1.length > 0 && n1.length === n87.length && n87.every((v, i) => v === n1[i] + 86), `initial=1 -> [${n1}] ; initial=87 -> [${n87}]`);

    // 2. TOC show-numbering (general + detailed): turning it off must remove page numbers from the TOC pages.
    const base = await render(browser, baseUrl, small, { ...numeric, ...tocOn }, external);
    check('fixture renders TOC pages (precondition for the TOC checks)', base.pageCount > 5, `pages=${base.pageCount}`);
    for (const key of ['general-toc-show-numbering', 'detailed-toc-show-numbering']) {
      const off = await render(browser, baseUrl, small, { ...numeric, ...tocOn, [key]: false }, external);
      check(`${key}=false removes page numbers`, off.shownNumbers < base.shownNumbers, `shown numbers default=${base.shownNumbers} off=${off.shownNumbers}`);
    }
    // 3. TOC count-numbering (general + detailed): turning it off must change the numbering sequence.
    for (const key of ['general-toc-count-numbering', 'detailed-toc-count-numbering']) {
      const off = await render(browser, baseUrl, small, { ...numeric, ...tocOn, [key]: false }, external);
      check(`${key}=false changes the numbering sequence`, JSON.stringify(off.footers) !== JSON.stringify(base.footers), `sequence unchanged: [${base.footers}]`);
    }
    // 4. body-last-line-align: the CSS variable and the computed style of p.p-end must follow the setting.
    const right = await render(browser, baseUrl, prose, { 'body-last-line-align': 'right' }, external);
    const left = await render(browser, baseUrl, prose, { 'body-last-line-align': 'left' }, external);
    check('body-last-line-align drives --last-line-align', right.lastLineAlignVar === 'right' && left.lastLineAlignVar === 'left', `right->'${right.lastLineAlignVar}' left->'${left.lastLineAlignVar}'`);
    check('body-last-line-align reaches p.p-end text-align-last', right.pEndTextAlignLast === 'right' && left.pEndTextAlignLast === 'left', `right->${right.pEndTextAlignLast} left->${left.pEndTextAlignLast}`);
    // 5. avoid-runt-word: on vs off must produce different layouts on running prose (otherwise the setting is dead).
    const runtOn = await render(browser, baseUrl, prose, { 'avoid-runt-word': true }, external);
    const runtOff = await render(browser, baseUrl, prose, { 'avoid-runt-word': false }, external);
    check('avoid-runt-word changes the layout', runtOn.domHash !== runtOff.domHash, `identical DOM hash ${runtOn.domHash}`);
    check('no external network requests', external.length === 0, external.slice(0, 3).join(', '));
  } catch (e) {
    check('test run completed', false, e.message);
  } finally {
    await browser.close(); server.close();
  }
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
