import {
  Brightness,
  Category,
  Color,
  Formality,
  Saturation,
  SeasonPalette,
  Temperature,
  WardrobeRole,
} from './dto/item.dto';
import { classifySeasons } from './season-palette';

const SUBTYPE_FORMALITY: Record<string, Formality> = {
  't-shirt': Formality.Casual,
  tank: Formality.Casual,
  hoodie: Formality.Loungewear,
  longsleeve: Formality.Casual,
  sweater: Formality.Casual,
  shirt: Formality.SmartCasual,
  polo: Formality.SmartCasual,
  jacket: Formality.Casual,
  vest: Formality.Casual,
  cardigan: Formality.Casual,
  blazer: Formality.SmartCasual,
  coat: Formality.SmartCasual,
  shorts: Formality.Casual,
  leggings: Formality.Loungewear,
  sweatpants: Formality.Loungewear,
  jeans: Formality.Casual,
  trousers: Formality.SmartCasual,
  skirt: Formality.SmartCasual,
  sneakers: Formality.Casual,
  sandals: Formality.Casual,
  boots: Formality.SmartCasual,
  loafers: Formality.SmartCasual,
  flats: Formality.SmartCasual,
  heels: Formality.Formal,
  mini: Formality.Casual,
  midi: Formality.SmartCasual,
  maxi: Formality.SmartCasual,
  gown: Formality.Formal,
  slip: Formality.Casual,
  cap: Formality.Casual,
  beanie: Formality.Casual,
  beret: Formality.SmartCasual,
  hat: Formality.SmartCasual,
  headband: Formality.Casual,
};

const CATEGORY_FORMALITY: Record<Category, Formality> = {
  [Category.Headwear]: Formality.Casual,
  [Category.Top]: Formality.Casual,
  [Category.Outerwear]: Formality.Casual,
  [Category.Dress]: Formality.SmartCasual,
  [Category.Bottom]: Formality.Casual,
  [Category.Shoes]: Formality.Casual,
  [Category.Accessory]: Formality.Casual,
};

export function deriveFormality(
  category: Category,
  subType: string | null,
): Formality {
  if (subType && SUBTYPE_FORMALITY[subType]) return SUBTYPE_FORMALITY[subType];
  return CATEGORY_FORMALITY[category] ?? Formality.Casual;
}

type Hsl = { h: number; s: number; l: number };

export type DerivedItemData = {
  color: Color;
  wardrobeRole: WardrobeRole;
  seasonPaletteCompatibility: SeasonPalette[];
};

function hexToHsl(hex: string): Hsl {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) {
      h = (g - b) / delta + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
  }

  return { h, s, l };
}

export function deriveColor(hex: string): Color {
  const { h, s, l } = hexToHsl(hex);
  const hue = Math.round(h);
  const isNeutral = s < 0.15;

  let temperature: Temperature;
  if (isNeutral) {
    temperature = Temperature.Neutral;
  } else if (hue < 70 || hue >= 300) {
    temperature = Temperature.Warm;
  } else if (hue >= 150) {
    temperature = Temperature.Cool;
  } else {
    temperature = hue < 110 ? Temperature.Warm : Temperature.Cool;
  }

  const brightness =
    l < 0.35
      ? Brightness.Dark
      : l < 0.65
        ? Brightness.Medium
        : Brightness.Light;

  const saturation =
    s < 0.2 ? Saturation.Muted : s < 0.55 ? Saturation.Soft : Saturation.Vivid;

  return { hex, hue, temperature, brightness, saturation, isNeutral };
}

function derivePalette(color: Color): SeasonPalette[] {
  if (color.isNeutral) {
    return [SeasonPalette.Universal];
  }
  return classifySeasons(color.hex);
}

function deriveRole(color: Color): WardrobeRole {
  if (color.isNeutral) {
    return WardrobeRole.Core;
  }
  return color.saturation === Saturation.Vivid
    ? WardrobeRole.Pop
    : WardrobeRole.Tonal;
}

export function deriveItemData(hex: string): DerivedItemData {
  const color = deriveColor(hex);
  return {
    color,
    wardrobeRole: deriveRole(color),
    seasonPaletteCompatibility: derivePalette(color),
  };
}
