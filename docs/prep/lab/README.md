# מעבדה מקומית — איך לשחזר

**מטרה:** להריץ את מנוע העימוד מקומית עם Chromium אמיתי, בסביבה שבה הורדת הדפדפנים של Playwright חסומה.

## רכיבים
- `shim/playwright/` — מודול שמחליף `require('playwright')`: עוטף את `playwright-core` ומשתמש ב-Chromium ארוז מ-npm (`@sparticuz/chromium`). אם `LAB_GOOGLE_FONTS=1`, הוא מיירט את הבקשה ל-`fonts.googleapis.com` ומספק במקומה גופנים מ-`@fontsource/*`.
- `scripts/run_chapters.sh` — מריץ את ה-CLI של Green על רשימת פרקים (עם תקציב זמן, ניתן לחידוש).
- `scripts/split_chapters.py` — פיצול הטקסט הקנוני לפרקים.
- `fixtures/ch63_final_paragraph_failure_case.txt` — הקלט שנכשל בלי גופני Google.
- `chapters_focus/` — 13 הפרקים שהיו בעייתיים ב-Gold.
- `results/` — סיכומי הריצות.

## התקנה (סביבה עם npm בלבד)
```
mkdir lab && cd lab && npm init -y
npm i playwright-core@1.55.0 @sparticuz/chromium@140 \
  @fontsource/frank-ruhl-libre @fontsource/david-libre @fontsource/bellefair \
  @fontsource/noto-serif-hebrew @fontsource/assistant @fontsource/rubik
mkdir -p node_modules/playwright && cp <this-package>/shim/playwright/* node_modules/playwright/
# הערה: npm install מוחק את התיקייה node_modules/playwright (אינה בתלויות). יש ליצור אותה מחדש אחרי כל npm i.
```
## הרצה
```
export NODE_PATH=$PWD/node_modules LAB_GOOGLE_FONTS=1
cd <engine-checkout>
node tools/geometry-audit-cli.js --input very_long_test_text.txt --fail-on none --repeat-check --step-audit-disabled \
  --report out/report.json --summary out/summary.md
```
## מגבלות ידועות של המעבדה
- מעבד אחד, 4GB זיכרון: ריצה מלאה של Green לוקחת כ-240 שניות לרינדור אחד.
- `@sparticuz/chromium` מחלץ ל-`/tmp/chromium`. כדי להחליף גרסה יש למחוק את `/tmp/chromium` ו-`/tmp/fonts` ו-`/tmp/swiftshader` ו-`/tmp/al2023`.
- תהליכי רקע נהרגים בסוף קריאת הכלי בסביבה שבה נבנתה המעבדה; ריצות ארוכות הופעלו בחזית עם `timeout`.

## אזהרה: איתור מודול
Node מחפש `playwright` ב-`node_modules` של כל אב-קדמון של הנתיב *לפני* `NODE_PATH`. אל תניחו עצים תחת תיקייה שיש בה `node_modules/playwright` ישן. לפני כל סדרת ניסויים: `node -e "console.log(require.resolve('playwright'))"` מתוך תיקיית העץ. כמו כן, `@sparticuz/chromium` משתמש ב-`/tmp/chromium` אם קיים: להחלפת גרסה יש למחוק אותו ולבדוק `/tmp/chromium --version`.
