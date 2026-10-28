# תכנית ביצוע מפורטת — גרסה מאוחדת בריפו חדש

**סטטוס:** תכנית בלבד. לא בוצע שינוי באף ריפו. כל שלב כולל: מטרה, צעדים מדויקים, שער קבלה (מה חייב להתקיים כדי להמשיך), והבסיס המאומת שעליו הוא נשען.
**נעילת מקורות:** Green `0ddaf89`, Gold `31ed2ca`, אב `5c646c1`. **מסמכי רקע:** `00`–`06` באותה תיקייה.
**כלל כללי:** כל שינוי הוא קומיט נפרד. אין "תוקן" בלי בדיקה שנכשלה לפני התיקון ועוברת אחריו. אין החלשת ספי ביקורת (החלטה 3). שינוי תוכן מוצג לך לפני החלה.

## החלטות (סיכום)
| # | החלטה | מי הכריע | מקור |
|---|---|---|---|
| 1 | ריפו חדש לחלוטין | המשתמש | |
| 2 | טקסט קנוני: מהדורת Green (זהה כעת ב-Gold) | הוכרע ואומת | `00` |
| 3 | מדיניות Green: אין החלשת ספים | המשתמש | |
| 4 | aq לא בבסיס, נשאר קבוצה נפרדת | Claude (מבוסס ניסוי) | `06` F4 |
| 5 | Playwright מוצמד `1.55.0` + lockfile | Claude (מבוסס ניסוי) | `06` F6 |
| 6 | גופנים מאוחסנים עצמית | Claude (בוצע בריפו החדש) | `06` F1 |
| 7 | `text-wrap: pretty` לא נכנס (אין תועלת מדודה; לא שובר) | Claude (מבוסס ניסוי) | `06` F2 |
| 8 | היסטוריה נקייה, והריפו החדש הוא `SUGINACH/Tora_Book_Typesetter_Orange` | Claude + המשתמש | בוצע (שלב 1–2 נדחפו) |

---
## שלב 0 — קיבוע (בוצע חלקית)
1. נעילת SHA (למעלה). 2. קיבוע הטקסט הקנוני וחישוב hash (ב-`fixtures/` יש `canonical_` ו-`base_`).
**שער:** שני ה-hash רשומים ב-`PROVENANCE.md` של הריפו החדש.

## שלב 1 — פתיחת הריפו החדש (אחרי החלטה 8)
**מבנה מוצע** (נגזר מ-`04_TREE_MANIFEST_BASELINE.md`):
```
/ (שורש)
  index.html, renderer.html, app.js, typesetter.js, decorations.js, settings-manager.js,
  renderer-bridge.js, geometry-audit.js, trace-manager.js, debug-panel.js, test-suite.js,
  style.css, default_settings.json, note_rules.json, *.json של עיטורים/שערים/מפרידים,
  fonts/ (כמו ב-Green) + selfhost-fonts/ (חדש)
  tools/geometry-audit-cli.js
  fixtures/ canonical_very_long_test_text.txt, base_..., ch63_final_paragraph_failure_case.txt, chapters_focus/
  .github/workflows/  (CLI smoke + long audit)
  package.json + package-lock.json (חדש)
  docs/ README.md, PROVENANCE.md, ARCHITECTURE.md, WORKLOG.md
  archive-pointer.md  (מצביע ל-SHA של Green/Gold, ללא העתקת תיקיות מורשת)
```
**צעדים:**
1. `git init` בתיקייה חדשה. 2. ייבוא מ-Green: `git archive 0ddaf89 | tar -x` ואז הסרת תיקיות מורשת (`old_ver/`, `debug/`, `test/`, `Parallel_Programming/`, `rendered-document_*`, תמלילי שיחות) **מהעותק החדש בלבד**. הריפואים הישנים לא נוגעים. 3. ייבוא תיקון הפריטים הקטנים לפי רשימת הבדיקה ב-`04` (9 קבצים ב-Green שלא הופיעו בהפניה: לבדוק ידנית לפני החלטה).
**החלטה פתוחה (שלך):** היסטוריה נקייה (קומיט ייבוא יחיד + `PROVENANCE.md`) או שמירת ההיסטוריה של Green (`git clone` + מחיקת remote). המלצה שלי, כשיקול דעת: היסטוריה נקייה, כי הנדרש מהריפו החדש הוא יחיד ומוגדר; ההיסטוריה המלאה נשארת בריפואים הישנים.
**שער:** `node --check` על כל קבצי ה-JS עובר, והמבנה מתאים ל-`04`.

