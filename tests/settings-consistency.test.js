#!/usr/bin/env node
'use strict';
/*
 * Static consistency test (no browser): every setting id that the renderer accepts (renderer-bridge.js whitelist) must have
 * a UI control in index.html and a default in default_settings.json, otherwise the engine supports a feature that the user can
 * never reach (or a default that is silently undefined). Known, documented exemptions are listed explicitly below.
 * Usage: node tests/settings-consistency.test.js
 */
const fs = require('fs');
const path = require('path');
const { root, makeChecker } = require('./lib/harness');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// Exempt on purpose. Each entry says why.
const EXEMPT = {
  'settings-hidden': 'container id, not a setting',
  'gtoc-shows': 'TOC levels are checkbox classes in the UI (.gtoc-show), delivered as a comma-separated list',
  'gtoc-groups': 'TOC levels are checkbox classes in the UI (.gtoc-grp), delivered as a comma-separated list',
  'dtoc-shows': 'TOC levels are checkbox classes in the UI (.dtoc-show), delivered as a comma-separated list',
  'dtoc-groups': 'TOC levels are checkbox classes in the UI (.dtoc-grp), delivered as a comma-separated list',
  'balance-chapter-end': 'engine option with no UI and an in-code default; kept as is until the editor decides whether it needs a control'
};

const bridge = read('renderer-bridge.js');
const head = bridge.slice(0, bridge.indexOf('function applySettings'));
const ids = Array.from(new Set((head.match(/'([A-Za-z0-9][A-Za-z0-9_-]*)'/g) || []).map(s => s.slice(1, -1)))).filter(s => s.includes('-'));
const ui = new Set((read('index.html').match(/id="([^"]+)"/g) || []).map(s => s.slice(4, -1)));
const defaults = new Set(Object.keys(JSON.parse(read('default_settings.json'))));

const { check, finish } = makeChecker();
check('renderer whitelist was parsed (sanity)', ids.length > 200, `parsed ${ids.length} ids`);
const missingUi = ids.filter(i => !ui.has(i) && !EXEMPT[i]);
const missingDefault = ids.filter(i => !defaults.has(i) && !EXEMPT[i]);
check('every renderer setting has a UI control (except documented exemptions)', missingUi.length === 0, 'no control in index.html: ' + missingUi.join(', '));
check('every renderer setting has a default in default_settings.json (except documented exemptions)', missingDefault.length === 0, 'no default: ' + missingDefault.join(', '));
const staleExempt = Object.keys(EXEMPT).filter(i => !ids.includes(i));
check('exemption list has no stale entries', staleExempt.length === 0, staleExempt.join(', '));
process.exit(finish());
