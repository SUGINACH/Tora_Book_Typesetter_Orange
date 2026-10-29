# WORKLOG — Tora_Book_Typesetter_Orange

Entries are newest first. Every change records: what, why, how it was verified, and what was NOT verified.

## 4B — Header fixes: `same_as_even` and `hdr-h1-title-mode`
- **What 1 (bug):** the UI offers `same_as_even` for the odd-page header slots, but the engine did not resolve it, so the slot rendered empty (found by comparing with Gold, which resolved it). It now resolves to the verso (even-page) type of the same column. A `same_as_even` / `same_as_odd` cycle leaves the slot empty. Only active with `hdr-distinct-even-odd`.
- **What 2 (setting, no behaviour change by default):** new `hdr-h1-title-mode` = `full` (default, current behaviour: whole H1 text in the header) | `main` (only the part before the first dash, Gold's `extractH1TitleMain`). **Why a setting:** the two source lines recorded opposite user instructions (Gold worklog: header must show only titleMain; Green worklog / code comment: header must show the full part name). This is an editorial decision that is not mine to make; **open question for the editor: which default?**
- **Test-first:** `tests/header-settings.test.js`: before 4/6 pass, after 6/6. `tests/lib/harness.js` is the shared offline harness. Both tests run in `geometry-audit-cli.yml`.
- **Layout effect:** none by default. Lab full document (Chromium 140.0.7339.0, offline) is unchanged: 639 pages, 39 issues (0/11/28), `tools/verify_phase2.sh` PASS.
- **Not verified:** the odd/even header with real ornaments (`ornament` configs) beyond what CI's ornament run covers; visual rendering of the new UI select (not opened in a browser).

## 4A — Settings wiring (7 settings that the UI declared but the engine ignored)
- **What:** typesetter.js now reads `page-num-initial-value`, `general-toc-count-numbering`, `general-toc-show-numbering`, `detailed-toc-count-numbering`, `detailed-toc-show-numbering`, `avoid-runt-word` (new `applyAvoidRuntWord`) and `body-last-line-align`. Ported from Gold `f069408` (not cherry-picked; adapted and reduced to these seven).
- **Why:** before this change none of the seven had any reference in the engine (verified by grep), so changing them in the UI did nothing.
- **Test-first:** `tests/settings-wiring.test.js` (10 checks). On the unpatched engine 2/10 pass (precondition + no-external-requests); after the change 10/10 pass. The test is also run in `geometry-audit-cli.yml`.
- **Layout effect (lab, Chromium 140.0.7339.0, offline):** full document 639 pages, 39 issues (0 high / 11 medium / 28 low) versus 40 (0/12/28) before; ledger 857/857 (was 858). `avoid-runt-word` defaults to true, so this is a layout-policy change; `expected_baseline.json` was updated accordingly.
- **Not verified:** the ornament-config full run on this commit (CI runs it), and any pixel-level comparison.

## 2 — Environment hardening (import of Green@0ddaf89)
- Self-hosted fonts replace the Google `@import` (layout used to depend on the network: without the fonts the engine threw "Layout infeasible" on chapter 63's last paragraph).
- Playwright pinned to 1.55.0 with `package-lock.json`; workflows use `npm ci` and run on `main`.
- CLI records `browserVersion`, `playwrightVersion`, `inputSha256`, `fontsCssSha256` and fails (exit 7) on any external request.
- Verified: fresh clone from GitHub, offline, Chromium 140.0.7339.0: 639 pages, 40 issues (0/12/28); GitHub Actions: both workflows succeeded.
- See `docs/prep/06_LAB_FINDINGS.md` for the evidence and its limits.
