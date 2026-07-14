import { Injectable } from '@nestjs/common';
import { Category, Item, SeasonPalette } from '../items/dto/item.dto';
import {
  deriveColor,
  deriveFormality,
  deriveItemData,
} from '../items/item-derivation';
import { ItemsService } from '../items/items.service';
import {
  MatchCell,
  MatchMap,
  MatchMapCacheService,
} from './match-map-cache.service';
import { categoriesConflict, categoryStacks } from './category-compat';
import { seasonsConflict } from './season-compat';
import { computeTotalScore } from './match-scoring';
import { PreviewItemDto } from './dto/preview-item.dto';

const MIN_RECOMMENDABLE_SCORE = 22;

const CATEGORY_ORDER: Category[] = [
  Category.Headwear,
  Category.Top,
  Category.Outerwear,
  Category.Dress,
  Category.Bottom,
  Category.Shoes,
  Category.Accessory,
];

export interface MatchPreviewPair {
  id: string;
  name: string;
  category: Category;
  hex: string;
  imageUrl: string | null;
  score: number;
}

export interface MatchPreviewSlot {
  category: Category;
  owned: number;
  matches: number;
  compatible: boolean;
}

export interface MatchPreview {
  wardrobeSize: number;
  matchCount: number;
  avgScore: number | null;
  topScore: number | null;
  results: MatchPreviewPair[];
  skipped: number;
  byCategory: MatchPreviewSlot[];
}

@Injectable()
export class MatchingService {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly matchMapCache: MatchMapCacheService,
  ) {}

  private pairAllowed(
    anchor: Item,
    candidate: Item,
    allowConflicts: boolean,
  ): boolean {
    if (allowConflicts) return true;
    if (candidate.category === anchor.category) {
      return (
        categoryStacks(anchor.category) &&
        !seasonsConflict(anchor.seasonWear, candidate.seasonWear)
      );
    }
    return (
      !categoriesConflict(anchor.category, candidate.category) &&
      !seasonsConflict(anchor.seasonWear, candidate.seasonWear)
    );
  }

  async getMatchMap(
    userId: string,
    userColorType?: SeasonPalette,
    allowConflicts = false,
  ): Promise<MatchMap> {
    const cached = this.matchMapCache.get(
      userId,
      userColorType,
      allowConflicts,
    );
    if (cached) {
      return cached;
    }

    const items = await this.itemsService.findAll(userId);
    const map: MatchMap = {};
    for (const anchor of items) {
      const ctx = { userColorType };
      const scores: Record<string, MatchCell> = {};
      for (const candidate of items) {
        if (candidate.id === anchor.id) {
          continue;
        }
        if (!this.pairAllowed(anchor, candidate, allowConflicts)) {
          continue;
        }
        const { total, breakdown } = computeTotalScore(anchor, candidate, ctx);
        scores[candidate.id] = { score: total, breakdown };
      }
      map[anchor.id] = scores;
    }
    this.matchMapCache.set(userId, map, userColorType, allowConflicts);
    return map;
  }

  async previewMatches(
    userId: string,
    dto: PreviewItemDto,
    userColorType?: SeasonPalette,
    allowConflicts = false,
  ): Promise<MatchPreview> {
    const derived = deriveItemData(dto.hex);
    const virtual: Item = {
      id: '__preview__',
      createdAt: new Date().toISOString(),
      name: 'preview',
      category: dto.category,
      subType: dto.subType ?? null,
      color: derived.color,
      accent: dto.accentHex ? deriveColor(dto.accentHex) : null,
      wardrobeRole: derived.wardrobeRole,
      imageUrl: null,
      pattern: dto.pattern,
      formality:
        dto.formality ?? deriveFormality(dto.category, dto.subType ?? null),
      fit: dto.fit ?? null,
      seasonPaletteCompatibility: derived.seasonPaletteCompatibility,
      seasonWear: dto.seasonWear,
    };

    const all = await this.itemsService.findAll(userId);
    const items = all.filter((item) => item.id !== dto.excludeId);
    const ctx = { userColorType };

    const scored = items
      .filter((candidate) =>
        this.pairAllowed(virtual, candidate, allowConflicts),
      )
      .map((candidate) => ({
        item: candidate,
        score: computeTotalScore(virtual, candidate, ctx).total,
      }))
      .sort((a, b) => b.score - a.score);

    const skipped = items.length - scored.length;
    const recommendable = scored.filter(
      (entry) => entry.score >= MIN_RECOMMENDABLE_SCORE,
    );

    const results: MatchPreviewPair[] = scored.map((entry) => ({
      id: entry.item.id,
      name: entry.item.name,
      category: entry.item.category,
      hex: entry.item.color.hex,
      imageUrl: entry.item.imageUrl,
      score: entry.score,
    }));

    const avgScore = recommendable.length
      ? Math.round(
          recommendable.reduce((sum, entry) => sum + entry.score, 0) /
            recommendable.length,
        )
      : null;

    const byCategory: MatchPreviewSlot[] = CATEGORY_ORDER.map((category) => ({
      category,
      owned: items.filter((item) => item.category === category).length,
      matches: recommendable.filter((entry) => entry.item.category === category)
        .length,
      compatible:
        category === virtual.category
          ? categoryStacks(category)
          : !categoriesConflict(virtual.category, category),
    }));

    return {
      wardrobeSize: items.length,
      matchCount: recommendable.length,
      avgScore,
      topScore: recommendable[0]?.score ?? null,
      results,
      skipped,
      byCategory,
    };
  }
}
