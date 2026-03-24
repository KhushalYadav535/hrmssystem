/**
 * One-off codemod: replace simple new Date(x).toLocaleDateString(...) / toLocaleString()
 * with formatDateDDMMYYYY / formatDateTimeDDMMYYYY / formatDateTimeFullDDMMYYYY.
 * Run from repo: node frontend/scripts/normalize-display-dates.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, '..');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, acc);
      else if (p.endsWith('.tsx') || (p.endsWith('.ts') && !p.endsWith('.d.ts'))) acc.push(p);
    } catch {
      /* skip */
    }
  }
  return acc;
}

/** Match new Date( ... ) with balanced parens from first '(' after "new Date" */
function matchNewDateCall(src, startIdx) {
  if (!src.startsWith('new Date(', startIdx)) return null;
  let i = startIdx + 'new Date('.length;
  let depth = 1;
  const begin = i;
  while (i < src.length && depth > 0) {
    const c = src[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    i++;
  }
  if (depth !== 0) return null;
  const inner = src.slice(begin, i - 1);
  return { end: i, inner };
}

function transform(content, relPath) {
  if (relPath.includes('date-format.ts') || relPath.includes('normalize-display-dates')) return content;

  let out = content;
  let changed = false;

  // Skip files that only use toLocaleString for currency (heuristic: no "new Date(")
  if (!out.includes('new Date(')) return { out, changed: false };

  // Replace from end to start to keep indices valid — use iterative scan
  const replacements = [];

  for (let i = 0; i < out.length; i++) {
    const m = matchNewDateCall(out, i);
    if (!m) continue;
    const { end, inner } = m;
    const rest = out.slice(end);

    // new Date(x).toLocaleDateString('en-IN', { ... }) — multiline
    const multiIn = rest.match(/^\s*\.toLocaleDateString\s*\(\s*['"]en-IN['"]\s*,\s*\{/);
    if (multiIn) {
      let j = end + multiIn[0].length;
      let depth = 1;
      while (j < out.length && depth > 0) {
        if (out[j] === '{') depth++;
        else if (out[j] === '}') depth--;
        j++;
      }
      const close = out.slice(j).match(/^\s*\)\s*/);
      if (close) {
        replacements.push({ start: i, end: j + close[0].length, text: `formatDateDDMMYYYY(${inner})` });
        continue;
      }
    }

    const multiGb = rest.match(/^\s*\.toLocaleDateString\s*\(\s*['"]en-GB['"]\s*,\s*\{/);
    if (multiGb) {
      let j = end + multiGb[0].length;
      let depth = 1;
      while (j < out.length && depth > 0) {
        if (out[j] === '{') depth++;
        else if (out[j] === '}') depth--;
        j++;
      }
      const close = out.slice(j).match(/^\s*\)\s*/);
      if (close) {
        replacements.push({ start: i, end: j + close[0].length, text: `formatDateDDMMYYYY(${inner})` });
        continue;
      }
    }

    // new Date(x).toLocaleDateString('en-IN') or ('en-GB') or ()
    const simpleDate = rest.match(
      /^\s*\.toLocaleDateString\s*\(\s*(?:['"]en-IN['"]|['"]en-GB['"])?\s*\)/
    );
    if (simpleDate) {
      replacements.push({
        start: i,
        end: end + simpleDate[0].length,
        text: `formatDateDDMMYYYY(${inner})`,
      });
      continue;
    }

    // new Date(x).toLocaleString() or ('en-IN', {...}) — treat as datetime
    const simpleStr = rest.match(/^\s*\.toLocaleString\s*\(\s*\)/);
    if (simpleStr) {
      replacements.push({
        start: i,
        end: end + simpleStr[0].length,
        text: `formatDateTimeFullDDMMYYYY(${inner})`,
      });
      continue;
    }

    const strIn = rest.match(/^\s*\.toLocaleString\s*\(\s*['"]en-IN['"]\s*,\s*\{/);
    if (strIn) {
      let j = end + strIn[0].length;
      let depth = 1;
      while (j < out.length && depth > 0) {
        if (out[j] === '{') depth++;
        else if (out[j] === '}') depth--;
        j++;
      }
      const close = out.slice(j).match(/^\s*\)\s*/);
      if (close) {
        replacements.push({
          start: i,
          end: j + close[0].length,
          text: `formatDateTimeFullDDMMYYYY(${inner})`,
        });
      }
    }
  }

  if (replacements.length === 0) return { out, changed: false };

  replacements.sort((a, b) => b.start - a.start);
  let merged = out;
  for (const r of replacements) {
    merged = merged.slice(0, r.start) + r.text + merged.slice(r.end);
  }
  out = merged;
  changed = true;

  const needsDate = /formatDateDDMMYYYY/.test(out);
  const needsTimeFull = /formatDateTimeFullDDMMYYYY/.test(out);
  const needsTime = /formatDateTimeDDMMYYYY/.test(out);

  if (needsDate || needsTimeFull || needsTime) {
    const importLine = `import { formatDateDDMMYYYY${needsTime ? ', formatDateTimeDDMMYYYY' : ''}${needsTimeFull ? ', formatDateTimeFullDDMMYYYY' : ''} } from '@/lib/date-format';`;
    if (!out.includes("@/lib/date-format")) {
      const m = out.match(/^('use client';\s*\n)/);
      if (m) {
        out = out.slice(0, m[0].length) + importLine + '\n' + out.slice(m[0].length);
      } else {
        out = importLine + '\n' + out;
      }
      changed = true;
    } else {
      // Merge into existing import
      out = out.replace(
        /import\s*\{([^}]*)\}\s*from\s*['"]@\/lib\/date-format['"];?/,
        (full, inner) => {
          const parts = inner.split(',').map((s) => s.trim()).filter(Boolean);
          const set = new Set(parts);
          set.add('formatDateDDMMYYYY');
          if (needsTime) set.add('formatDateTimeDDMMYYYY');
          if (needsTimeFull) set.add('formatDateTimeFullDDMMYYYY');
          return `import { ${[...set].join(', ')} } from '@/lib/date-format';`;
        }
      );
    }
  }

  return { out, changed };
}

const files = walk(FRONTEND);
let n = 0;
for (const file of files) {
  const rel = file.replace(FRONTEND + '\\', '').replace(FRONTEND + '/', '');
  const raw = readFileSync(file, 'utf8');
  const { out, changed } = transform(raw, rel);
  if (changed && out !== raw) {
    writeFileSync(file, out, 'utf8');
    console.log('updated', rel);
    n++;
  }
}
console.log('done, files updated:', n);
