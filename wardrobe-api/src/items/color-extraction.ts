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

const ACCENT_MIN_DISTANCE = 60;
const ACCENT_MIN_RATIO = 0.18;

export type ColorPalette = { hex: string; accentHex: string | null };

async function fallbackDominant(buffer: Buffer): Promise<ColorPalette> {
  const { dominant } = await sharp(buffer).stats();
  return { hex: hex(dominant), accentHex: null };
}

function bucketMean(bucket: { count: number; sum: Rgb }): Rgb {
  return {
    r: bucket.sum.r / bucket.count,
    g: bucket.sum.g / bucket.count,
    b: bucket.sum.b / bucket.count,
  };
}

export async function extractPalette(buffer: Buffer): Promise<ColorPalette> {
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

  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
  if (sorted.length === 0) {
    return fallbackDominant(buffer);
  }

  const dominant = bucketMean(sorted[0]);
  let accentHex: string | null = null;
  for (const bucket of sorted.slice(1)) {
    if (bucket.count < sorted[0].count * ACCENT_MIN_RATIO) break;
    const mean = bucketMean(bucket);
    if (distance(mean, dominant) >= ACCENT_MIN_DISTANCE) {
      accentHex = hex(mean);
      break;
    }
  }

  return { hex: hex(dominant), accentHex };
}

export async function extractDominantHex(buffer: Buffer): Promise<string> {
  return (await extractPalette(buffer)).hex;
}
