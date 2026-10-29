'use strict';
// Shared offline test harness: static server on 127.0.0.1 + renderer.html driven through the same message protocol the CLI uses.
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
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

/** Opens the renderer, applies default_settings.json + overrides, typesets `text`, and returns the page for DOM queries. */
async function renderPage(browser, baseUrl, text, overrides, external) {
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
  return page;
}

function makeChecker() {
  const results = [];
  const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  ::  ' + detail)); };
  const finish = () => { const failed = results.filter(r => !r.ok).length; console.log(`\n${results.length - failed}/${results.length} checks passed`); return failed ? 1 : 0; };
  return { check, finish };
}

module.exports = { root, startServer, renderPage, makeChecker };