## שלב 2 — הקשחת סביבה (לפני כל שינוי מנוע)
| צעד | פירוט מדויק | בסיס מאומת |
|---|---|---|
| 2.1 גופנים מאוחסנים | להעתיק `assets/selfhost-fonts/` ל-`selfhost-fonts/`. ב-`style.css` שורה 25: להחליף את `@import url('https://fonts.googleapis.com/…')` ב-`@import url('selfhost-fonts/google-fonts-selfhost.css');` | נבדק: מסמך מלא = 639/40/0-12-28 בלי רשת; הקלט הכושל עובר; אפס שגיאות קונסולה |
| 2.2 שמירת רישיונות | `LICENSE-*.txt` (OFL-1.1) ב-`selfhost-fonts/` | `@fontsource` v5.3.0 |
| 2.3 הצמדת Playwright | `npm i -E playwright@1.55.0` + commit של `package-lock.json`. ב-workflow: `npm ci` במקום `npm install`, ו-`npx playwright install --with-deps chromium` | F6: 1.55.0 = Chromium 140.0.7339.16; אין lockfile כיום |
| 2.4 טביעת אצבע בדוח | להוסיף ל-`tools/geometry-audit-cli.js` שדות `browserVersion` (מ-`browser.version()`), `playwrightVersion`, hash של `selfhost-fonts/google-fonts-selfhost.css` ושל הטקסט | כיום הדוח רושם רק "Chromium headless" |
| 2.5 שער "ללא רשת" | ב-CLI: `page.route('**/*')` שמסרב לכל בקשה שאינה `localhost`, ומוסיף כשל אם נרשמה בקשה חיצונית | F1: בלעדיו תלות ברשת נשארת סמויה |
| 2.6 בדיקת תחביר | כבר ב-Green (`25d5ec0`). להשאיר | `node --check` ב-workflow |
**סטטוס:** שלבים 1–2 בוצעו ונדחפו ל-`Orange`; השער עבר על שכפול טרי מ-GitHub (639/40, Chromium 140.0.7339.0, אפס בקשות חיצוניות).
**שער:** על הריפו החדש, ריצה מלאה בברירת מחדל = **639 עמודים, 40 ממצאים (0/12/28)** ו-ledger 858/858 וגם דטרמיניזם PASS. סטייה = עצירה וחקירה לפני כל המשך.

## שלב 3 — בסיס מדידה בריפו החדש
1. הרצה מלאה בשתי תצורות: ברירת מחדל ועיטורים פעילים. ציפייה מתועדת ב-Green: 639/40 ו-659/56. **תצורת העיטורים לא הורצה במעבדה** (`06` סעיף 5), ולכן המספרים שלה מבוססים על התיעוד בלבד עד הריצה הראשונה.
2. שמירת הדוחות כ-baseline עם ה-SHA וטביעת האצבע.
3. הוספת שער **cross-commit**: סקריפט שמשווה דוח חדש ל-baseline ונכשל על סטייה בלתי מוסברת. (פער שנרשם בעצמו ב-`MASTER_WORK_REGISTER` של Green.)
**שער:** baseline נעול, ושני הדוחות צבועים בירוק.

## שלב 4 — העברת יכולות מ-Gold (כלל "קודם fixture שנכשל")
**נוהל לכל פריט:** (א) כתיבת fixture שמשחזר את הבעיה ש-Gold תיקן; (ב) הרצה על הבסיס. **אם הבסיס כבר עובר, הפריט לא מועבר.** (ג) אם נכשל: מימוש מינימלי; (ד) הרצת fixture + מסמך מלא + השוואה ל-baseline.
**למה הנוהל חשוב:** בטבלת 13 הפרקים (`06` F3) ל-Green יש 0 HIGH בכולם. לכן סביר שחלק גדול מתיקוני האיזון של Gold מיותרים ב-Green. זו עדיין השערה שנבדקת פר-פריט.

