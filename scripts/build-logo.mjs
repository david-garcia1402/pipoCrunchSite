import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const burgundy = "#5C1D18";
const gold = "#E8A05C";
const size = 1000;

const fontBuf = readFileSync(path.join(root, "scripts/fonts/Cinzel-Semibold.ttf"));
const font = opentype.parse(
  fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength),
);

function textPath(text, fontSize, letterSpacing, cx, baseline) {
  const advances = [...text].map((ch) => font.getAdvanceWidth(ch, fontSize));
  const width =
    advances.reduce((s, w) => s + w, 0) + letterSpacing * (text.length - 1);
  let x = cx - width / 2;
  const commands = [];
  for (let i = 0; i < text.length; i += 1) {
    const glyphPath = font.getPath(text[i], x, baseline, fontSize);
    commands.push(glyphPath.toPathData(2).replace(/(\.\d{2})\d+/g, "$1"));
    x += advances[i] + letterSpacing;
  }
  return commands.join(" ");
}

const wordmark = textPath("PIPOCRUNCH", 60, 5, 500, 682);

const topY = 402;
const botY = 556;
const topL = 376;
const topR = 624;
const botL = 414;
const botR = 586;
const panels = 6;
const topXs = Array.from({ length: panels + 1 }, (_, i) =>
  topL + ((topR - topL) * i) / panels,
);
const botXs = Array.from({ length: panels + 1 }, (_, i) =>
  botL + ((botR - botL) * i) / panels,
);

const scallop = topXs
  .map((x, i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${topY}`;
    const prev = topXs[i - 1];
    const mid = (prev + x) / 2;
    return `Q ${mid.toFixed(1)} ${topY + 15} ${x.toFixed(1)} ${topY}`;
  })
  .join(" ");

const sides = `M ${topL} ${topY} L ${botL} ${botY} L ${botR} ${botY} L ${topR} ${topY}`;
const stripes = topXs
  .slice(1, -1)
  .map((x, i) => {
    const bx = botXs[i + 1];
    return `<path d="M ${x.toFixed(1)} ${topY + 8} L ${bx.toFixed(1)} ${botY}"/>`;
  })
  .join("\n    ");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="PIPOCRUNCH">
  <title>PIPOCRUNCH</title>
  <circle cx="500" cy="500" r="500" fill="${burgundy}"/>
  <circle cx="500" cy="500" r="458" fill="none" stroke="${gold}" stroke-width="8"/>
  <defs>
    <clipPath id="popcorn-clip">
      <rect x="300" y="210" width="400" height="200"/>
    </clipPath>
  </defs>
  <g fill="none" stroke="${gold}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <g clip-path="url(#popcorn-clip)">
      <circle cx="418" cy="370" r="36"/>
      <circle cx="582" cy="370" r="36"/>
      <circle cx="450" cy="330" r="38"/>
      <circle cx="550" cy="330" r="38"/>
      <circle cx="500" cy="298" r="42"/>
    </g>
    <path d="${sides}"/>
    <path d="${scallop}"/>
    ${stripes}
  </g>
  <path fill="${gold}" d="${wordmark}"/>
</svg>
`;

writeFileSync(path.join(root, "public/logo.svg"), svg);

const png = await sharp(Buffer.from(svg))
  .resize(1200, 1200)
  .png({ compressionLevel: 6 })
  .toBuffer();

await sharp(png).toFile(path.join(root, "public/logo.png"));
await sharp(png).resize(256, 256).png().toFile(path.join(root, "src/app/icon.png"));

const study = path.join(root, "scripts/_logo-study");
mkdirSync(study, { recursive: true });
await sharp({
  create: { width: 980, height: 980, channels: 4, background: { r: 246, g: 238, b: 227, alpha: 1 } },
})
  .composite([{ input: await sharp(png).resize(780, 780).png().toBuffer(), left: 100, top: 100 }])
  .png()
  .toFile(path.join(study, "vector-preview.png"));

await sharp(png)
  .extract({ left: 280, top: 200, width: 640, height: 520 })
  .resize(800)
  .png()
  .toFile(path.join(study, "icon-vector.png"));

console.log("logo.svg, logo.png and icon.png rebuilt");
