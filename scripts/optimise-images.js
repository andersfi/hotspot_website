import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";

const DIR = new URL("../public/images/species/", import.meta.url).pathname;

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_WIDTH = 1600;
const JPG_QUALITY = 82;
const PNG_COMPRESSION = 8;

function humanSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const files = readdirSync(DIR).filter((f) => SUPPORTED.has(extname(f).toLowerCase()));

if (files.length === 0) {
  console.log("No images found in", DIR);
  process.exit(0);
}

for (const file of files) {
  const filepath = join(DIR, file);
  const ext = extname(file).toLowerCase();
  const before = statSync(filepath).size;

  try {
    const img = sharp(filepath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

    let buf;
    if (ext === ".png") {
      buf = await img.png({ compressionLevel: PNG_COMPRESSION }).toBuffer();
    } else {
      buf = await img.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toBuffer();
    }

    const after = buf.length;
    const pct = Math.round((1 - after / before) * 100);

    // Write back only if smaller
    if (after < before) {
      await sharp(buf).toFile(filepath);
      console.log(`✓ ${file}  ${humanSize(before)} → ${humanSize(after)}  (-${pct}%)`);
    } else {
      console.log(`– ${file}  ${humanSize(before)} (already optimal, skipped)`);
    }
  } catch (err) {
    console.error(`✗ ${file}  ${err.message}`);
  }
}
