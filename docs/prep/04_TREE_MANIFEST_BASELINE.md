# מניפסט עץ לריפו החדש — נתוני בסיס (לא החלטות מחיקה)

נוצר מקריאת העצים המעקבים (`git ls-files`) של שני הקצוות. "מופיע בהפניה" = שם הקובץ מופיע כמחרוזת בקוד/CSS/HTML/JSON/workflow פעיל.
**מגבלה:** חיפוש מחרוזות. הפניות שנבנות דינמית (template literals, שרשור נתיבים) אינן נתפסות, ולכן "לא מופיע בהפניה" אינו הוכחה שהקובץ אינו בשימוש. זה ההיגיון שמסמך Green אוסר מחיקה לפי שם/גודל בלבד, ואני מקיים אותו: **הרשימה היא רשימת בדיקה, לא רשימת מחיקה.**

| מדד | Green `0ddaf89` | Gold `31ed2ca` |
|---|---|---|
| קבצים מעקבים | 3759 | 3586 |
| קבצי גופן | 3518 | 3518 |
| גופנים שהשם שלהם מופיע בהפניה | 3516 | 3516 |
| נפח גופנים (MB) | 277.3 | 277.3 |
| נפח גופנים ללא הפניה (MB) | 0.3 | 0.3 |
| קבצי מורשת (old_ver, debug, test, Parallel_Programming) | 152 | 0 |
| נפח מורשת (MB) | 129.9 | 0.0 |
| שאר הקבצים (ללא גופנים ומורשת) | 89 | 68 |

## קבצים (לא גופנים/מורשת/מסמכי md) שהשם שלהם אינו מופיע בהפניה כלשהי — לבדיקה ידנית

### green (9)
- `.nojekyll`
- `favicon.ico`
- `long_test_text_2.txt`
- `long_test_text_no_parentheses.txt`
- `mid_long_test_text.txt`
- `parallel-step-by-step-audit-21.js`
- `reference-analysis.json`
- `rendered-document_4.html`
- `rendered-document_4.pdf`

### gold (5)
- `.gitignore`
- `.nojekyll`
- `favicon.ico`
- `package.json`
- `reference-analysis.json`
