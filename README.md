# מערכת עימוד תורנית — Orange

מערכת דפדפן לעימוד טקסט תורני בעברית וב־RTL: עימוד דו־טורי, כותרות ומעברי פרקים, הערות שוליים/צד, עיטורים, קובצי הגדרות וכלי ביקורת גאומטריה.

**מקור:** ייבוא נקי של `Tora_Book_Typesetter_Green@0ddaf89` (ענף V23) + יכולות ותיקונים שהועברו מ־`Tora_Book_Typesetter_Gold@31ed2ca` (ענף V21), כל אחד כקומיט נפרד עם בדיקה. הפרטים המלאים, כולל מה נבדק ומה לא, ב־[`WORKLOG.md`](WORKLOG.md). שאלות שדורשות הכרעת עורך: [`OPEN_QUESTIONS.md`](OPEN_QUESTIONS.md). מקורות והבדלים: [`PROVENANCE.md`](PROVENANCE.md).

## נקודת כניסה וקבצים מרכזיים

- `index.html` — ממשק המשתמש. `app.js` — אינטראקציות, טעינת נכסים והגדרות ממשק.
- `typesetter.js` — מנוע העימוד, בחירת חלוקת טורים, איזון, כותרות והערות.
- `decorations.js` — **רכיב ליבה** שמיישם את פונקציות העיטור. קובצי JSON בשורש הם מאגרי עיטורים, שערים, קווי הפרדה וכללי הערות.
- `style.css` — גאומטריית ה־DOM והעיצוב. `selfhost-fonts/` — גופני Google מאוחסנים עצמית (OFL-1.1); **אין תלות ברשת בזמן עימוד**.
- `settings-manager.js`, `default_settings.json`, `setting_sets/` — טעינה והחלה של הגדרות.
- `renderer.html`, `renderer-bridge.js` — סביבת רינדור מבודדת (iframe / CLI). הרנדרר טוען בעצמו את נכסי ה־JSON ועימוד ממתין להם.
- `geometry-audit.js` — מודל הגאומטריה והבדיקות. `tools/geometry-audit-cli.js` — CLI שמפעיל את המנוע ב־Chromium headless; הדוח כולל טביעת אצבע (גרסת דפדפן, Playwright, גופנים, קלט) ונכשל (קוד 7) על כל בקשת רשת חיצונית.
- `very_long_test_text.txt` — קלט המסמך המלא הקנוני. `fixtures/` — טקסטים לבדיקות (כולל `chapters_focus/`). `tests/` — בדיקות ממוקדות.
- `docs/green-V23/` — מסמכי ההנדסה והיומן של Green. `docs/prep/` — חומרי ההכנה, ממצאי המעבדה, תכנית הביצוע וצילומי השוואה.

## הרצה מקומית

נדרשים Node.js 22 ו־npm. גרסת Playwright מוצמדת (`1.55.0`) ב־`package-lock.json`.

```bash
npm ci
npx playwright install --with-deps chromium
npm test                      # כל הבדיקות הממוקדות (דקות בודדות)
node tools/geometry-audit-cli.js --help
```

בדיקת מסמך מלא מול הבסיס המתועד (`expected_baseline.json`):

```bash
bash tools/verify_phase2.sh .
```

הסקריפט מוחק את הדוח הקודם לפני הריצה ונכשל אם לא נוצר דוח חדש.

## הבדיקות הממוקדות (`npm test`)

| בדיקה | מה היא מוכיחה |
|---|---|
| `settings-consistency` | כל הגדרה שהרנדרר מקבל יש לה בקרה בממשק וברירת מחדל |
| `settings-wiring` | 7 הגדרות (מספור, תוכן עניינים, שורה אחרונה, `avoid-runt-word`) משפיעות בפועל |
| `header-settings` | `same_as_even` נפתר; `hdr-h1-title-mode` |
| `h2-ornament-scope` | מיקום עיטורי H2 לפי `h2-orn-scope` |
| `heading-divider` | מפרידי כותרות H3–H6, כולל עמידות ללולאה אינסופית |
| `shaar-divider` | עיטורי שער ראשי ומשנה |
| `renderer-assets` | עיטורי JSON זמינים ברנדרר ועימוד ממתין להם |

## מה הבדיקות מוכיחות — ומה לא

- בדיקות Smoke ו־fixtures בודקות תרחישים מוגדרים; בדיקת המסמך המלא מודדת את ה־DOM והגאומטריה בפועל ומפיקה ממצאי overflow, איזון, עמודים דלילים, הערות וטווחי סוגריים.
- `--repeat-check` מוודא חתימת פריסה זהה בשתי ריצות של אותו קוד; הוא אינו בדיקת רגרסיה בין commits.
- הצלחת CI אינה מבטיחה שכל עמוד מיטבי: ממצאי MEDIUM/LOW נשארים גלויים עד שנבדקו והוכרעו.
- ביקורות ה־CLI **אינן מרנדרות עמודי תוכן עניינים** (`default_settings.json` אינו כולל את בחירת רמות התוכן), ולכן TOC מכוסה רק בבדיקות הייעודיות.

## מצב אימות מתועד

- בסיס (תצורת ברירת מחדל), מעבדה מקומית, Chromium `140.0.7339.0`, ללא רשת: **639 עמודים, 39 ממצאים (0 HIGH, 11 MEDIUM, 28 LOW)**. ראו `expected_baseline.json`.
- GitHub Actions: ה־workflows `geometry-audit-cli` ו־`geometry-audit-long` עברו על ה־HEAD האחרון בזמן הכתיבה; הספירות שלהם אינן נקראות במסמך זה (לא נבדקו).
- תצורת העיטורים הפעילים: לא הורצה בבדיקה מקומית; יש להסתמך על דוח ה־CI.
- אלה תוצאות מדידה, לא טענה שהמנוע נקי מכל בעיות עימוד.
