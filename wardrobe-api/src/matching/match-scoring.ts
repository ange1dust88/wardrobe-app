import {
  Brightness,
  Color,
  Item,
  Pattern,
  Saturation,
  SeasonPalette,
  Temperature,
  Vibe,
  WardrobeRole,
} from '../items/dto/item.dto';

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

const WEIGHTS: ScoreBreakdown = {
  color: 3,
  role: 2,
  season: 2,
  palette: 2,
  vibe: 1,
  pattern: 1,
};

export function computeColorScore(
  anchor: Color,
  candidate: Color,
  strictTemperature = false,
): number {
  let score = 0;

  if (anchor.temperature === candidate.temperature) {
    score += 2;
  } else if (
    anchor.temperature === Temperature.Neutral ||
    candidate.temperature === Temperature.Neutral
  ) {
    score += 1;
  } else {
    score += strictTemperature ? -6 : -4;
  }

  const order: Brightness[] = [
    Brightness.Light,
    Brightness.Medium,
    Brightness.Dark,
  ];
  const dist = Math.abs(
    order.indexOf(anchor.brightness) - order.indexOf(candidate.brightness),
  );
  score += dist;

  const bothVivid =
    anchor.saturation === Saturation.Vivid &&
    candidate.saturation === Saturation.Vivid;
  const oneVivid =
    anchor.saturation === Saturation.Vivid ||
    candidate.saturation === Saturation.Vivid;
  if (bothVivid) {
    score -= 4;
  } else if (oneVivid) {
    score += 2;
  } else {
    score += 1;
  }

  if (candidate.isNeutral) {
    score += 1;
  }

  return score;
}

export function computeRoleScore(anchor: Item, candidate: Item): number {
  const a = anchor.wardrobeRole;
  const c = candidate.wardrobeRole;
  if (a === WardrobeRole.Pop && c === WardrobeRole.Pop) return -4;
  if (a === WardrobeRole.Pop || c === WardrobeRole.Pop) return 2;
  if (a === WardrobeRole.Core && c === WardrobeRole.Tonal) return 1;
  if (a === WardrobeRole.Tonal && c === WardrobeRole.Core) return 1;
  return 0;
}

export function computeSeasonScore(anchor: Item, candidate: Item): number {
  const overlap = candidate.seasonWear.filter((s) =>
    anchor.seasonWear.includes(s),
  ).length;
  return overlap === 0 ? -4 : overlap;
}

export function computePaletteScore(
  candidate: Item,
  userColorType?: SeasonPalette,
): number {
  if (!userColorType) return 0;
  const palette = candidate.seasonPaletteCompatibility;
  if (palette.includes(userColorType)) return 3;
  if (palette.includes(SeasonPalette.Universal)) return 1;
  return -3;
}

export function computeVibeScore(candidate: Item, desired: Vibe[]): number {
  if (desired.length === 0) return 0;
  const shared = candidate.vibe.filter((v) => desired.includes(v)).length;
  return shared === 0 ? -3 : shared * 2;
}

export function computePatternScore(anchor: Item, candidate: Item): number {
  const isLoud = (p: Pattern) =>
    p === Pattern.BoldPattern || p === Pattern.Graphic;
  const a = isLoud(anchor.pattern);
  const c = isLoud(candidate.pattern);
  if (a && c) return -3;
  if (a || c) return 2;
  return 1;
}

export function computeTotalScore(
  anchor: Item,
  candidate: Item,
  ctx: MatchContext,
): { total: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    color: computeColorScore(
      anchor.color,
      candidate.color,
      ctx.strictTemperature,
    ),
    role: computeRoleScore(anchor, candidate),
    season: computeSeasonScore(anchor, candidate),
    palette: computePaletteScore(candidate, ctx.userColorType),
    vibe: computeVibeScore(candidate, ctx.vibe),
    pattern: computePatternScore(anchor, candidate),
  };

  const total =
    WEIGHTS.color * breakdown.color +
    WEIGHTS.role * breakdown.role +
    WEIGHTS.season * breakdown.season +
    WEIGHTS.palette * breakdown.palette +
    WEIGHTS.vibe * breakdown.vibe +
    WEIGHTS.pattern * breakdown.pattern;

  return { total, breakdown };
}
