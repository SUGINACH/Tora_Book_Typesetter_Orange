/*
 * text-check.js — בדיקה מוקדמת של הטקסט לפני עימוד (UMD: global `TextCheck` בדפדפן, module.exports ב-Node).
 *
 * הכלל (החלטת עורך): טקסט מוסגר ( ... ) או [ ... ] אינו אמור להכיל בתוכו כותרות 1–6.
 * נבדקים גם: סוגר סוגר שאין לו פותח, סוגר מסוג שגוי, וסוגר פותח שלא נסגר.
 * שורות כותרת (כותרת N ...) אינן נסרקות לסוגריים: סוגריים בתוך שם הכותרת שייכים לכותרת.
 *
 * check(text, opts) -> { lineCount, issues: [ { type, severity, line, col, openLine, openCol, message } ] }
 *   opts.levels: רמות הכותרות שאסור שיופיעו בתוך סוגריים (ברירת מחדל 1..6)
 * סוגי בעיות: 'heading-inside-brackets', 'unmatched-closer', 'mismatched-bracket', 'unclosed-bracket'
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TextCheck = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var OPEN = { '(': ')', '[': ']' };
  var CLOSE = { ')': '(', ']': '[' };
  var HEADING = /^\s*כותרת\s+(\d+)(?=\D|$)/;
  var NAME = { '(': 'סוגריים עגולים', '[': 'סוגריים מרובעים' };
  // סימון מספור בתחילת שורה, למשל "כא) והיה אם שמוע": אות עברית אחת עד חמש (גם עם גרש/גרשיים) ואז ")".
  // זה אינו סוגר. החריג תקף רק כשאין סוגר פתוח; אם יש, "א)" נחשב כסגירה רגילה.
  var ENUMERATOR_PREFIX = /^\s*[\u05D0-\u05EA\u05F3\u05F4"']{1,5}$/;

  function check(text, opts) {
    opts = opts || {};
    var levels = opts.levels || [1, 2, 3, 4, 5, 6];
    var lines = String(text || '').split('\n');
    var issues = [];
    var stack = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var h = HEADING.exec(line);
      if (h) {
        var level = parseInt(h[1], 10);
        if (levels.indexOf(level) !== -1) {
          for (var k = 0; k < stack.length; k++) {
            var o = stack[k];
            if (o.reported) continue;
            o.reported = true;
            issues.push({
              type: 'heading-inside-brackets', severity: 'error', line: i + 1, col: 1, openLine: o.line, openCol: o.col,
              message: 'כותרת ' + level + ' בשורה ' + (i + 1) + ' נמצאת בתוך ' + NAME[o.ch] + ' שנפתחו בשורה ' + o.line + ' (עמודה ' + o.col + ') ולא נסגרו לפניה.'
            });
          }
        }
        continue;
      }
      for (var c = 0; c < line.length; c++) {
        var ch = line.charAt(c);
        if (OPEN[ch]) {
          stack.push({ ch: ch, line: i + 1, col: c + 1, reported: false });
        } else if (CLOSE[ch]) {
          if (!stack.length) {
            if (ch === ')' && ENUMERATOR_PREFIX.test(line.slice(0, c))) continue;
            issues.push({ type: 'unmatched-closer', severity: 'error', line: i + 1, col: c + 1,
              message: 'סוגר "' + ch + '" בשורה ' + (i + 1) + ' (עמודה ' + (c + 1) + ') אין לו פותח.' });
          } else if (stack[stack.length - 1].ch === CLOSE[ch]) {
            stack.pop();
          } else {
            var top = stack.pop();
            issues.push({ type: 'mismatched-bracket', severity: 'error', line: i + 1, col: c + 1, openLine: top.line, openCol: top.col,
              message: 'סוגר "' + ch + '" בשורה ' + (i + 1) + ' (עמודה ' + (c + 1) + ') אינו מתאים ל-"' + top.ch + '" שנפתח בשורה ' + top.line + '.' });
          }
        }
      }
    }
    for (var s = 0; s < stack.length; s++) {
      if (stack[s].reported) continue;
      issues.push({ type: 'unclosed-bracket', severity: 'error', line: stack[s].line, col: stack[s].col,
        message: NAME[stack[s].ch] + ' שנפתחו בשורה ' + stack[s].line + ' (עמודה ' + stack[s].col + ') לא נסגרו עד סוף הטקסט.' });
    }
    issues.sort(function (a, b) { return a.line - b.line || a.col - b.col; });
    return { lineCount: lines.length, issues: issues };
  }
  return { check: check };
});
