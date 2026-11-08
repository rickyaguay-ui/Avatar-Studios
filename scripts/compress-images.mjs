// Compress demo images in place (PNG palette quantization, same file names and dimensions).
// Originals are copied to the folder given as the first argument (default: ./.image-originals, gitignored).
//   node scripts/compress-images.mjs [backupDir]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const backup = process.argv[2] || '.image-originals';
const roots = ['public/demo/portraits', 'public/demo/video'];
let before = 0, after = 0;
for (const root of roots) {
  for (const f of fs.readdirSync(root).filter((n) => n.endsWith('.png'))) {
    const p = path.join(root, f);
    const orig = fs.readFileSync(p);
    const dest = path.join(backup, root, f);
    if (!fs.existsSync(dest)) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, orig); }
    const out = await sharp(orig).png({ palette: true, quality: 82, effort: 10, colours: 256, dither: 0.8 }).toBuffer();
    if (out.length < orig.length) fs.writeFileSync(p, out);
    before += orig.length; after += Math.min(out.length, orig.length);
    console.log(`${p}: ${Math.round(orig.length / 1024)} KB -> ${Math.round(Math.min(out.length, orig.length) / 1024)} KB`);
  }
}
console.log(`Total ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
