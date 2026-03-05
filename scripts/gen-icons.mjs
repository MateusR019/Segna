/**
 * Generates PWA icons as valid PNG files using pure Node.js
 * No external dependencies — writes raw PNG bytes with zlib compression
 */
import { writeFileSync } from "fs";
import { deflateSync } from "zlib";

function crc32(buf) {
  let c = 0xffffffff;
  const table = [];
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    table[n] = v;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(pixels, size) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines with filter byte
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const pi = (y * size + x) * 3;
      const ri = y * (1 + size * 3) + 1 + x * 3;
      raw[ri] = pixels[pi];
      raw[ri + 1] = pixels[pi + 1];
      raw[ri + 2] = pixels[pi + 2];
    }
  }

  const idat = deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function makeIconPixels(size) {
  const pixels = new Uint8Array(size * size * 3);

  // Helper: is point inside rounded rect?
  const pad = size * 0.08;
  const r = size * 0.22;
  const x0 = pad, y0 = pad, x1 = size - pad, y1 = size - pad;

  function inRoundedRect(px, py) {
    if (px < x0 || px > x1 || py < y0 || py > y1) return false;
    // Check corners
    const corners = [
      [x0 + r, y0 + r], [x1 - r, y0 + r],
      [x1 - r, y1 - r], [x0 + r, y1 - r],
    ];
    for (const [cx, cy] of corners) {
      if (px < cx + r && px > cx - r && py < cy + r && py > cy - r) {
        const dx = px - cx, dy = py - cy;
        if (Math.sqrt(dx * dx + dy * dy) > r) return false;
      }
    }
    return true;
  }

  // Rasterize a bold "S" using Bezier approximation — we'll use a thick stroke approach
  // Instead, draw a simple S shape as filled polygons
  // Colors
  const BG = [15, 15, 15];
  const PURPLE = [99, 102, 241];
  const WHITE = [255, 255, 255];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3;
      const px = x + 0.5, py = y + 0.5;

      if (inRoundedRect(px, py)) {
        pixels[i] = PURPLE[0];
        pixels[i + 1] = PURPLE[1];
        pixels[i + 2] = PURPLE[2];
      } else {
        pixels[i] = BG[0];
        pixels[i + 1] = BG[1];
        pixels[i + 2] = BG[2];
      }
    }
  }

  // Draw "S" as white pixels using a scaled template
  // S shape: defined in a 10x14 grid, scaled to fit
  const template = [
    "0111110",
    "1100001",
    "1100000",
    "1100000",
    "0111100",
    "0000110",
    "0000011",
    "0000011",
    "1100011",
    "0111110",
  ];
  const tw = 7, th = 10;
  const scale = size * 0.52 / tw;
  const ox = (size - tw * scale) / 2;
  const oy = (size - th * scale) / 2 + size * 0.02;

  for (let ty = 0; ty < th; ty++) {
    for (let tx = 0; tx < tw; tx++) {
      if (template[ty][tx] === "1") {
        // Fill scaled block
        const px0 = Math.floor(ox + tx * scale);
        const py0 = Math.floor(oy + ty * scale);
        const px1 = Math.ceil(ox + (tx + 1) * scale);
        const py1 = Math.ceil(oy + (ty + 1) * scale);
        for (let py = py0; py < py1 && py < size; py++) {
          for (let px = px0; px < px1 && px < size; px++) {
            if (px >= 0 && py >= 0) {
              const i = (py * size + px) * 3;
              pixels[i] = WHITE[0];
              pixels[i + 1] = WHITE[1];
              pixels[i + 2] = WHITE[2];
            }
          }
        }
      }
    }
  }

  return pixels;
}

function generate(size, path) {
  const pixels = makeIconPixels(size);
  const png = makePng(pixels, size);
  writeFileSync(path, png);
  console.log(`✓ ${path} (${size}x${size})`);
}

generate(192, "public/icon-192.png");
generate(512, "public/icon-512.png");
generate(180, "public/apple-touch-icon.png");
