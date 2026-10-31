# WORKLOG — Tora_Book_Typesetter_Orange

Entries are newest first. Every change records: what, why, how it was verified, and what was NOT verified.

## 4F — The renderer loads the JSON ornament assets (port of Gold bd9cd15, with a proper wait)
- **Bug:** the UI window sends the renderer only text and settings, but `window.onload` in `app.js` returned immediately in renderer mode, so the renderer never loaded `ornaments_up_down.json`, `section_dividers.json`, headers, shaar designs, etc. An ornament/divider chosen from the JSON lists in the UI was not available in the renderer and silently did not render (`ORNAMENTS_UD` had only the 4 built-ins). The same applies to `renderer.html` as used by the CLI.
- **Fix:** in renderer mode `onload` loads `loadExternalJSONAssets()` and `loadFolderAssetsAndThemes()` and then calls `window.__rendererAssetsDone()`. **Difference from Gold:** Gold announces `renderer-ready` a second time after loading, but the bridge already announced it at script start, so a typeset message could still run before the assets. Here `renderer-bridge.js` creates `window.__rendererAssetsReady` early and the `typeset` handler awaits it (30 s safety timeout with a warning).
- **Test-first:** `tests/renderer-assets.test.js` (6 checks, typeset is posted right after load, so it also proves the wait): before 2/6, after 6/6. Runs in CI.
- **Layout effect with default settings:** none. Fresh full-document run (lab, Chromium 140.0.7339.0, offline): 639 pages, 39 issues (0/11/28), same kinds, no console errors.
- **Not verified:** the actual UI (index.html + iframe) was not opened in a browser; the order of messages there was reasoned from the code. The CI ornament configuration may now resolve JSON ids that previously did nothing; CI will show whether its counts change.

## 4E — Shaar dividers (`shaar-main-divider`, `shaar-sub-divider`), ported from Gold
- **What:** the ornament on the main title page and on the sub title page can be replaced by a divider asset from `section_dividers.json`; `none` (default) keeps the built-in SVG (byte-identical markup, now emitted through a variable). UI block, defaults, bridge whitelist and JSON population added.
- **Test-first:** `tests/shaar-divider.test.js` (6 checks): before 4/6 (both replacement checks fail), after 6/6. Runs in CI.
- **Layout effect:** none by default. Full document (lab, Chromium 140.0.7339.0, offline, fresh run completed this time): 639 pages, 39 issues (0/11/28), same kinds as the baseline.
- **Process note:** two earlier attempts to re-verify the baseline hit the sandbox time limit; a script printed PASS from a stale report file. That PASS was discarded. Verification scripts must write to a fresh output path or delete the old one first.
- **Not verified:** visual appearance of the replaced ornaments; the back title page has no divider setting (same as Gold).

## 4D — Heading dividers H3-H6 (`heading-divider-h3..h6`), ported from Gold (84bb0c2, 194f19c)
- **What:** an ornament is inserted before a heading of level 3-6 when a previous heading of the SAME level was seen and no higher-level heading came in between. UI block, defaults (`none`), bridge whitelist, JSON population (`app.js`) and `getHeadingDividerHTML` (`decorations.js`) added. Default `none` = no layout change.
- **Differences from Gold (deliberate):**
  1. One helper (`tryInsertHeadingDivider`) used at all three insertion sites; it **measures before inserting** (Gold's `194f19c` only did this at one site, which is the endless-loop fix).
  2. No divider at the top of a column / empty flow (nothing precedes it, and it removes the only way to loop: divider + heading overflowing an empty column forever).
  3. `lastHeadingSeen` state is **restored** when a heading is rolled back and when a page is rebuilt (`pageState`); Gold left it stale, so a re-placed heading saw itself as its own predecessor.
  4. A removed divider is not counted as a rolled-back token (Gold added it to the token count).
- **Test-first:** `tests/heading-divider.test.js` (9 checks): before 6/9, after 9/9. Covers first-of-level, reset by a higher level, only configured levels, no orphan divider at a column end, and termination on a real chapter (ch03, 18 H3/H4) with all four levels on.
- **Layout effect:** none by default. Lab full document, dividers off: 639 pages, 39 issues, `verify_phase2` PASS. **Stress run with dividers h3-h6 on** (`pyramid`): terminates, 663 pages, 56 issues (0 high / 17 medium / 39 low): more pages and more findings are expected because the dividers add height; no quality bar was set for that configuration.
- **Not verified:** visual appearance of the dividers (no screenshot reviewed), the other built-in/JSON divider styles, interaction with `h3` side ornaments, CI results (pending at commit time).

## 4C — `h2-orn-scope` reachable from the UI + settings consistency test
- **Finding:** the engine already implements H2 ornament scopes (`both`, `siman_only`, `title_only`) and `renderer-bridge.js` accepts `h2-orn-scope`, but there was no control in `index.html` and no default in `default_settings.json`: the feature existed and could not be reached. Gold had the control (plus a 4th option `separate`, which here is covered by the existing `h2-title-orn-mode` = top/bottom).
- **What:** added the `h2-orn-scope` select (3 options) and the default `both` (equal to the engine's built-in default, so layouts do not change).
- **Tests:** `tests/h2-ornament-scope.test.js` (engine order of top/siman/title/bottom per scope: 5/5 before and after: behaviour was already correct) and `tests/settings-consistency.test.js` (every id accepted by the renderer has a UI control and a default, except 6 documented exemptions): before 2/4, after 4/4. Both run in CI.
- **Layout effect:** none expected (default equals previous implicit default); to be confirmed by `tools/verify_phase2.sh` and CI.
- **Not ported (decision recorded):** Gold's `separate` scope value; the same placement is available via `h2-title-orn-mode`.
- **Still open from the Gold-only list:** heading dividers H3-H6 (`heading-divider-h3..h6`, includes the Gold `194f19c` infinite-loop fix, which only exists inside that feature) and shaar dividers (`shaar-main-divider`, `shaar-sub-divider`).

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
