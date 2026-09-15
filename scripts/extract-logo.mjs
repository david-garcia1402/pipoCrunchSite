import sharp from "sharp";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "scripts/logo-source.png");

const burgundy = { r: 92, g: 29, b: 24, alpha: 1 };
const outSize = 1200;

const meta = await sharp(sourcePath).metadata();
const srcW = meta.width;
const srcH = meta.height;
const cx0 = srcW / 2;
const cy0 = srcH / 2 - 1;
const rOuter = Math.min(cx0, srcH - cy0) - 0.5;
const padTop = Math.max(0, Math.ceil(rOuter - cy0 + 4));
const workW = srcW;
const workH = srcH + padTop;
const cx = cx0;
const cy = cy0 + padTop;
const side = Math.ceil(rOuter * 2) + 2;
const extractLeft = Math.round(cx - side / 2);
const extractTop = Math.round(cy - side / 2);

const padded = await sharp({
  create: { width: workW, height: workH, channels: 4, background: burgundy },
})
  .composite([{ input: sourcePath, left: 0, top: padTop }])
  .png()
  .toBuffer();

const square = await sharp(padded)
  .extract({
    left: Math.max(0, extractLeft),
    top: Math.max(0, extractTop),
    width: Math.min(side, workW - Math.max(0, extractLeft)),
    height: Math.min(side, workH - Math.max(0, extractTop)),
  })
  .resize(outSize, outSize, { kernel: "lanczos3" })
  .sharpen({ sigma: 0.5, m1: 0.55, m2: 2 })
  .png()
  .toBuffer();

const mid = outSize / 2;
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${outSize}" height="${outSize}">
  <circle cx="${mid}" cy="${mid}" r="${outSize / 2}" fill="white"/>
</svg>`);

const { data, info } = await sharp(square).ensureAlpha().raw().toBuffer({
  resolveWithObject: true,
});
const out = Buffer.from(data);
const ch = info.channels;
const midPx = outSize / 2;
const rClean = midPx * 0.86;
const rTopCap = midPx * 0.91;

for (let y = 0; y < outSize; y++) {
  for (let x = 0; x < outSize; x++) {
    const dx = x + 0.5 - midPx;
    const dy = y + 0.5 - midPx;
    const dist = Math.hypot(dx, dy);
    const i = (y * outSize + x) * ch;
    const topCap = dist > rTopCap;
    if (dist < rClean && !topCap) continue;
    if (!topCap) {
      const r = out[i];
      const g = out[i + 1];
      const b = out[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isGold = r > g + 10 && g > b && lum > 85 && r > 150;
      if (isGold) continue;
    }
    out[i] = burgundy.r;
    out[i + 1] = burgundy.g;
    out[i + 2] = burgundy.b;
    out[i + 3] = 255;
  }
}

const cleaned = await sharp(out, {
  raw: { width: outSize, height: outSize, channels: ch },
}).png().toBuffer();

const outPath = path.join(root, "public/logo.png");
await sharp(cleaned)
  .composite([{ input: mask, blend: "dest-in" }])
  .png({ compressionLevel: 6 })
  .toFile(outPath);

await sharp(outPath).resize(256, 256).png().toFile(path.join(root, "src/app/icon.png"));
copyFileSync(outPath, path.join(root, "out/logo.png"));

console.log("extracted", srcW, "x", srcH, "->", outSize, "padTop", padTop);