| קבוצה | תוכן | בדיקה (fixture / שער) | פער ידוע |
|---|---|---|---|
| **4A חיבור 7 הגדרות** | `patches/A_settings_wiring_7.patch` | שער חדש `auditSettingsVerification`: לכל אחת מ-7 ההגדרות, שינוי הערך משנה את ה-DOM או הגיאומטריה הצפויים. נדרש לכתוב. ב-Gold יש מימוש של 16 בדיקות (`72eedea`) להתבססות | `avoid-runt-word` ב-ברירת מחדל מסומן ויחליף ספירות שורות: דורש ריצת baseline מחדש (שינוי מדיניות) |
| **4B כותרות ועיטורים** | שני המימושים של even/odd ושל H2 עצמאי (Gold `c953dc5`, `d7a6c65`; Green `9ec548a`, `81de5ea`) | טבלת התאמה: לכל תכונה, קלט בדיקה ותוצאה צפויה; בחירת מימוש אחד לפי בדיקה, לא העדפה. כולל `194f19c` (לולאה אינסופית בעיטורי h4): לבדוק אם קיימת ב-Green | hunks 1–4 ב-`buildHeaderGridHTML` |
| **4C תשתית** | `patches/B_postmessage_file_origin.patch` | פתוח: שיקול אבטחה (`targetOrigin '*'` ל-origin `null`) מול `SECURITY.md` | לא נבדק מול מסמך האבטחה |
| **4D תיקוני מנוע של Gold** | `fixDropWordInColumns`, partial-stretch, `fnArea` | לכל אחד fixture מ-`chapters_focus/` או מקטע שלו. **השערה לבדיקה:** ב-Green `createDropWord` נותן `first-word-window` לכל פסקה לא-המשכית, ללא הגבלה לטור; להוסיף ספירת חלונות לטור כבדיקה | לא ידוע אם Green מושפע |
| **4E ביקורת** | `auditBlockGaps`, זיהוי סוף פרק, `first-word-window` | הרצת מודול הביקורת של Gold על פלט Green (ניסוי חדש במעבדה) כדי לראות מה הוא מוצא ש-Green לא מוצא | לא בוצע |
| **4F aq** | `aq-*` ו-heading/letter-spacing/page-height | מחוץ לבסיס. אם תרצה: לבצע כקבוצה נפרדת בענף נפרד, כמועמד מדוד בתוך מודל המועמדים | F4 |
| **4G `text-wrap: pretty`** | | מחוץ לבסיס (F2) | F2 |

**שער לכל קבוצה:** fixture עובר, ובמסמך המלא: 0 HIGH, ואין עלייה בסוג ממצא ביחס ל-baseline בלי החלטה מתועדת.

## שלב 5 — תוכנית ממצאים פתוחים של Green (40 ממצאים בבסיס)
| סוג | כמות | פעולה |
|---|---|---|
| container-gap | 13 | המשך אבחון: סיווג סיבתי לכל עמוד (נדרש predicate לפני/אחרי לפי המתודה של Green) |
| imbalance | 9 | 7 מסווגים `capacity-limited`, 2 מדיניות light-justify: לוודא שסיווג ההשארה מוצדק |
| containment-rounding | 6 | מתועד כעיגול של כ-1.3 עד 1.4px בסמני הערות: לבחון הצדקה לסף |
| structural-fallback | 6 | לבחון האם מופעל נכון ומתי ניתן למנוע |
| sparse-page | 3 | עמודים בסוף פרק: לבחון חלופות פריסה |
| square-bracket-scope | 3 | מקורם בטקסט: החלטת עורך (שינוי תוכן: **דורש אישורך**) |
**שער:** כל ממצא נשאר פתוח רק עם סיבה מתועדת. אין סגירה דרך שינוי ספים.

## שלב 6 — שער שחרור ותיעוד
1. ריצה מלאה בשתי תצורות על אותו SHA, עם fingerprint ו-`--repeat-check`, ללא רשת.
2. אין HIGH. כל MEDIUM מוסבר.
3. ריצת פרקים לבידוד תקלות (לפחות 13 פרקי `chapters_focus/`).
4. עדכון `README` (אחד), `WORKLOG` (אחד), `ARCHITECTURE`, איחוד `LAYOUT_DEPENDENCY_MAP`.
5. הערה בריפואים הישנים (בלי לשנות אותם): מצביע לריפו החדש. **בכפוף להחלטתך.**

## ניהול סיכונים
| סיכון | מצב | הפחתה |
|---|---|---|
| גרסת Chromium משנה תוצאות | F6: יציב בין 138/140/153 בדגימה | הצמדה + שער "browser bump" |
| פער כיול של Gold | F5: לא ידוע | לא מסתמכים על מספרי Gold ההיסטוריים |
| תלות ברשת | F1 | שלב 2.1 + 2.5 |
| תצורת עיטורים לא נבדקה | סעיף 3.1 | ריצה ראשונה בשלב 3 |
| שני מימושים של אותה תכונה | hunks 1–4 | בחירה לפי בדיקה |
| שינוי מדיניות `avoid-runt-word` | 4A | baseline חדש מתועד |

## סטטוס ריפו
הריפו `SUGINACH/Tora_Book_Typesetter_Orange` קיים. שלבים 1–2 נדחפו אליו (קומיט קוד אחד + 9 קומיטי גופנים), ושער שלב 2 עבר על שכפול טרי. ה-workflows הועברו להפעלה על `main` ולשימוש ב-`npm ci`, **וטרם רצו ב-GitHub Actions**, ולכן עדיין לא ידוע אם הם עוברים שם. הצעד הבא המומלץ: להפעיל ידנית (`workflow_dispatch`) את `geometry-audit-cli` ואת `geometry-audit-long` ולהשוות ל-`expected_baseline.json`.
