# מטריצת התאמה תלת-כיוונית — פונקציות

השוואה לפי גוף פונקציה (טקסט מנורמל ברווחי סוף שורה) בין האב `5c646c1`, Gold `31ed2ca` ו-Green `0ddaf89`.
**מגבלה:** זיהוי הפונקציות הוא לפי שורת `function name(` וסגירה באותו עומק הזחה, בלי מנתח JS מלא. פונקציות חץ/ביטוי (`const f = () =>`) אינן נכללות. כל מקרה גבולי צריך אימות ידני.

## typesetter.js

| קטגוריה | מספר |
|---|---|
| זהה בשניהם | 79 |
| רק ב-Gold | 24 |
| רק ב-Green | 12 |
| שונה בשניהם (נדרש איחוד) | 9 |
| שונה רק ב-Green | 7 |
| שונה רק ב-Gold | 7 |

### שונה בשניהם (נדרש איחוד) (9)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `balanceColumns` | 1794 | 1524 | 340 | 671 |
| `better` | 1993 | 1932 | 12 | 12 |
| `buildHeaderGridHTML` | 637 | 563 | 77 | 102 |
| `evalCand` | 1940 | 1886 | 53 | 46 |
| `flushFootnotesInto` | 3014 | 3178 | 54 | 53 |
| `justifyColumnVertically` | 1502 | 1253 | 123 | 56 |
| `shrinkColumnVertically` | 1632 | 1316 | 56 | 51 |
| `stretchLastBlockToBottom` | 1693 | 1413 | 49 | 59 |
| `typesetDocumentCore` | 3657 | 3938 | 1707 | 1885 |

### רק ב-Gold (24)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `applyAvoidRuntWord` | 577 | — | 12 | — |
| `applyWordSpacing` | 980 | — | 18 | — |
| `balanceByWordSpacing` | 2145 | — | 55 | — |
| `collectPageElements` | 3702 | — | 23 | — |
| `collectPageSignatures` | 3728 | — | 24 | — |
| `compressByWordSpacing` | 1119 | — | 24 | — |
| `computeDelta` | 3753 | — | 29 | — |
| `describeNode` | 3672 | — | 29 | — |
| `extractH1TitleMain` | 566 | — | 6 | — |
| `findProblemNode` | 3829 | — | 32 | — |
| `fixDropWordInColumns` | 1799 | — | 11 | — |
| `getHeaderSettings` | 604 | — | 28 | — |
| `getLastLineInfo` | 1915 | — | 25 | — |
| `insertOrn` | 4444 | — | 7 | — |
| `maybeGetHeadingDivider` | 895 | — | 8 | — |
| `measureWordSpacingBaseline` | 947 | — | 19 | — |
| `stretchByHeadingSpacing` | 1059 | — | 53 | — |
| `stretchByLetterSpacing` | 1011 | — | 40 | — |
| `stretchByWordSpacing` | 1150 | — | 24 | — |
| `walk` | 3704 | — | 18 | — |
| `walk#3729` | 3730 | — | 19 | — |
| `wordSpacingCompressCapacity` | 1176 | — | 7 | — |
| `wordSpacingFromFactor` | 968 | — | 7 | — |
| `wordSpacingStretchCapacity` | 1185 | — | 7 | — |

### רק ב-Green (12)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `__footnoteDomSignature` | — | 2894 | — | 32 |
| `captureParenFontCounterfactualDiagnostics` | — | 6002 | — | 90 |
| `captureParenthesisScopeDiagnostics` | — | 5835 | — | 161 |
| `getJustifyCapacityAudit` | — | 909 | — | 38 |
| `lines` | — | 3819 | — | 9 |
| `pagesFor` | — | 3901 | — | 45 |
| `record` | — | 3888 | — | 58 |
| `recordLayoutGeometryStage` | — | 1374 | — | 38 |
| `repositionOverflowingSideNotes` | — | 2287 | — | 56 |
| `snapshot` | — | 3828 | — | 58 |
| `targetInfo` | — | 3886 | — | 60 |
| `wrap` | — | 3909 | — | 37 |

