# WORKLOG — Tora_Book_Typesetter_Orange

Entries are newest first. Every change records: what, why, how it was verified, and what was NOT verified.

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
