#!/usr/bin/env node
/**
 * Pre-publish checks for a Salla component bundle.
 * Mirrors Salla's "Bundle Publish Requirements" plus common mistakes.
 *
 *   pnpm run validate
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

let bundle;
try {
  bundle = read('twilight-bundle.json');
} catch (e) {
  console.error('✖ twilight-bundle.json is missing or invalid JSON:', e.message);
  process.exit(1);
}

const comps = Array.isArray(bundle.components) ? bundle.components : [];

// 1. 1–15 components
if (comps.length < 1 || comps.length > 15) err(`Bundle must have 1–15 components (has ${comps.length}).`);

// 2. Names, keys, folders
const names = new Set();
const keys = new Set();
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const GLOBAL = /(^|-)(header|footer|navbar|nav-menu)(-|$)/;

for (const c of comps) {
  const where = `component "${c.name}"`;
  if (!c.name || !KEBAB.test(c.name)) err(`${where}: name must be kebab-case.`);
  if (GLOBAL.test(c.name || '')) err(`${where}: global components (header/footer) are not allowed in bundles.`);
  if (names.has(c.name)) err(`${where}: duplicate name.`);
  names.add(c.name);
  if (!c.key) err(`${where}: missing key.`);
  if (keys.has(c.key)) err(`${where}: duplicate key.`);
  keys.add(c.key);
  if (!c.title) err(`${where}: missing title.`);
  if (!c.icon) warn(`${where}: missing icon.`);
  if (!c.image) warn(`${where}: missing preview image.`);

  const entry = path.join(root, 'src/components', c.name, 'index.ts');
  if (!fs.existsSync(entry)) err(`${where}: src/components/${c.name}/index.ts not found.`);
  else {
    const src = fs.readFileSync(entry, 'utf8');
    // Salla's transform plugin registers the FIRST "class X" it finds in the file
    const first = src.match(/class\s+(\w+)/i);
    const def = src.match(/export\s+default\s+class\s+(\w+)/);
    if (!def) err(`${where}: index.ts must "export default class …".`);
    else if (!first || first[1] !== def[1])
      err(`${where}: the word "class ${first?.[1]}" appears before the default class — Salla would register the wrong name.`);
  }

  // field ids unique per level
  const checkFields = (fields, scope) => {
    const ids = new Set();
    for (const f of fields || []) {
      if (!f.id) err(`${scope}: a field has no id.`);
      if (ids.has(f.id)) err(`${scope}: duplicate field id "${f.id}".`);
      ids.add(f.id);
      if (!f.type || !f.format) err(`${scope}.${f.id}: missing type/format.`);
      if (f.type === 'items' && f.source === 'Manual' && !Array.isArray(f.options))
        err(`${scope}.${f.id}: manual items field needs options.`);
      if (f.type === 'collection') checkFields(f.fields, `${scope}.${f.id}`);
    }
  };
  checkFields(c.fields, where);
}

// 3. Folders without manifest entry
const compDir = path.join(root, 'src/components');
if (fs.existsSync(compDir)) {
  for (const d of fs.readdirSync(compDir)) {
    if (fs.statSync(path.join(compDir, d)).isDirectory() && !names.has(d))
      err(`src/components/${d} has no entry in twilight-bundle.json.`);
  }
}

// 4. Templates
for (const t of bundle.templates || []) {
  const rel = (t.path || '').replace(/^templates\./, 'templates/') + '.json';
  if (!fs.existsSync(path.join(root, rel))) {
    err(`template "${t.path}": file ${rel} not found.`);
    continue;
  }
  const data = read(rel);
  if (data.id !== t.id) err(`template "${t.path}": id does not match twilight-bundle.json.`);
  for (const c of data.components || []) {
    const def = comps.find((x) => x.name === c.name);
    if (!def) err(`template "${t.path}": uses unknown component "${c.name}".`);
    else if (def.key !== c.key) err(`template "${t.path}": key mismatch for "${c.name}".`);
  }
}
if ((bundle.templates || []).filter((t) => t.is_default).length > 1) err('Only one template can be the default.');

// 5. Build output (if built)
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  for (const n of names) if (!fs.existsSync(path.join(dist, `${n}.js`))) warn(`dist/${n}.js missing — run pnpm build.`);
}

for (const w of warnings) console.warn('⚠', w);
if (errors.length) {
  for (const e of errors) console.error('✖', e);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`✔ Bundle OK — ${comps.length} components, ${(bundle.templates || []).length} templates.`);
