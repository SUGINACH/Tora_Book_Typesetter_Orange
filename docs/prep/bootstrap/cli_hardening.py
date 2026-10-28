#!/usr/bin/env python3
"""שיפורי CLI לשלב 2 (07_IMPLEMENTATION_PLAN): טביעת אצבע בדוח + שער "ללא רשת".
שימוש: python3 cli_hardening.py <path/to/tools/geometry-audit-cli.js>
כל עוגן חייב להופיע בדיוק פעם אחת, אחרת הסקריפט נכשל ולא משנה את הקובץ."""
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f'ANCHOR COUNT {n} (expected 1): {old[:70]!r}')
    s = s.replace(old, new)
rep("repeatCheck: false,", "repeatCheck: false, allowExternal: false,")
rep("            case '--repeat-check': o.repeatCheck = true; break;\n",
    "            case '--repeat-check': o.repeatCheck = true; break;\n            case '--allow-external': o.allowExternal = true; break;\n")
rep("    const pageErrors = [], consoleErrors = [], started = Date.now();\n",
    "    const pageErrors = [], consoleErrors = [], started = Date.now();\n    const externalRequests = []; let browserVersion = null;\n")
rep("        browser = await chromium.launch({ headless: true });\n",
    "        browser = await chromium.launch({ headless: true });\n        browserVersion = browser.version();\n")
rep("        await page.goto(baseUrl + '/renderer.html', { waitUntil: 'load', timeout: args.timeoutMs });\n",
    "        if (!args.allowExternal) {\n"
    "            // Offline guard: any request that is not local is recorded and blocked (layout must not depend on the network).\n"
    "            await page.route('**/*', route => {\n"
    "                const u = route.request().url();\n"
    "                if (u.startsWith('http://127.0.0.1:') || /^(data|blob|about):/.test(u)) return route.continue();\n"
    "                externalRequests.push(u); return route.abort();\n"
    "            });\n"
    "        }\n"
    "        await page.goto(baseUrl + '/renderer.html', { waitUntil: 'load', timeout: args.timeoutMs });\n")
rep("renderMs:Date.now()-started, renderResult,",
    "renderMs:Date.now()-started, browserVersion, externalRequests,\n"
    "               playwrightVersion:(()=>{try{return require('playwright/package.json').version;}catch{return null;}})(),\n"
    "               inputSha256:crypto.createHash('sha256').update(inputText).digest('hex'),\n"
    "               fontsCssSha256:(()=>{try{return crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'selfhost-fonts','google-fonts-selfhost.css'))).digest('hex');}catch{return null;}})(),\n"
    "               renderResult,")
rep("        if (noteMarkerLineDiagnosticsMissing && !process.exitCode) process.exitCode = 5;\n",
    "        if (noteMarkerLineDiagnosticsMissing && !process.exitCode) process.exitCode = 5;\n"
    "        if (externalRequests.length && !args.allowExternal) { process.stderr.write('External network requests detected (' + externalRequests.length + '): ' + externalRequests.slice(0,5).join(', ') + '\\n'); if (!process.exitCode) process.exitCode = 7; }\n")
open(p, 'w', encoding='utf-8').write(s)
print('cli hardening applied')
