import {
  Brightness,
  Color,
  Saturation,
  SeasonPalette,
  Temperature,
  WardrobeRole,
} from './dto/item.dto';

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

function deriveColor(hex: string): Color {
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
    l < 0.35 ? Brightness.Dark : l < 0.65 ? Brightness.Medium : Brightness.Light;

  const saturation =
    s < 0.2 ? Saturation.Muted : s < 0.55 ? Saturation.Soft : Saturation.Vivid;

  return { hex, hue, temperature, brightness, saturation, isNeutral };
}

function derivePalette(color: Color): SeasonPalette[] {
  if (color.isNeutral) {
    return [SeasonPalette.Universal];
  }
  const isLight = color.brightness === Brightness.Light;
  if (color.temperature === Temperature.Warm) {
    return [isLight ? SeasonPalette.Spring : SeasonPalette.Autumn];
  }
  return [isLight ? SeasonPalette.Summer : SeasonPalette.Winter];
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
