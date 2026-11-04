#!/usr/bin/env node
'use strict';
/*
 * Pre-typesetting text check (text-check.js), pure Node test.
 * Rule from the editor: bracketed text ( ... ) or [ ... ] must not contain headings of level 1-6 inside it.
 * Also reported: closing brackets with nothing open, closing brackets of the wrong kind, brackets never closed.
 * Heading lines themselves are not scanned (brackets inside a title belong to the title).
 * Usage: node tests/text-check.test.js
 */
const fs = require('fs');
const path = require('path');
const { makeChecker } = require('./lib/harness');
const { check, finish } = makeChecker();

let TextCheck;
try { TextCheck = require('../text-check.js'); } catch (e) { check('text-check.js can be loaded', false, e.message); process.exit(finish()); }
const run = lines => TextCheck.check(lines.join('\n'));
const types = r => r.issues.map(i => i.type).join(',');

let r = run(['כותרת 1 מספר 1 - ספר', 'כותרת 2 מספר 1 - סימן (א.)', 'פסקה רגילה (עם סוגריים) ו[עוד] טקסט.']);
check('balanced text has no issues', r.issues.length === 0, types(r));
check('result has line count', r.lineCount === 3, String(r.lineCount));

r = run(['פסקה ראשונה (פותחת סוגריים', 'כותרת 3 מספר 1 - כותרת בתוך סוגריים', 'המשך) וסיום.']);
check('heading level 3 inside open parenthesis is reported', r.issues.length === 1 && r.issues[0].type === 'heading-inside-brackets', types(r));
check('the report points at the heading line (2) and the line where the bracket opened (1)', r.issues[0] && r.issues[0].line === 2 && r.issues[0].openLine === 1, JSON.stringify(r.issues[0]));

r = run(['טקסט [מרובע פתוח', 'כותרת 1 מספר 2 - שער', 'כותרת 2 מספר 1 - סימן', 'סוף]']);
check('one issue per open bracket, not one per heading', r.issues.filter(i => i.type === 'heading-inside-brackets').length === 1, types(r));

r = run(['טקסט (פתוח', 'כותרת 7 מספר 1 - כותרת צד', 'סוף).']);
check('level 7 (side title) inside brackets is allowed', r.issues.length === 0, types(r));
r = run(['טקסט (פתוח', 'כותרת 0 מספר 1 - הקדמה', 'סוף).']);
check('level 0 is not part of the 1-6 rule', r.issues.length === 0, types(r));
r = run(['טקסט (פתוח', 'כותרת 6 מספר 1 - עמוק', 'סוף).']);
check('level 6 inside brackets is reported', r.issues.length === 1, types(r));

r = run(['טקסט רגיל', 'עוד טקסט) עם סוגר סוגר עודף.']);
check('a closing bracket with nothing open is reported with line and column', r.issues.length === 1 && r.issues[0].type === 'unmatched-closer' && r.issues[0].line === 2 && r.issues[0].col > 0, JSON.stringify(r.issues[0]));

r = run(['כא) וְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ', 'י"א) פסקה מסומנת', 'ב) עוד סימון']);
check('verse/enumerator markers like "כא)" at the start of a line are not brackets', r.issues.length === 0, types(r));
r = run(['טקסט רגיל ואז א) באמצע שורה.']);
check('the same marker in the middle of a line is still reported', r.issues.length === 1 && r.issues[0].type === 'unmatched-closer', types(r));
r = run(['(פותח', 'א) זה סוגר רגיל כי יש סוגר פתוח', 'טקסט.']);
check('with an open bracket, "א)" at the line start closes it normally', r.issues.length === 0, types(r));

r = run(['טקסט (פותח עגול ונסגר מרובע] כאן.']);
check('a closing bracket of the wrong kind is reported', r.issues.some(i => i.type === 'mismatched-bracket'), types(r));

r = run(['פסקה אחת (שלא נסגרת', 'פסקה שנייה בלי סגירה.']);
check('a bracket that is never closed is reported at its opening line', r.issues.length === 1 && r.issues[0].type === 'unclosed-bracket' && r.issues[0].line === 1, JSON.stringify(r.issues[0]));

r = run(['כותרת 2 מספר 1 - סימן ((כפול', 'פסקה רגילה.']);
check('brackets inside a heading title are ignored', r.issues.length === 0, types(r));

r = run(['(א', '[ב', 'כותרת 4 מספר 1 - כותרת', 'ג]', 'ד)']);
check('two open brackets produce two heading issues, then both close cleanly', r.issues.filter(i => i.type === 'heading-inside-brackets').length === 2 && r.issues.length === 2, types(r));

// the canonical document
const big = fs.readFileSync(path.join(__dirname, '..', 'very_long_test_text.txt'), 'utf8');
const t0 = Date.now(); r = TextCheck.check(big); const ms = Date.now() - t0;
check('the canonical 1.9 MB document is checked in under 2 seconds', ms < 2000, `${ms} ms`);
const counts = {}; r.issues.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
console.log('INFO canonical document:', JSON.stringify(counts), '| lines:', r.lineCount);
check('canonical document: exactly the 5 real findings (2 extra ")" and the 5446-5451 group)', r.issues.length === 5 && (counts['unmatched-closer'] || 0) === 2 && (counts['mismatched-bracket'] || 0) === 1 && (counts['heading-inside-brackets'] || 0) === 2, JSON.stringify(counts));
check('canonical document: result is a list with line numbers', r.issues.every(i => Number.isInteger(i.line) && i.line >= 1 && i.line <= r.lineCount), 'bad line number');
process.exit(finish());
