import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");
const iconsDir = join(publicDir, "icons");

mkdirSync(iconsDir, { recursive: true });

// SVG: minimalist gold ingot on dark background
const svgTemplate = (size) => {
  const s = size;
  const pad = s * 0.12;
  const w = s - pad * 2;
  const h = s - pad * 2;

  // Ingot proportions (trapezoid)
  const ingotH = h * 0.42;
  const ingotW = w * 0.78;
  const ingotX = pad + (w - ingotW) / 2;
  const ingotY = pad + h * 0.10;

  // Top face of ingot (narrower)
  const topShrink = ingotW * 0.12;
  const topH = ingotH * 0.28;

  // Points for the 3D ingot
  // Front face (trapezoid)
  const fx1 = ingotX;
  const fy1 = ingotY + topH;
  const fx2 = ingotX + ingotW;
  const fy2 = ingotY + topH;
  const fx3 = ingotX + ingotW;
  const fy3 = ingotY + ingotH;
  const fx4 = ingotX;
  const fy4 = ingotY + ingotH;

  // Top face
  const tx1 = ingotX + topShrink;
  const ty1 = ingotY;
  const tx2 = ingotX + ingotW - topShrink;
  const ty2 = ingotY;

  // Text "DZM"
  const fontSize = s * 0.155;
  const textY = ingotY + ingotH + s * 0.175;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>
    <linearGradient id="frontGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8C96A"/>
      <stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#8A6820"/>
    </linearGradient>
    <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F0D878"/>
      <stop offset="100%" stop-color="#C9A84C"/>
    </linearGradient>
    <linearGradient id="sideGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#A07830"/>
      <stop offset="100%" stop-color="#6A4E18"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="${s * 0.025}" stdDeviation="${s * 0.03}" flood-color="#C9A84C" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${s * 0.18}" fill="url(#bgGrad)"/>

  <!-- Ingot group with shadow -->
  <g filter="url(#shadow)">
    <!-- Top face -->
    <polygon points="${tx1},${ty1} ${tx2},${ty2} ${fx2},${fy1} ${fx1},${fy1}" fill="url(#topGrad)"/>

    <!-- Right side face -->
    <polygon points="${tx2},${ty2} ${fx2},${fy1} ${fx3},${fy3} ${fx3},${fy3}" fill="url(#sideGrad)" opacity="0.9"/>

    <!-- Front face -->
    <rect x="${fx1}" y="${fy1}" width="${ingotW}" height="${ingotH - topH}" fill="url(#frontGrad)" rx="${s * 0.01}"/>

    <!-- Shine line on front -->
    <line x1="${fx1 + ingotW * 0.2}" y1="${fy1 + (ingotH - topH) * 0.25}"
          x2="${fx1 + ingotW * 0.2}" y2="${fy1 + (ingotH - topH) * 0.75}"
          stroke="rgba(255,255,255,0.18)" stroke-width="${s * 0.012}" stroke-linecap="round"/>

    <!-- Engraved line top of front -->
    <line x1="${fx1 + ingotW * 0.08}" y1="${fy1 + (ingotH - topH) * 0.22}"
          x2="${fx1 + ingotW * 0.92}" y2="${fy1 + (ingotH - topH) * 0.22}"
          stroke="rgba(0,0,0,0.25)" stroke-width="${s * 0.008}"/>
    <line x1="${fx1 + ingotW * 0.08}" y1="${fy1 + (ingotH - topH) * 0.78}"
          x2="${fx1 + ingotW * 0.92}" y2="${fy1 + (ingotH - topH) * 0.78}"
          stroke="rgba(0,0,0,0.25)" stroke-width="${s * 0.008}"/>
  </g>

  <!-- DZM text -->
  <text x="${s / 2}" y="${textY}"
        font-family="Georgia, serif"
        font-size="${fontSize}"
        font-weight="bold"
        letter-spacing="${s * 0.025}"
        fill="#C9A84C"
        text-anchor="middle">${"DZM"}</text>
</svg>`;
};

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  console.log("Generating icons...");

  for (const size of sizes) {
    const svg = svgTemplate(size);
    const svgBuffer = Buffer.from(svg);
    const outputPath = size <= 32
      ? join(publicDir, `favicon-${size}x${size}.png`)
      : join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer).png().toFile(outputPath);
    console.log(`✓ ${outputPath}`);
  }

  // Also save the main favicon.svg and a 32x32 favicon.ico equivalent
  writeFileSync(join(publicDir, "icon.svg"), svgTemplate(512));
  console.log("✓ icon.svg (512px master)");

  // Copy 32x32 as favicon.png
  const svg32 = Buffer.from(svgTemplate(32));
  await sharp(svg32).png().toFile(join(publicDir, "favicon.png"));
  console.log("✓ favicon.png");

  console.log("\n✅ All icons generated!");
}

generate().catch(console.error);
