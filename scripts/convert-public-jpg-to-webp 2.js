// Convert all JPG/JPEG images under public/ to WebP (with JPG kept as fallback)
// Usage:
//   node scripts/convert-public-jpg-to-webp.js
//   node scripts/convert-public-jpg-to-webp.js --quality=82
//   node scripts/convert-public-jpg-to-webp.js --dry-run
//   node scripts/convert-public-jpg-to-webp.js --concurrency=4
//
// Requires: sharp (already in devDependencies)

const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

const argv = process.argv.slice(2);
const getArg = (name, fallback) => {
  const match = argv.find(a => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1];
  return argv.includes(`--${name}`) ? true : fallback;
};

const QUALITY = parseInt(getArg('quality', '82'), 10);
const DRY_RUN = !!getArg('dry-run', false);
const CONCURRENCY = parseInt(getArg('concurrency', String(Math.max(1, Math.min(os.cpus().length, 8)))), 10);
const OVERWRITE = !!getArg('overwrite', false); // overwrite existing .webp if true
const MIN_BYTES = parseInt(getArg('min-bytes', '0'), 10); // only convert files >= min-bytes

// Recursively list files
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function isJpgLike(file) {
  const ext = path.extname(file).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg';
}

async function convertOne(srcPath) {
  const rel = path.relative(ROOT, srcPath);
  const outPath = srcPath.replace(/\.(jpe?g)$/i, '.webp');

  // skip if exists and not overwriting
  if (!OVERWRITE && fs.existsSync(outPath)) {
    return { rel, skipped: true, reason: 'webp-exists' };
  }

  // size filter
  const stat = fs.statSync(srcPath);
  if (stat.size < MIN_BYTES) {
    return { rel, skipped: true, reason: `below-min-size(${stat.size})` };
  }

  if (DRY_RUN) {
    return { rel, dryRun: true, out: path.relative(ROOT, outPath) };
  }

  // ensure parent dir
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  try {
    await sharp(srcPath)
      .webp({ quality: QUALITY })
      .toFile(outPath);

    // Validate that output exists and smaller or at least produced
    const outStat = fs.statSync(outPath);
    return {
      rel,
      out: path.relative(ROOT, outPath),
      bytesIn: stat.size,
      bytesOut: outStat.size,
      saved: stat.size - outStat.size
    };
  } catch (err) {
    return { rel, error: err.message || String(err) };
  }
}

async function pool(items, concurrency, worker) {
  const results = [];
  let i = 0;
  let active = 0;

  return new Promise((resolve) => {
    const next = () => {
      if (i >= items.length && active === 0) {
        resolve(results);
        return;
      }
      while (active < concurrency && i < items.length) {
        const item = items[i++];
        active++;
        worker(item)
          .then((r) => results.push(r))
          .catch((e) => results.push({ error: e?.message || String(e) }))
          .finally(() => {
            active--;
            next();
          });
      }
    };
    next();
  });
}

(async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`[ERROR] public/ directory not found at ${PUBLIC_DIR}`);
    process.exit(1);
  }

  const allFiles = walk(PUBLIC_DIR);
  const targets = allFiles.filter(isJpgLike);

  console.log(`[convert-public-jpg-to-webp] Starting
- public dir: ${path.relative(ROOT, PUBLIC_DIR)}
- candidates: ${targets.length}
- quality: ${QUALITY}
- concurrency: ${CONCURRENCY}
- dryRun: ${DRY_RUN}
- overwrite: ${OVERWRITE}
- minBytes: ${MIN_BYTES}
`);

  if (targets.length === 0) {
    console.log('No JPG/JPEG files found under public/. Nothing to do.');
    return;
  }

  const started = Date.now();
  const results = await pool(targets, CONCURRENCY, convertOne);

  let converted = 0;
  let skipped = 0;
  let errored = 0;
  let savedBytes = 0;

  for (const r of results) {
    if (r?.error) {
      errored++;
      console.warn(`[ERROR] ${r.rel}: ${r.error}`);
      continue;
    }
    if (r?.skipped) {
      skipped++;
      // Uncomment for verbose
      // console.log(`[SKIP] ${r.rel}: ${r.reason}`);
      continue;
    }
    if (r?.dryRun) {
      console.log(`[DRY] ${r.rel} -> ${r.out}`);
      continue;
    }
    converted++;
    savedBytes += (r?.saved || 0);
    // Uncomment detailed logs
    // console.log(`[OK] ${r.rel} -> ${r.out} (saved ${r.saved} bytes)`);
  }

  const ms = Date.now() - started;
  console.log(`
[convert-public-jpg-to-webp] Done in ${ms}ms
- converted: ${converted}
- skipped:   ${skipped}
- errors:    ${errored}
- saved:     ${(savedBytes / 1024).toFixed(1)} KB
${DRY_RUN ? '(dry-run mode; no files written)' : ''}
`);

  // Guidance note
  console.log(`Note:
- JPG originals are retained as fallback.
- In Next/Image or your custom components, prefer the .webp URL when available for best LCP.
- This script does NOT rewrite references. If you have hard-coded ".jpg" paths, consider updating them to ".webp" or implement runtime preference logic.`);
})().catch((e) => {
  console.error('[FATAL]', e);
  process.exit(1);
});