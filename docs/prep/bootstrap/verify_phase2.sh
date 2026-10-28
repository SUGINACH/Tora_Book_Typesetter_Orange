#!/bin/bash
# שער שלב 2: ריצה מלאה בלי רשת. נכשל על כל סטייה מ-expected_baseline.json (תצורת ברירת מחדל).
# שימוש: bash verify_phase2.sh <DEST_DIR> [extra CLI args]
set -uo pipefail
D="$1"; shift || true; cd "$D"
mkdir -p artifacts
node tools/geometry-audit-cli.js --input very_long_test_text.txt --fail-on none --step-audit-disabled --timeout-ms 3000000 \
  --report artifacts/phase2.json --summary artifacts/phase2.md "$@" > artifacts/phase2.log 2>&1
rc=$?
python3 - "$rc" <<'PY'
import json,sys,collections
rc=int(sys.argv[1]); E=json.load(open('expected_baseline.json'))['default_config']
d=json.load(open('artifacts/phase2.json',encoding='utf-8')); iss=d['audit']['issues']
c=collections.Counter(i['severity'] for i in iss); k=dict(collections.Counter(i['kind'] for i in iss))
got={'pages':d['pageCount'],'issues':len(iss),'high':c.get('high',0),'medium':c.get('medium',0),'low':c.get('low',0),'kinds':k}
r=d['run']; print('fingerprint:',{x:r.get(x) for x in ('browserVersion','playwrightVersion','fontsCssSha256','inputSha256')}); print('externalRequests:',r.get('externalRequests'))
bad=[f'{x}: got {got[x]} expected {E[x]}' for x in ('pages','issues','high','medium','low','kinds') if got[x]!=E[x]]
if r.get('externalRequests'): bad.append('external requests present')
if rc not in (0,): bad.append(f'cli exit code {rc}')
print('PASS' if not bad else 'FAIL: '+'; '.join(bad)); sys.exit(0 if not bad else 1)
PY
