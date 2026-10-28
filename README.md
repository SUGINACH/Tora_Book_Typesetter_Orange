# מערכת עימוד תורנית — V23

מערכת דפדפן לעימוד טקסט תורני בעברית וב־RTL, עם עימוד דו־טורי, כותרות ומעברי פרקים, הערות שוליים/צד, עיטורים, קובצי הגדרות וכלי ביקורת גאומטרית אוטומטיים.

## נקודת כניסה וקבצים מרכזיים

- `index.html` — ממשק המשתמש.
- `app.js` — אינטראקציות, טעינת נכסים והגדרות ממשק.
- `typesetter.js` — מנוע העימוד, בחירת חלוקת טורים, איזון, כותרות והערות.
- `style.css` — גאומטריית ה־DOM והעיצוב.
- `settings-manager.js`, `default_settings.json`, `setting_sets/` — טעינה והחלה של הגדרות.
- `decorations.js` — **רכיב ליבה פעיל** שמיישם את פונקציות העיטור; אין להתייחס אליו כקובץ מורשת. קובצי JSON בשורש הם מאגרי עיטורים, שערים, קווים מפרידים וכללי הערות.
- `renderer.html`, `renderer-bridge.js` — סביבת רינדור מבודדת וכלי הגישור אליה.
- `geometry-audit.js` — מודל הגאומטריה והבדיקות.
- `tools/geometry-audit-cli.js` — CLI שמפעיל את המנוע ב־Chromium headless ושומר דוחות.
- `.github/workflows/geometry-audit-cli.yml` — בדיקות Smoke ו־fixtures.
- `.github/workflows/geometry-audit-long.yml` — בדיקות מסמך מלא, ברירת מחדל ועיטורים פעילים.
- `very_long_test_text.txt` — קלט המסמך המלא הקנוני לבדיקות עימוד.
- `V23/MASTER_WORK_REGISTER.md` — רשימת העבודות, פערי הכיסוי ומפת הקבצים.
- `worklog.md` — יומן commits, בדיקות, תוצאות וממצאים פתוחים.

## הרצת בדיקות מקומית

נדרשים Node.js 22 ו־npm; Playwright משתמש ב־Chromium.

```bash
npm install
npx playwright install --with-deps chromium
node tools/geometry-audit-cli.js --help
```

בדיקת מסמך מלא בהגדרות ברירת מחדל:

```bash
npm run audit:geometry:long -- --fail-on high --repeat-check --require-note-marker-line-diagnostics
```

הפקודה משתמשת ב־`very_long_test_text.txt`. היא מפיקה דוחות תחת `artifacts/` ומחזירה קוד כשל בהתאם לשערים שהוגדרו.

בדיקת עיטורים פעילים מתבצעת גם ב־workflow:

```bash
node tools/geometry-audit-cli.js \
  --input ./very_long_test_text.txt \
  --settings ./tests/fixtures/ornament-geometry-settings.json \
  --timeout-ms 900000 \
  --report ./artifacts/geometry-audit-ornaments.json \
  --summary ./artifacts/geometry-audit-ornaments-summary.md \
  --fail-on high --repeat-check --require-ornaments --require-note-marker-line-diagnostics
```

ה־fixtures תחת `tests/fixtures/` מיועדים לבדיקות ממוקדות של מקרי קצה; הם **משלימים ואינם מחליפים** בדיקת מסמך מלא כאשר שינוי עשוי להשפיע על העימוד.

## מה הבדיקות מוכיחות — ומה לא

- בדיקות Smoke בודקות תרחישים מוגדרים, כגון טור ריק, היעדר פיצול חוקי, סוגריים, עיטורים וכותרות.
- בדיקת המסמך המלא מודדת את ה־DOM והגאומטריה שנוצרו בפועל, ומפיקה ממצאי overflow/containment, חפיפות, איזון, שורות/עמודים דלילים, הערות וטווחי סוגריים.
- בדיקת שימור התוכן משווה פסקאות, כותרות והערות צד למקור.
- יומן ההחלטות מקשר בלוקים מרונדרים להחלטות חלוקה ומציג נתוני מועמדים ואבחנות.
- `--repeat-check` מוודא שאותו קוד, קלט והגדרות מפיקים חתימת פריסה זהה בשתי ריצות. הוא אינו לבדו בדיקת רגרסיה בין commits.
- הצלחת CI אינה מבטיחה שכל עמוד מיטבי: ממצאי MEDIUM/LOW נשארים גלויים עד שנבדקו והוכרעו.

לסטטוס המדויק של הבדיקות ולרשימת הפערים הנוכחית יש לעיין ב־`V23/MASTER_WORK_REGISTER.md` וב־`worklog.md`.

## דוחות היסטוריים וקובצי מורשת

תיקיות `old_ver/`, `debug/`, `test/` וקובצי HTML/PDF גדולים עשויים להכיל תוצרים היסטוריים וראיות לבאגים. אין למחוק אותם עד להשלמת מיפוי תלות, סקירת היסטוריה וארכיון עצמאי.

## מצב האימות האחרון המתועד

- בדיקת המסמך הארוך [run 40386889244](https://github.com/SUGINACH/Tora_Book_Typesetter_Green/actions/runs/40386889244) — הצליחה.
- בדיקת CLI על ה־HEAD [run 40386909709](https://github.com/SUGINACH/Tora_Book_Typesetter_Green/actions/runs/40386909709) — הצליחה.
- בתצורת ברירת המחדל: 639 עמודים, 27 ממצאים (0 HIGH, 4 MEDIUM, 23 LOW).
- עם עיטורים פעילים: 659 עמודים, 37 ממצאים (0 HIGH, 6 MEDIUM, 31 LOW).
- אלה תוצאות בדיקה מזוהות לפי ה־runs לעיל, לא טענה שהמנוע נקי מכל בעיות עימוד. יש לבדוק את המרשם ואת הדוח לפני שינוי מדיניות או סגירת ממצאים.
