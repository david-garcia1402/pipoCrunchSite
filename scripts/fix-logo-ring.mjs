import sharp from "sharp";
import { renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sourcePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "logo-source.png");

const burgundy = { r: 92, g: 29, b: 24, alpha: 1 };
const size = 1200;
const srcW = 488;
const srcH = 473;
const cx0 = 244.5;
const cy0 = 235.5;
const rOuter = 243.5;
const rInner = 219.5;

const { data: src, info: srcInfo } = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const sc = srcInfo.channels;

function srcPixel(x, y) {
  if (x < 0 || y < 0 || x >= srcW - 1 || y >= srcH - 1) return null;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const fx = x - x0;
  const fy = y - y0;
  const idx = (xx, yy) => (yy * srcW + xx) * sc;
  const mix = (a, b, t) => a + (b - a) * t;
  const i00 = idx(x0, y0);
  const i10 = idx(x1, y0);
  const i01 = idx(x0, y1);
  const i11 = idx(x1, y1);
  const out = [0, 0, 0, 255];
  for (let k = 0; k < 3; k++) {
    const top = mix(src[i00 + k], src[i10 + k], fx);
    const bot = mix(src[i01 + k], src[i11 + k], fx);
    out[k] = Math.round(mix(top, bot, fy));
  }
  return out;
}

function luminance(p) {
  return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
}

function isWarmRing(p) {
  return p[0] > p[2] + 12 && luminance(p) > 62;
}

function buildProfile(yStart, yEnd, step) {
  const profile = [];
  for (let y = yStart; step > 0 ? y <= yEnd : y >= yEnd; y += step) {
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let dx = -8; dx <= 8; dx++) {
      const p = srcPixel(cx0 + dx, y);
      if (p && isWarmRing(p)) {
        r += p[0];
        g += p[1];
        b += p[2];
        n += 1;
      }
    }
    if (n) profile.push([r / n, g / n, b / n, 255]);
  }
  return profile;
}

const topProfile = buildProfile(14, 0, -1);
const bottomProfile = buildProfile(457, 472, 1);

function fromProfile(profile, t) {
  if (!profile.length) return null;
  const u = Math.max(0, Math.min(1, t)) * (profile.length - 1);
  const i = Math.floor(u);
  const f = u - i;
  const a = profile[i];
  const b = profile[Math.min(profile.length - 1, i + 1)];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
    255,
  ];
}

function samplePolar(r, theta) {
  let left = null;
  let right = null;
  for (let d = 0.01; d <= 0.7; d += 0.01) {
    if (!left) left = srcPixel(cx0 + r * Math.cos(theta - d), cy0 + r * Math.sin(theta - d));
    if (!right) right = srcPixel(cx0 + r * Math.cos(theta + d), cy0 + r * Math.sin(theta + d));
    if (left && right) {
      return [
        Math.round((left[0] + right[0]) / 2),
        Math.round((left[1] + right[1]) / 2),
        Math.round((left[2] + right[2]) / 2),
        255,
      ];
    }
  }
  return left || right;
}

const scale = size / (rOuter * 2);
const work = 1260;
const workCx = work / 2;
const workCy = work / 2;
const left = Math.round(workCx - cx0 * scale);
const top = Math.round(workCy - cy0 * scale);
const upW = Math.round(srcW * scale);
const upH = Math.round(srcH * scale);

const upscaled = await sharp(sourcePath)
  .resize(upW, upH, { kernel: "lanczos3" })
  .sharpen({ sigma: 0.4 })
  .png()
  .toBuffer();

const composed = await sharp({
  create: { width: work, height: work, channels: 4, background: burgundy },
})
  .composite([{ input: upscaled, left, top }])
  .png()
  .toBuffer();

const crop = Math.round((work - size) / 2);
const base = await sharp(composed)
  .extract({ left: crop, top: crop, width: size, height: size })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const cx = size / 2;
const cy = size / 2;
const out = Buffer.from(base.data);
const ch = base.info.channels;

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const sx = (x - cx) / scale + cx0;
    const sy = (y - cy) / scale + cy0;
    const srcR = Math.hypot(sx - cx0, sy - cy0);
    const theta = Math.atan2(sy - cy0, sx - cx0);
    const i = (y * size + x) * ch;
    const inSource = sx >= 0 && sy >= 0 && sx < srcW && sy < srcH;
    const topSector = Math.abs(theta + Math.PI / 2) < 0.7;
    const botSector = Math.abs(theta - Math.PI / 2) < 0.55;
    const needsFill = !inSource || (topSector && sy < 5);

    if (!needsFill) continue;

    if (srcR > rOuter + 0.55) {
      out[i] = burgundy.r;
      out[i + 1] = burgundy.g;
      out[i + 2] = burgundy.b;
      out[i + 3] = 255;
      continue;
    }

    if (srcR < rInner) {
      out[i] = burgundy.r;
      out[i + 1] = burgundy.g;
      out[i + 2] = burgundy.b;
      out[i + 3] = 255;
      continue;
    }

    const t = (srcR - rInner) / (rOuter - rInner);
    let color = null;
    if (topSector) color = fromProfile(topProfile, t);
    else if (botSector) color = fromProfile(bottomProfile, t);
    if (!color || !isWarmRing(color)) color = samplePolar(srcR, theta);
    if (!color) continue;

    out[i] = color[0];
    out[i + 1] = color[1];
    out[i + 2] = color[2];
    out[i + 3] = 255;
  }
}

const rebuilt = await sharp(out, {
  raw: { width: size, height: size, channels: ch },
})
  .png()
  .toBuffer();

const gold = topProfile.at(-1) || [196, 140, 74];
const stroke = `rgb(${Math.round(gold[0])},${Math.round(gold[1])},${Math.round(gold[2])})`;
const rOut = rOuter * scale;
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <path d="M ${cx - rOut * 0.34} ${cy - rOut * Math.sqrt(1 - 0.34 ** 2)}
           A ${rOut} ${rOut} 0 0 1 ${cx + rOut * 0.34} ${cy - rOut * Math.sqrt(1 - 0.34 ** 2)}"
        fill="none" stroke="${stroke}" stroke-width="16" stroke-linecap="butt"/>
</svg>`);

const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${cx}" cy="${cy}" r="${size / 2}" fill="white"/>
</svg>`);

const tmp = "public/logo.next.png";
await sharp(rebuilt)
  .composite([
    { input: overlay, blend: "over" },
    { input: mask, blend: "dest-in" },
  ])
  .png({ compressionLevel: 6 })
  .toFile(tmp);

renameSync(tmp, "public/logo.png");
console.log("logo.png rebuilt");
