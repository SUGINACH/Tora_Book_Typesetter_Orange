# ניתנות להעברה: 73 קומיטי Gold מאז האב, על קצה Green `0ddaf89`

כל קומיט נבדק **בנפרד**: `git diff c^ c -- <נתיבי קוד>` ואז `git apply --3way` על קצה Green נקי (רק קבצי קוד: typesetter, app, decorations, style, index, default_settings, renderer-bridge, geometry-audit, settings-manager, package.json).

**סיכום:** 27 קומיטים ללא קוד, 9 חלים נקי, 37 מתנגשים. **מסקנה:** קומיטים של Gold בנויים זה על זה (גם על קוד ש-Green שינה), ולכן העברה פר-קומיט אינה אסטרטגיה מעשית. היחידה הנכונה היא קבוצה נושאית, עם re-implement או patch ידני מאומת.

**הקבוצות הן שלי (לפי נושא הקומיט והקבצים שנגע בהם), לא מחלוקה שמופיעה בריפו.**

## A · חיבור הגדרות

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `f069408` | 10-22 13:03 | V21: תיקון 7 הגדרות שלא הוחלו — page-num-initial-value, toc-numbering, avoid-run | typesetter.js | קונפליקט (1 hunks) |

## B · כותרות, עיטורים ומפרידים

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `c953dc5` | 10-22 10:31 | V21: תיקון כותרת עליונה — החלת hdr-verso-* בעמוד זוגי (hdr-distinct-even-odd) | typesetter.js | קונפליקט (3 hunks) |
| `f86c0d6` | 10-22 10:45 | V21: כותרת עליונה — הצג רק את titleMain (החלק לפני המקף הראשון) | typesetter.js | חל נקי |
| `67de119` | 10-22 19:19 | V21: תיקון 2 באגים מauditV3 — גופן כותרת אמצעית + prop-mt-h2 | style.css,typesetter.js | קונפליקט (1 hunks) |
| `bd9cd15` | 10-22 19:32 | V21: תיקון עיטורים — ה-iframe לא טען קבצי JSON של עיטורים | app.js | חל נקי |
| `d7a6c65` | 10-22 20:55 | V21: 4 אפשרויות תחולת עיטורי h2 + עיטורים נפרדים + עיטורי צד + תיקון התאמת רוחב | app.js,default_settings.json,index.html,style.css,typesetter.js | קונפליקט (1 hunks) |
| `3900f43` | 10-22 21:06 | V21: תיקון רוחב עיטור h2 + מרחק סימטרי | style.css,typesetter.js | קונפליקט (1 hunks) |
| `9b16ce3` | 10-22 21:37 | V21: תיקון מתיחת SVG + מרחק סימטרי (descenders) | style.css | חל נקי |
| `b972501` | 10-22 21:46 | V21: מרחק סימטרי מאותיות רגילות (x-height) — לא מ-descenders | style.css | חל נקי |
| `57b44e4` | 10-23 05:45 | V21: תיקון בטיחות — הסרת line-height:1 שעלול לגרום לחפיפה בכותרות בנות שתי שורות | style.css | קונפליקט (1 hunks) |
| `a3bbd21` | 10-23 06:43 | V21: בדיקת רגרסיה מעמיקה — תיקון 2 בעיות פוטנציאליות | style.css,typesetter.js | קונפליקט (2 hunks) |
| `84bb0c2` | 10-23 11:12 | V21: 4 בקשות — מרחק סימטרי + מדידת עיטורים + עיטורי הפרדה + עיטורי שער | app.js,decorations.js,default_settings.json,geometry-audit.js,index.html,renderer-bridge.js,style.css,typesetter.js | קונפליקט (4 hunks) |
| `752fdb1` | 10-23 12:56 | V21: תיקון עיטורי הפרדה — גודל 40%, דילוג כותרת גבוהה, הסרת h1/h2/h7, שגיאת ifra | app.js,decorations.js,default_settings.json,index.html,renderer-bridge.js,typesetter.js | קונפליקט (11 hunks) |
| `a461fcb` | 10-24 16:45 | V21: פישוט לוגיקת עיטורי הפרדה — הסרת lastHigherHeadingLevel | typesetter.js | קונפליקט (4 hunks) |
| `2e100e9` | 10-24 20:01 | V21: עיטורי הפרדה — תיקון span_1col + ניקוי lastHeadingSeen בh2 | typesetter.js | קונפליקט (1 hunks) |
| `194f19c` | 10-24 23:49 | V21: תיקון קריטי — מניעת לולאה אינסופית בעיטורי h4 | typesetter.js | קונפליקט (2 hunks) |

## C · תשתית ממשק

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `23f18a8` | 10-24 19:40 | V21: תיקון postMessage origin לfile:// — מאפשר בדיקה מקומית | renderer-bridge.js | חל נקי |

