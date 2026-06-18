import {
  Brightness,
  Color,
  Item,
  Pattern,
  Saturation,
  SeasonPalette,
  Vibe,
  WardrobeRole,
} from '../items/dto/item.dto';
import { warmthGap } from './season-compat';

export type MatchContext = {
  userColorType?: SeasonPalette;
  vibe: Vibe[];
  strictTemperature?: boolean;
};

export type ScoreBreakdown = {
  color: number;
  role: number;
  season: number;
  palette: number;
  vibe: number;
  pattern: number;
};

const MAX_SCORE = 36;
const MIN_RECOMMENDABLE_SCORE = 6;

const SCORE_CAPS: ScoreBreakdown = {
  color: 12,
  role: 6,
  season: 5,
  palette: 5,
  vibe: 5,
  pattern: 3,
};

const COLORTYPE_MATCH_BONUS = 8;
const COLORTYPE_UNIVERSAL_BONUS = 3;
const COLORTYPE_MISMATCH_PENALTY = -12;

const BRIGHTNESS_ORDER: Brightness[] = [
  Brightness.Light,
  Brightness.Medium,
  Brightness.Dark,
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

function brightnessDistance(a: Brightness, b: Brightness): number {
  return Math.abs(BRIGHTNESS_ORDER.indexOf(a) - BRIGHTNESS_ORDER.indexOf(b));
}

function isLoudPattern(pattern: Pattern): boolean {
  return pattern === Pattern.BoldPattern || pattern === Pattern.Graphic;
}

function isSubtlePattern(pattern: Pattern): boolean {
  return pattern === Pattern.SubtlePattern || pattern === Pattern.TextureOnly;
}

function hasPaletteOverlap(anchor: Item, candidate: Item): boolean {
  return candidate.seasonPaletteCompatibility.some((palette) =>
    anchor.seasonPaletteCompatibility.includes(palette),
  );
}

function hasSamePaletteTemperature(anchor: Item, candidate: Item): boolean {
  const warmPalettes = [SeasonPalette.Spring, SeasonPalette.Autumn];
  const coolPalettes = [SeasonPalette.Summer, SeasonPalette.Winter];
  const inSameGroup = (group: SeasonPalette[]) =>
    anchor.seasonPaletteCompatibility.some((palette) =>
      group.includes(palette),
    ) &&
    candidate.seasonPaletteCompatibility.some((palette) =>
      group.includes(palette),
    );

  return inSameGroup(warmPalettes) || inSameGroup(coolPalettes);
}

export function computeColorScore(
  anchor: Color,
  candidate: Color,
  strictTemperature = false,
): number {
  if (anchor.isNeutral || candidate.isNeutral) {
    const dist = brightnessDistance(anchor.brightness, candidate.brightness);

    if (anchor.isNeutral && candidate.isNeutral) {
      return dist === 0 ? 10 : dist === 1 ? 9 : 8;
    }

    const colored = anchor.isNeutral ? candidate : anchor;
    let score = 8;
    if (colored.saturation === Saturation.Vivid) {
      score += 2;
    } else if (colored.saturation === Saturation.Soft) {
      score += 1;
    }
    if (dist === 2) {
      score += 1;
    } else if (dist === 0) {
      score -= 1;
    }

    return clamp(score, 5, 11);
  }

  const distance = hueDistance(anchor.hue, candidate.hue);
  const isAnalogous = distance <= 35;
  const isComplementary = distance >= 165;
  const isTriadic = distance >= 105 && distance <= 135;
  const isSplitComplementary = distance >= 145 && distance < 165;
  const isWheelHarmony =
    isAnalogous || isComplementary || isTriadic || isSplitComplementary;

  let score =
    distance <= 12
      ? 9
      : isAnalogous
        ? 10
        : isComplementary
          ? 10
          : isTriadic
            ? 8
            : isSplitComplementary
              ? 7
              : distance <= 70
                ? 6
                : distance <= 100
                  ? 4
                  : 5;

  if (anchor.temperature === candidate.temperature) {
    score += 1;
  } else {
    score -= strictTemperature ? 4 : isWheelHarmony ? 1 : 3;
  }

  const brightnessDist = brightnessDistance(
    anchor.brightness,
    candidate.brightness,
  );
  if (brightnessDist === 0) {
    score += 1;
  } else if (brightnessDist === 2 && !isComplementary) {
    score -= 1;
  }

  const bothVivid =
    anchor.saturation === Saturation.Vivid &&
    candidate.saturation === Saturation.Vivid;
  const oneVivid =
    anchor.saturation === Saturation.Vivid ||
    candidate.saturation === Saturation.Vivid;
  if (bothVivid) {
    score -= 3;
  } else if (oneVivid) {
    score += 1;
  } else {
    score += 1;
  }

  if (distance <= 12 && brightnessDist > 0) {
    score += 1;
  }

  return clamp(score, -6, SCORE_CAPS.color);
}

export function computeRoleScore(anchor: Item, candidate: Item): number {
  const a = anchor.wardrobeRole;
  const c = candidate.wardrobeRole;
  if (a === WardrobeRole.Pop && c === WardrobeRole.Pop) return -5;
  if (a === WardrobeRole.Core && c === WardrobeRole.Tonal) return 6;
  if (a === WardrobeRole.Tonal && c === WardrobeRole.Core) return 6;
  if (a === WardrobeRole.Core && c === WardrobeRole.Core) return 5;
  if (a === WardrobeRole.Tonal && c === WardrobeRole.Tonal) return 4;
  if (a === WardrobeRole.Pop || c === WardrobeRole.Pop) return 3;
  return 2;
}

export function computeSeasonScore(anchor: Item, candidate: Item): number {
  const overlap = candidate.seasonWear.filter((s) =>
    anchor.seasonWear.includes(s),
  ).length;
  if (overlap >= 3) return SCORE_CAPS.season;
  if (overlap === 2) return 4;
  if (overlap === 1) return 2;

  const gap = warmthGap(anchor.seasonWear, candidate.seasonWear);
  if (gap >= 2) return -12;
  if (gap === 1) return -4;
  return 0;
}

export function computePaletteScore(
  anchor: Item,
  candidate: Item,
  userColorType?: SeasonPalette,
): number {
  const palette = candidate.seasonPaletteCompatibility;
  if (userColorType) {
    if (palette.includes(userColorType)) return COLORTYPE_MATCH_BONUS;
    if (palette.includes(SeasonPalette.Universal)) {
      return COLORTYPE_UNIVERSAL_BONUS;
    }
    return COLORTYPE_MISMATCH_PENALTY;
  }

  if (hasPaletteOverlap(anchor, candidate)) return 4;
  if (
    anchor.seasonPaletteCompatibility.includes(SeasonPalette.Universal) ||
    palette.includes(SeasonPalette.Universal)
  ) {
    return 2;
  }
  if (hasSamePaletteTemperature(anchor, candidate)) return 1;
  return -2;
}

const VIBE_INCOMPATIBLE: [Vibe, Vibe][] = [
  [Vibe.Sporty, Vibe.Workwear],
  [Vibe.Sporty, Vibe.Romantic],
  [Vibe.Sporty, Vibe.Classic],
  [Vibe.Minimalist, Vibe.Romantic],
  [Vibe.Minimalist, Vibe.Vintage],
  [Vibe.Urban, Vibe.Romantic],
  [Vibe.Urban, Vibe.Classic],
  [Vibe.Workwear, Vibe.Romantic],
  [Vibe.Edgy, Vibe.Relaxed],
];

const VIBE_INCOMPATIBLE_SET = new Set(
  VIBE_INCOMPATIBLE.map(([a, b]) => [a, b].sort().join('|')),
);

function vibePairCompatible(a: Vibe, b: Vibe): boolean {
  if (a === b) return true;
  return !VIBE_INCOMPATIBLE_SET.has([a, b].sort().join('|'));
}

export function computeVibeScore(candidate: Item, desired: Vibe[]): number {
  if (desired.length === 0 || candidate.vibe.length === 0) return 0;

  let compatible = 0;
  let total = 0;
  for (const a of desired) {
    for (const c of candidate.vibe) {
      total += 1;
      if (vibePairCompatible(a, c)) compatible += 1;
    }
  }

  const ratio = compatible / total;
  if (ratio === 1) return SCORE_CAPS.vibe;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 2;
  if (ratio > 0) return 0;
  return -4;
}

export function computePatternScore(anchor: Item, candidate: Item): number {
  const a = isLoudPattern(anchor.pattern);
  const c = isLoudPattern(candidate.pattern);
  if (a && c) return -4;
  if (a || c) return SCORE_CAPS.pattern;
  if (isSubtlePattern(anchor.pattern) || isSubtlePattern(candidate.pattern)) {
    return 3;
  }
  return 2;
}

export function computeTotalScore(
  anchor: Item,
  candidate: Item,
  ctx: MatchContext,
): {
  total: number;
  rawTotal: number;
  breakdown: ScoreBreakdown;
} {
  const breakdown: ScoreBreakdown = {
    color: computeColorScore(
      anchor.color,
      candidate.color,
      ctx.strictTemperature,
    ),
    role: computeRoleScore(anchor, candidate),
    season: computeSeasonScore(anchor, candidate),
    palette: computePaletteScore(anchor, candidate, ctx.userColorType),
    vibe: computeVibeScore(candidate, ctx.vibe),
    pattern: computePatternScore(anchor, candidate),
  };

  const rawTotal =
    breakdown.color +
    breakdown.role +
    breakdown.season +
    breakdown.palette +
    breakdown.vibe +
    breakdown.pattern;
  const total = clamp(Math.round(rawTotal), 0, MAX_SCORE);

  return { total, rawTotal, breakdown };
}

export function isRecommendableScore(score: number): boolean {
  return score >= MIN_RECOMMENDABLE_SCORE;
}