### שונה רק ב-Gold (7)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `compressColumnBy` | 1259 | 982 | 77 | 71 |
| `fitH2OrnamentsToText` | 3377 | 3539 | 44 | 15 |
| `formatPageNumberDisplay` | 27 | 27 | 28 | 25 |
| `getLinesFromParagraph` | 458 | 451 | 100 | 94 |
| `renderPaginatedTOC` | 3217 | 3380 | 106 | 105 |
| `rollbackTrailingHeadings` | 869 | 827 | 16 | 10 |
| `updateStyles` | 127 | 124 | 74 | 70 |

### שונה רק ב-Green (7)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `applyCrossParagraphParens` | 5372 | 6093 | 31 | 35 |
| `auditFnMeasurement` | 2928 | 3056 | 61 | 97 |
| `getSplitRules` | 850 | 801 | 5 | 10 |
| `markInsideParenParagraphs` | 5432 | 6157 | 31 | 31 |
| `measureFootnoteAreaHeight` | 2837 | 2927 | 87 | 125 |
| `resolveParagraphSplit` | 859 | 815 | 8 | 10 |
| `tryReclaimOrphanTail` | 1355 | 1072 | 146 | 180 |

## geometry-audit.js

| קטגוריה | מספר |
|---|---|
| זהה בשניהם | 23 |
| רק ב-Gold | 18 |
| שונה בשניהם (נדרש איחוד) | 6 |
| רק ב-Green | 6 |
| שונה רק ב-Green | 6 |

### שונה בשניהם (נדרש איחוד) (6)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `auditColumnBalance` | 442 | 861 | 37 | 286 |
| `auditContainment` | 327 | 646 | 81 | 94 |
| `auditGeometry` | 1513 | 1990 | 38 | 110 |
| `auditSparseLastLine` | 516 | 1210 | 59 | 78 |
| `classifyElement` | 42 | 165 | 55 | 58 |
| `extractGeometry` | 272 | 566 | 28 | 53 |

### רק ב-Gold (18)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `auditBlockGaps` | 1049 | — | 60 | — |
| `auditOrnaments` | 794 | — | 76 | — |
| `auditPageFillRatio` | 897 | — | 145 | — |
| `auditSettingsVerification` | 1115 | — | 396 | — |
| `checkHeadingFirstChildMargin` | 1416 | — | 14 | — |
| `checkHeadingMargins` | 1332 | — | 7 | — |
| `checkRecursive#794` | 795 | — | 73 | — |
| `collectStats` | 1152 | — | 17 | — |
| `enrichNode` | 2027 | — | 65 | — |
| `findDescendantByType` | 737 | — | 9 | — |
| `findDomForNodePublic` | 1983 | — | 3 | — |
| `findLastBlockBottom` | 991 | — | 8 | — |
| `getPageMetrics` | 2096 | — | 21 | — |
| `hasH2` | 903 | — | 9 | — |
| `hasSecDiv` | 943 | — | 4 | — |
| `overlapArea` | 875 | — | 5 | — |
| `rOverlaps` | 871 | — | 3 | — |
| `semanticRole` | 1990 | — | 28 | — |

### רק ב-Green (6)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `auditContainerGaps` | — | 1490 | — | 201 |
| `auditSideNoteBounds` | — | 741 | — | 82 |
| `auditSparsePage` | — | 1692 | — | 156 |
| `auditSquareBracketScopes` | — | 1852 | — | 136 |
| `resolveColumnGeometry` | — | 871 | — | 35 |
| `resolveNoteMarkerInlineGeometry` | — | 44 | — | 119 |

### שונה רק ב-Green (6)

| פונקציה | שורה ב-Gold | שורה ב-Green | אורך Gold | אורך Green |
|---|---|---|---|---|
| `auditSiblingOverlap` | 409 | 824 | 32 | 36 |
| `auditWidowOrphan` | 480 | 1148 | 35 | 61 |
| `buildNode` | 220 | 387 | 50 | 177 |
| `buildNodeWithRefs` | 1846 | 2408 | 48 | 108 |
| `collectLines` | 132 | 256 | 29 | 72 |
| `extractGeometryWithDomRefs` | 1819 | 2368 | 26 | 39 |
