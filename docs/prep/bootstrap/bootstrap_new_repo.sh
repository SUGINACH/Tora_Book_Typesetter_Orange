#!/bin/bash
# בונה ריפו חדש מקומי (היסטוריה נקייה) מקצה Green 0ddaf89 + חבילת ההכנה.  לא נוגע ב-Green/Gold.
# שימוש: bash bootstrap_new_repo.sh <GREEN_GIT_CHECKOUT> <PREP_DIR> <DEST_DIR>
set -euo pipefail
GREEN="$1"; PREP="$2"; DEST="$3"
GREEN_SHA=0ddaf89; GOLD_SHA=31ed2ca; BASE_SHA=5c646c1
[ -e "$DEST" ] && { echo "DEST exists: $DEST"; exit 1; }
mkdir -p "$DEST"
echo "[1/7] import Green@$GREEN_SHA (clean history)"
git -C "$GREEN" archive "$GREEN_SHA" | tar -x -C "$DEST"

echo "[2/7] omit legacy dirs/artifacts (verified unreferenced by active code first)"
cd "$DEST"
LEGACY="old_ver debug test Parallel_Programming"
ACTIVE="index.html renderer.html app.js typesetter.js decorations.js settings-manager.js renderer-bridge.js geometry-audit.js trace-manager.js debug-panel.js test-suite.js style.css tools/geometry-audit-cli.js"
for d in $LEGACY; do
  if grep -n -E "(^|[\"'/ (])$d/" $ACTIVE .github/workflows/*.yml package.json 2>/dev/null | grep -v -E '^\S+:[0-9]+:\s*(//|/\*|\*)' | grep -q .; then
    echo "  REFERENCED: $d/ is referenced by active code. Stopping."; grep -n -E "(^|[\"'/ (])$d/" $ACTIVE .github/workflows/*.yml package.json | head -5; exit 3; fi
done
rm -rf $LEGACY rendered-document_4.html rendered-document_4.pdf 2>/dev/null || true
mkdir -p docs/green-V23 && git -C "$GREEN" archive "$GREEN_SHA" V23 | tar -x -C . && mv V23/* docs/green-V23/ && rmdir V23

echo "[3/7] self-hosted fonts (replaces Google @import in style.css)"
mkdir -p selfhost-fonts && cp "$PREP"/assets/selfhost-fonts/* selfhost-fonts/
python3 - <<'PY'
import re
s=open('style.css',encoding='utf-8').read()
m=re.search(r"@import url\('https://fonts\.googleapis\.com[^\n]*\n",s)
assert m, 'Google @import not found'
s=s[:m.start()]+"@import url('selfhost-fonts/google-fonts-selfhost.css');\n"+s[m.end():]
assert 'googleapis' not in s
open('style.css','w',encoding='utf-8').write(s)
PY

echo "[4/7] pin Playwright + lockfile"
python3 - <<'PY'
import json
p=json.load(open('package.json',encoding='utf-8'))
for k in ('dependencies','devDependencies'):
    if 'playwright' in p.get(k,{}): p[k]['playwright']='1.55.0'
p.setdefault('devDependencies',{})['playwright']='1.55.0'
p['name']='tora-book-typesetter-unified'; p['private']=True
json.dump(p,open('package.json','w',encoding='utf-8'),indent=2,ensure_ascii=False); open('package.json','a').write('\n')
PY
npm install --package-lock-only --ignore-scripts >/dev/null 2>&1
grep -q '"node_modules/playwright"' package-lock.json && grep -A1 '"node_modules/playwright"' package-lock.json | tail -1

echo "[5/7] CLI hardening (fingerprint + offline guard)"
python3 "$PREP"/bootstrap/cli_hardening.py tools/geometry-audit-cli.js

echo "[6/7] fixtures + provenance"
mkdir -p fixtures && cp "$PREP"/fixtures/*.txt fixtures/ && cp -r "$PREP"/lab/chapters_focus fixtures/chapters_focus && cp "$PREP"/lab/fixtures/ch63_final_paragraph_failure_case.txt fixtures/
cat > PROVENANCE.md <<PROV
# Provenance
Imported (clean history) from SUGINACH/Tora_Book_Typesetter_Green@$GREEN_SHA (branch V23).
Not imported: old_ver/, debug/, test/, Parallel_Programming/, rendered-document_4.*. They remain in the Green repo.
Reference points: Gold@$GOLD_SHA (V21), common ancestor $BASE_SHA.
very_long_test_text.txt sha256: $(sha256sum very_long_test_text.txt | cut -d' ' -f1)
selfhost-fonts/google-fonts-selfhost.css sha256: $(sha256sum selfhost-fonts/google-fonts-selfhost.css | cut -d' ' -f1)
Changes vs Green@$GREEN_SHA: (1) self-hosted fonts instead of Google @import (style.css); (2) playwright pinned to 1.55.0 + package-lock.json; (3) CLI: browser/playwright/fonts/input fingerprint in report + offline guard (exit 7 on external requests).
PROV
cp "$PREP"/bootstrap/expected_baseline.json . 2>/dev/null || true

echo "[7/7] syntax gate + commit"
for f in *.js tools/*.js; do node --check "$f"; done
git init -q . && git add -A && git -c user.name="${GIT_NAME:-bootstrap}" -c user.email="${GIT_EMAIL:-bootstrap@local}" commit -q -m "Initial import: Green@$GREEN_SHA + font self-hosting, pinned Playwright, CLI fingerprint/offline guard" && git log --oneline | head -1
echo "OK. Next: npm ci && npx playwright install --with-deps chromium && bash $PREP/bootstrap/verify_phase2.sh $DEST"
