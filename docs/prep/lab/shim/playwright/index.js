// LOCAL LAB SHIM (not part of any repo): playwright-core + bundled Chromium + optional local stand-in for Google Fonts.
const pw = require('playwright-core'); const fs = require('fs'); const path = require('path');
const orig = pw.chromium.launch.bind(pw.chromium);
const FS = path.join(__dirname, '..', '@fontsource');
const PKG = { 'Assistant':'assistant','Rubik':'rubik','Bellefair':'bellefair','David Libre':'david-libre','Frank Ruhl Libre':'frank-ruhl-libre','Noto Serif Hebrew':'noto-serif-hebrew' };
const RANGE = { hebrew:'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F', latin:'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' };
function buildCss(url) {
  const u = new URL(url); const out = []; const seen = new Set();
  for (const fam of u.searchParams.getAll('family')) {
    const [nameRaw, spec] = fam.split(':'); const name = nameRaw.replace(/\+/g,' ');
    const pkg = PKG[name]; if (!pkg) continue;
    let weights = [400]; if (spec && spec.startsWith('wght@')) weights = spec.slice(5).split(';').map(Number);
    for (const w of weights) for (const sub of ['hebrew','latin']) {
      const f = path.join(FS, pkg, 'files', `${pkg}-${sub}-${w}-normal.woff2`);
      if (!fs.existsSync(f) || seen.has(f)) continue; seen.add(f);
      out.push(`@font-face{font-family:'${name}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format('woff2');unicode-range:${RANGE[sub]};}`);
    }
  }
  return out.join('\n');
}
async function attach(ctx) { if (process.env.LAB_GOOGLE_FONTS === '1') await ctx.route(/fonts\.googleapis\.com\/css2/, r => r.fulfill({ status:200, contentType:'text/css', body: buildCss(r.request().url()) })); }
pw.chromium.launch = async (opts = {}) => {
  const mod = (await import('@sparticuz/chromium')).default;
  const exe = await mod.executablePath();
  const b = await orig({ ...opts, executablePath: exe, headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu', ...(opts.args||[])] });
  const nc = b.newContext.bind(b), np = b.newPage.bind(b);
  b.newContext = async (...a) => { const c = await nc(...a); await attach(c); return c; };
  b.newPage = async (...a) => { const p = await np(...a); await attach(p.context()); return p; };
  return b;
};
module.exports = pw;
