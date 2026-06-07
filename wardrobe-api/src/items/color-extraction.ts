import sharp from 'sharp';

type Rgb = { r: number; g: number; b: number };

const SAMPLE_SIZE = 64;
const BG_DISTANCE = 50;
const MIN_FOREGROUND_RATIO = 0.05;

function toHex(channel: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(channel)));
  return clamped.toString(16).padStart(2, '0');
}

function hex({ r, g, b }: Rgb): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function distance(a: Rgb, b: Rgb): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

async function fallbackDominant(buffer: Buffer): Promise<string> {
  const { dominant } = await sharp(buffer).stats();
  return hex(dominant);
}

export async function extractDominantHex(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer)
    .resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: 'inside' })
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const at = (x: number, y: number): Rgb => {
    const i = (y * width + x) * channels;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  };

  const corners = [
    at(0, 0),
    at(width - 1, 0),
    at(0, height - 1),
    at(width - 1, height - 1),
  ];
  const background: Rgb = {
    r: corners.reduce((s, c) => s + c.r, 0) / corners.length,
    g: corners.reduce((s, c) => s + c.g, 0) / corners.length,
    b: corners.reduce((s, c) => s + c.b, 0) / corners.length,
  };

  const buckets = new Map<string, { count: number; sum: Rgb }>();
  let kept = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = at(x, y);
      if (distance(px, background) < BG_DISTANCE) continue;
      kept++;
      const key = `${px.r >> 4}-${px.g >> 4}-${px.b >> 4}`;
      const bucket = buckets.get(key) ?? {
        count: 0,
        sum: { r: 0, g: 0, b: 0 },
      };
      bucket.count++;
      bucket.sum.r += px.r;
      bucket.sum.g += px.g;
      bucket.sum.b += px.b;
      buckets.set(key, bucket);
    }
  }

  if (kept < width * height * MIN_FOREGROUND_RATIO) {
    return fallbackDominant(buffer);
  }

  let best: { count: number; sum: Rgb } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.count > best.count) best = bucket;
  }
  if (!best) {
    return fallbackDominant(buffer);
  }

  return hex({
    r: best.sum.r / best.count,
    g: best.sum.g / best.count,
    b: best.sum.b / best.count,
  });
}
