import {
  Brightness,
  Color,
  Fit,
  Formality,
  Item,
  Pattern,
  Saturation,
  SeasonPalette,
  WardrobeRole,
} from '../items/dto/item.dto';
import { warmthGap } from './season-compat';

export type MatchContext = {
  userColorType?: SeasonPalette;
};

export type ScoreBreakdown = {
  color: number;
  role: number;
  season: number;
  palette: number;
  style: number;
  pattern: number;
  fit: number;
};

const MAX_SCORE = 36;
const MIN_RECOMMENDABLE_SCORE = 22;

const SCORE_CAPS: ScoreBreakdown = {
  color: 11,
  role: 5,
  season: 5,
  palette: 5,
  style: 5,
  pattern: 3,
  fit: 2,
};

const FORMALITY_ORDER: Formality[] = [
  Formality.Loungewear,
  Formality.Casual,
  Formality.SmartCasual,
  Formality.Formal,
];

const COLORTYPE_MATCH_BONUS = 5;
const COLORTYPE_UNIVERSAL_BONUS = 4;
const COLORTYPE_MISMATCH_PENALTY = -2;

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

function isPatterned(pattern: Pattern): boolean {
  return (
    pattern === Pattern.SubtlePattern ||
    pattern === Pattern.BoldPattern ||
    pattern === Pattern.Graphic
  );
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

export function computeColorScore(anchor: Color, candidate: Color): number {
  if (anchor.isNeutral || candidate.isNeutral) {
    const dist = brightnessDistance(anchor.brightness, candidate.brightness);

    if (anchor.isNeutral && candidate.isNeutral) {
      return dist === 0 ? 8 : dist === 1 ? 10 : 11;
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
  const isComplementary = distance >= 165;
  const isWheelHarmony = distance <= 35 || distance > 105;

  let score =
    distance <= 12
      ? 9
      : distance <= 35
        ? 10
        : distance <= 70
          ? 6
          : distance <= 105
            ? 4
            : distance < 165
              ? 8
              : 10;

  if (anchor.temperature === candidate.temperature) {
    score += 1;
  } else {
    score -= isWheelHarmony ? 1 : 3;
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
  if (a === WardrobeRole.Core && c === WardrobeRole.Tonal) return 5;
  if (a === WardrobeRole.Tonal && c === WardrobeRole.Core) return 5;
  if (a === WardrobeRole.Core && c === WardrobeRole.Core) return 5;
  if (a === WardrobeRole.Tonal && c === WardrobeRole.Tonal) return 5;
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
  if (gap >= 2) return -5;
  if (gap === 1) return -3;
  return 0;
}

function colorTypeFit(item: Item, userColorType: SeasonPalette): number {
  const palette = item.seasonPaletteCompatibility;
  if (palette.includes(userColorType)) return COLORTYPE_MATCH_BONUS;
  if (palette.includes(SeasonPalette.Universal)) {
    return COLORTYPE_UNIVERSAL_BONUS;
  }
  return COLORTYPE_MISMATCH_PENALTY;
}

export function computePaletteScore(
  anchor: Item,
  candidate: Item,
  userColorType?: SeasonPalette,
): number {
  const palette = candidate.seasonPaletteCompatibility;
  if (userColorType) {
    return (
      (colorTypeFit(anchor, userColorType) +
        colorTypeFit(candidate, userColorType)) /
      2
    );
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

export function computeStyleScore(anchor: Item, candidate: Item): number {
  if (!anchor.formality || !candidate.formality) return 0;

  const gap = Math.abs(
    FORMALITY_ORDER.indexOf(anchor.formality) -
      FORMALITY_ORDER.indexOf(candidate.formality),
  );
  const score = gap === 0 ? 5 : gap === 1 ? 3 : gap === 2 ? 0 : -4;

  return clamp(score, -5, SCORE_CAPS.style);
}

export function computePatternScore(anchor: Item, candidate: Item): number {
  if (isLoudPattern(anchor.pattern) && isLoudPattern(candidate.pattern)) {
    return -4;
  }
  if (isPatterned(anchor.pattern) && isPatterned(candidate.pattern)) {
    return 1;
  }
  return SCORE_CAPS.pattern;
}

export function computeFitScore(anchor: Item, candidate: Item): number {
  if (!anchor.fit || !candidate.fit) return SCORE_CAPS.fit;
  const bothExtremeSame =
    anchor.fit === candidate.fit &&
    (anchor.fit === Fit.Slim || anchor.fit === Fit.Oversized);
  if (bothExtremeSame) return 0;
  const oppositeExtremes =
    (anchor.fit === Fit.Slim && candidate.fit === Fit.Oversized) ||
    (anchor.fit === Fit.Oversized && candidate.fit === Fit.Slim);
  if (oppositeExtremes) return 1;
  return SCORE_CAPS.fit;
}

function accentTieIn(accent: Color | null, otherPrimary: Color): number {
  if (!accent) return 0;
  const s = computeColorScore(accent, otherPrimary);
  return s >= 9 ? 1 : s <= 4 ? -1 : 0;
}

function accentAdjust(anchor: Item, candidate: Item): number {
  const bonus =
    accentTieIn(anchor.accent, candidate.color) +
    accentTieIn(candidate.accent, anchor.color);
  return clamp(bonus, -2, 2);
}

export function computeTotalScore(
  anchor: Item,
  candidate: Item,
  ctx: MatchContext,
): {
  total: number;
  breakdown: ScoreBreakdown;
} {
  const breakdown: ScoreBreakdown = {
    color: clamp(
      computeColorScore(anchor.color, candidate.color) +
        accentAdjust(anchor, candidate),
      -6,
      SCORE_CAPS.color,
    ),
    role: computeRoleScore(anchor, candidate),
    season: computeSeasonScore(anchor, candidate),
    palette: computePaletteScore(anchor, candidate, ctx.userColorType),
    style: computeStyleScore(anchor, candidate),
    pattern: computePatternScore(anchor, candidate),
    fit: computeFitScore(anchor, candidate),
  };

  const rawTotal =
    breakdown.color +
    breakdown.role +
    breakdown.season +
    breakdown.palette +
    breakdown.style +
    breakdown.pattern +
    breakdown.fit;
  const total = clamp(Math.round(rawTotal), 0, MAX_SCORE);

  return { total, breakdown };
}

export function isRecommendableScore(score: number): boolean {
  return score >= MIN_RECOMMENDABLE_SCORE;
}
