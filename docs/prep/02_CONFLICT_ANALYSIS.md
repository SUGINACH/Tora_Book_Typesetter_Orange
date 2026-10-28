# ניתוח קונפליקטים — מיזוג ניסיוני Green `0ddaf89` ↔ Gold `31ed2ca` (אב: `5c646c1`)

נוצר מ-`git merge-tree --write-tree` (לא נגע בקבצים). "ירוק" = Green, "זהב" = Gold. כל hunk נשמר במלואו בקובץ נפרד בתיקיית `conflicts/`.

## typesetter.js

| # | שורה (במיזוג) | פונקציה מקיפה (ברמה העליונה) | שורות ירוק | שורות זהב | קובץ מלא |
|---|---|---|---|---|---|
| 1 | 642 | `buildHeaderGridHTML` | 1 | 3 | `conflicts/typesetter_js_hunk_01.txt` |
| 2 | 666 | `buildHeaderGridHTML` | 30 | 9 | `conflicts/typesetter_js_hunk_02.txt` |
| 3 | 731 | `buildHeaderGridHTML` | 19 | 6 | `conflicts/typesetter_js_hunk_03.txt` |
| 4 | 769 | `buildHeaderGridHTML` | 1 | 1 | `conflicts/typesetter_js_hunk_04.txt` |
| 5 | 1752 | `justifyColumnVertically` | 3 | 4 | `conflicts/typesetter_js_hunk_05.txt` |
| 6 | 1769 | `justifyColumnVertically` | 1 | 5 | `conflicts/typesetter_js_hunk_06.txt` |
| 7 | 1939 | `stretchLastBlockToBottom` | 5 | 22 | `conflicts/typesetter_js_hunk_07.txt` |
| 8 | 1979 | `stretchLastBlockToBottom` | 2 | 1 | `conflicts/typesetter_js_hunk_08.txt` |
| 9 | 2043 | `balanceColumns` | 33 | 17 | `conflicts/typesetter_js_hunk_09.txt` |
| 10 | 2496 | `balanceColumns` | 1 | 24 | `conflicts/typesetter_js_hunk_10.txt` |
| 11 | 2532 | `balanceColumns` | 6 | 9 | `conflicts/typesetter_js_hunk_11.txt` |
| 12 | 2706 | `balanceColumns` | 95 | 24 | `conflicts/typesetter_js_hunk_12.txt` |
| 13 | 3902 | `flushFootnotesInto` | 20 | 29 | `conflicts/typesetter_js_hunk_13.txt` |
| 14 | 5678 | `typesetDocumentCore` | 16 | 9 | `conflicts/typesetter_js_hunk_14.txt` |
| 15 | 5958 | `typesetDocumentCore` | 1 | 6 | `conflicts/typesetter_js_hunk_15.txt` |
| 16 | 6362 | `typesetDocumentCore` | 67 | 16 | `conflicts/typesetter_js_hunk_16.txt` |
| 17 | 6456 | `typesetDocumentCore` | 5 | 6 | `conflicts/typesetter_js_hunk_17.txt` |
| 18 | 6514 | `typesetDocumentCore` | 60 | 1 | `conflicts/typesetter_js_hunk_18.txt` |
| 19 | 6718 | `typesetDocumentCore` | 1 | 17 | `conflicts/typesetter_js_hunk_19.txt` |
| 20 | 6746 | `typesetDocumentCore` | 1 | 12 | `conflicts/typesetter_js_hunk_20.txt` |

## geometry-audit.js

| # | שורה (במיזוג) | פונקציה מקיפה (ברמה העליונה) | שורות ירוק | שורות זהב | קובץ מלא |
|---|---|---|---|---|---|
| 1 | 590 | `extractGeometry` | 13 | 4 | `conflicts/geometry-audit_js_hunk_01.txt` |
| 2 | 723 | `auditContainment` | 11 | 9 | `conflicts/geometry-audit_js_hunk_02.txt` |
| 3 | 957 | `auditColumnBalance` | 35 | 18 | `conflicts/geometry-audit_js_hunk_03.txt` |
| 4 | 1177 | `auditColumnBalance` | 32 | 3 | `conflicts/geometry-audit_js_hunk_04.txt` |
| 5 | 1291 | `auditSparseLastLine` | 2 | 14 | `conflicts/geometry-audit_js_hunk_05.txt` |
| 6 | 1321 | `auditSparseLastLine` | 2 | 5 | `conflicts/geometry-audit_js_hunk_06.txt` |
| 7 | 1335 | `auditSparseLastLine` | 25 | 1 | `conflicts/geometry-audit_js_hunk_07.txt` |
| 8 | 1597 | `findPageIdxInTree` | 506 | 731 | `conflicts/geometry-audit_js_hunk_08.txt` |
| 9 | 2905 | `auditGeometry` | 1 | 3 | `conflicts/geometry-audit_js_hunk_09.txt` |

## style.css

| # | שורה (במיזוג) | פונקציה מקיפה (ברמה העליונה) | שורות ירוק | שורות זהב | קובץ מלא |
|---|---|---|---|---|---|
| 1 | 1253 | `(top-level)` | 19 | 5 | `conflicts/style_css_hunk_01.txt` |

## package.json

| # | שורה (במיזוג) | פונקציה מקיפה (ברמה העליונה) | שורות ירוק | שורות זהב | קובץ מלא |
|---|---|---|---|---|---|
| 1 | 2 | `(top-level)` | 10 | 11 | `conflicts/package_json_hunk_01.txt` |

**הערה:** בקובץ `typesetter.js` פונקציות מקוננות בתוך `typesetDocumentCore` מדווחות לפי הפונקציה העליונה האחרונה שזוהתה, ולכן שורות בליבה עשויות להופיע תחת שם של פונקציה סמוכה. מי שפותר hunk צריך לפתוח את הקובץ המצורף.