## D1 · מנוע איזון/מתיחה (תיקונים)

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `728801e` | 10-26 21:10 | fix(C2+B5): determinism clarification + page-height overflow fix | typesetter.js | קונפליקט (1 hunks) |
| `ef3bad6` | 10-26 22:06 | fix(1+5+secdiv): drop-word per-column + chapter-start detection + sec-div roundi | geometry-audit.js,typesetter.js | קונפליקט (4 hunks) |
| `74c8dcc` | 10-27 00:24 | fix(Finding 2): sparse-line false-positives — paren-text overlap + note-marker d | geometry-audit.js,typesetter.js | קונפליקט (7 hunks) |
| `72eedea` | 10-27 02:05 | fix(A3+B1): settings-verification checks 12-16 + imbalance partial-stretch + shr | geometry-audit.js,typesetter.js | קונפליקט (4 hunks) |

## D2 · aq: word/para/line/letter/heading spacing, page-height (החלטה 5)

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `2e4a7ad` | 10-25 18:09 | V21: שלב 1 — רווח מילים דינמי (word-spacing) לאיזון טורים | typesetter.js | קונפליקט (2 hunks) |
| `4ecf847` | 10-25 21:32 | V21: שלב 1 — רווח מילים דינמי (word-spacing) לאיזון טורים | typesetter.js | קונפליקט (1 hunks) |
| `06f6aeb` | 10-25 21:50 | V21: פאנל 'איכות עימוד אוטומטי' + שלב 2 (רווח פסקאות דינמי) + שלב 3 (רווח שורות  | default_settings.json,index.html,renderer-bridge.js,typesetter.js | קונפליקט (4 hunks) |
| `79a7889` | 10-25 23:11 | V21: תיקון רגרסיה קריטית באיזון טורים — stretchByWordSpacing/compressByWordSpaci | typesetter.js | קונפליקט (1 hunks) |
| `000fe17` | 10-26 00:06 | V21: כיוונון סף revert ב-stretchByWordSpacing — מ-+2px ל-+10px | typesetter.js | קונפליקט (1 hunks) |
| `d48da0a` | 10-26 06:39 | V21: תיקון רגרסיית overshoot — דלג על word-spacing כש-diff<15px ב-justifyColumnV | typesetter.js | קונפליקט (2 hunks) |
| `fa00262` | 10-26 16:56 | feat(step-4): heading-spacing — dynamic margin-top/margin-bottom for H4/H5/H6 | index.html,renderer-bridge.js,typesetter.js | קונפליקט (5 hunks) |
| `26f4f0d` | 10-26 17:07 | feat(step-7): letter-spacing — disabled by default (caused overshoot) | index.html,renderer-bridge.js,typesetter.js | קונפליקט (5 hunks) |
| `70e881b` | 10-26 17:47 | feat(step-5): page-height — experimental, disabled by default | index.html,renderer-bridge.js,typesetter.js | קונפליקט (2 hunks) |
| `01f997b` | 10-26 18:12 | feat(step-5-rebalance + ci): rebalance after page-height + GitHub Actions workfl | typesetter.js | חל נקי |

## E · ביקורת (geometry-audit)

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `3781d35` | 10-26 00:01 | V21: בדיקה חדשה — page-underfill (הכלה דלילה של עמוד) ב-geometry-audit | geometry-audit.js | קונפליקט (1 hunks) |
| `8847b77` | 10-26 13:03 | fix(audit): page-underfill false positives on chapter-end pages with sec-divider | geometry-audit.js | קונפליקט (2 hunks) |
| `c105d08` | 10-26 13:50 | fix(audit): imbalance + containment thresholds — 0 high-severity issues | geometry-audit.js,typesetter.js | קונפליקט (5 hunks) |
| `f5c87e0` | 10-26 18:55 | refine(audit): block-2col p-cut overflow ≤15px → low (medium -72%) | geometry-audit.js | קונפליקט (1 hunks) |
| `6680f0f` | 10-26 21:03 | feat(audit): A1+A2+A3 — block gaps + settings verification + classifyElement fix | geometry-audit.js | קונפליקט (1 hunks) |
| `9167382` | 10-27 00:52 | docs+fix: comprehensive README rewrite + Finding 4 threshold fix + side-notes di | geometry-audit.js | קונפליקט (1 hunks) |

## F · אבחון step-by-step

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `345b9e4` | 10-26 22:19 | feat(diagnostic): step-by-step audit system — pinpoint which stage creates each  | typesetter.js | קונפליקט (2 hunks) |
| `4787a9d` | 10-26 23:14 | feat(diagnostic): refined step-by-step audit + step-by-step-audit-Method.md | typesetter.js | קונפליקט (1 hunks) |
| `ad01732` | 10-26 23:44 | feat(audit): enhanced step-by-step audit — delta tracking + causality classifica | geometry-audit.js,typesetter.js | קונפליקט (2 hunks) |
| `f537eff` | 10-27 01:14 | feat(diagnostic): --per-page-checkpoints flag + causality fix + WORK_PLAN status | typesetter.js | קונפליקט (1 hunks) |

## G · בדיקות, CI ושחזור

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `11b2b55` | 10-26 08:51 | V21: בדיקת רגרסיה אוטומטית — regression-test.js | typesetter.js | קונפליקט (4 hunks) |
| `cada5c8` | 10-26 16:33 | investigate(non-determinism): ch 67 stress test — 8 runs in same browser all ide |  | — (ללא קוד) |
| `8bf9165` | 10-26 18:49 | docs+ci: LAYOUT_DEPENDENCY_MAP section 13 + determinism test |  | — (ללא קוד) |
| `b043ef5` | 10-26 18:58 | fix(ci): add npm install + package.json — fix 'Cannot find module playwright' | package.json | קונפליקט (1 hunks) |
| `919944c` | 10-26 20:04 | chore: clean repo — delete 167MB of legacy files + update .gitignore | package.json | חל נקי |
| `0bb7898` | 10-27 02:17 | fix(F2+C1): text-wrap:pretty CSS + browser restart frequency 5→3 | style.css | חל נקי |

## H · מסמכים/תוצאות/העלאות

| קומיט | זמן | נושא | קבצי קוד | יישום עצמאי על Green |
|---|---|---|---|---|
| `f486354` | 10-22 22:32 | worklog: סיכום מקיף של כל ההתקדמות — מה התברר כנכון ומה לא |  | — (ללא קוד) |
| `967df35` | 10-25 01:21 | V23: document in-memory parenthesis snapshots |  | — (ללא קוד) |
| `6f3223b` | 10-25 10:35 | worklog+style: עדכון מלא + ניקוי כפילות CSS | style.css | חל נקי |
| `56e0f6f` | 10-25 11:25 | worklog: סקירה כוללת — 15 ממצאים של כללים לא ברורים/מיותרים |  | — (ללא קוד) |
| `7410e37` | 10-25 12:03 | worklog: בדיקת גיאומטריה של טקסט ארוך — 0 בעיות איזון, 14 containment |  | — (ללא קוד) |
| `0e1b442` | 10-25 12:24 | worklog: הערכת מפרט ארכיטקטוני — עימוד דינמי ואיזון טורים חכם |  | — (ללא קוד) |
| `a70ca3b` | 10-25 13:02 | test: בדיקת 79 פרקים — 0 איזון, 0 overflow, 7 containment + מסמך בעיות |  | — (ללא קוד) |
| `7bfe190` | 10-25 23:03 | V21: תיקון סקריפט בדיקה — סלקטורים נכונים להערות שוליים (.note-block/.note-line  |  | — (ללא קוד) |
| `f32624b` | 10-25 23:55 | V21: תוצאות בדיקה מלאה אחרי תיקון רגרסיה — 87% ירידה באי-איזון טורים |  | — (ללא קוד) |
| `4569a57` | 10-26 07:24 | V21: תיעוד ארכיטקטוני — סעיף 11 ב-LAYOUT_DEPENDENCY_MAP |  | — (ללא קוד) |
| `d589a82` | 10-26 14:10 | Add files via upload |  | — (ללא קוד) |
| `9e382fa` | 10-26 14:16 | Add files via upload |  | — (ללא קוד) |
| `555db97` | 10-26 18:13 | chore: add __pycache__ to .gitignore (cleanup pyc files) |  | — (ללא קוד) |
| `c07a077` | 10-26 18:13 | docs: update worklog — step-5-rebalance + GitHub Actions workflow |  | — (ללא קוד) |
| `b514ce5` | 10-26 19:31 | docs: REPO_AUDIT_AND_TESTING.md — repo audit + testing explained + editing recom |  | — (ללא קוד) |
| `47d8aa2` | 10-26 20:11 | docs: WORK_PLAN.md — comprehensive work plan (40+ items, 8 categories) |  | — (ללא קוד) |
| `9fe218e` | 10-27 01:31 | Add files via upload |  | — (ללא קוד) |
| `756af66` | 10-26 23:45 | docs(worklog): audit-refinement-2 task — delta + causality + issue patterns + pa |  | — (ללא קוד) |
| `583c677` | 10-27 00:25 | docs(worklog): finding-2-sparse-line task — paren-text overlap fix + note-marker |  | — (ללא קוד) |
| `6b7586b` | 10-27 02:49 | Add files via upload |  | — (ללא קוד) |
| `35a99fe` | 10-27 00:52 | docs(worklog): finding-3+4+readme-update task — verified Finding 3 resolved, Fin |  | — (ללא קוד) |
| `b8aba88` | 10-27 01:15 | docs(worklog): ppc-and-b1-b4-status task — --per-page-checkpoints + causality fi |  | — (ללא קוד) |
| `1764e6d` | 10-27 01:25 | docs(WORK_PLAN): accurate status — DONE/PARTIAL/OPEN markers, kept partial items |  | — (ללא קוד) |
| `e44a06a` | 10-27 01:25 | docs(worklog): work-plan-accurate-status task — PARTIAL markers added, partial i |  | — (ללא קוד) |
| `a08dcdd` | 10-27 02:24 | docs(WORK_PLAN): update F2 ✅ DONE, C1 ⚠️ PARTIAL, summary table |  | — (ללא קוד) |
| `31ed2ca` | 10-27 02:25 | docs(worklog): systematic-fixes-round-1 — A3 ✅, B1 ⚠️, B4 N/A, F2 ✅, F4 ⚠️, C1 ⚠ |  | — (ללא קוד) |
