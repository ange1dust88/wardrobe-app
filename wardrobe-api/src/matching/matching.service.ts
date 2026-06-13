import { BadRequestException, Injectable } from '@nestjs/common';
import { Category, Item } from '../items/dto/item.dto';
import { ItemsService } from '../items/items.service';
import { MatchQueryDto } from './dto/match-query.dto';
import { SuggestMatchesDto } from './dto/suggest-matches.dto';
import { MatchMap, MatchMapCacheService } from './match-map-cache.service';
import {
  computeTotalScore,
  isRecommendableScore,
  ScoreBreakdown,
} from './match-scoring';

export type ScoredMatch = {
  item: Item;
  score: number;
  breakdown: ScoreBreakdown;
};

export type MatchResult = {
  anchor: Item;
  matches: Record<Category, ScoredMatch[]>;
};

export type SuggestMatch = {
  item: Item;
  score: number;
};

export type SuggestResult = {
  selected: Item[];
  matches: Record<Category, SuggestMatch[]>;
};

@Injectable()
export class MatchingService {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly matchMapCache: MatchMapCacheService,
  ) {}

  async getMatchMap(userId: string): Promise<MatchMap> {
    const cached = this.matchMapCache.get(userId);
    if (cached) {
      return cached;
    }

    const items = await this.itemsService.findAll(userId);
    const map: MatchMap = {};
    for (const anchor of items) {
      const ctx = { vibe: anchor.vibe };
      const scores: Record<string, number> = {};
      for (const candidate of items) {
        if (
          candidate.id === anchor.id ||
          candidate.category === anchor.category
        ) {
          continue;
        }
        const { total } = computeTotalScore(anchor, candidate, ctx);
        if (isRecommendableScore(total)) {
          scores[candidate.id] = total;
        }
      }
      map[anchor.id] = scores;
    }
    this.matchMapCache.set(userId, map);
    return map;
  }

  async getMatches(
    userId: string,
    anchorId: string,
    query: MatchQueryDto,
  ): Promise<MatchResult> {
    const anchor = await this.itemsService.findOne(userId, anchorId);

    let candidates = (await this.itemsService.findAll(userId)).filter(
      (item) => item.id !== anchor.id && item.category !== anchor.category,
    );

    if (query.category) {
      candidates = candidates.filter((c) => c.category === query.category);
    }
    if (query.season) {
      candidates = candidates.filter((c) =>
        c.seasonWear.includes(query.season!),
      );
    }

    const ctx = {
      userColorType: query.userColorType,
      vibe: query.vibe?.length ? query.vibe : anchor.vibe,
    };

    const scored: ScoredMatch[] = candidates
      .map((item) => {
        const { total, breakdown } = computeTotalScore(anchor, item, ctx);
        return { item, score: total, breakdown };
      })
      .filter((s) => isRecommendableScore(s.score))
      .sort((a, b) => b.score - a.score);

    const matches = {} as Record<Category, ScoredMatch[]>;
    for (const category of Object.values(Category)) {
      matches[category] = scored.filter((s) => s.item.category === category);
    }

    return { anchor, matches };
  }

  async suggestMatches(
    userId: string,
    dto: SuggestMatchesDto,
  ): Promise<SuggestResult> {
    const missing = await this.itemsService.missingIds(userId, dto.itemIds);
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown item ids: ${missing.join(', ')}`);
    }

    const selected = await this.itemsService.findByIds(userId, dto.itemIds);
    const selectedIds = new Set(dto.itemIds);
    const selectedCategories = new Set(selected.map((s) => s.category));

    let candidates = (await this.itemsService.findAll(userId)).filter(
      (item) =>
        !selectedIds.has(item.id) && !selectedCategories.has(item.category),
    );
    if (dto.season) {
      candidates = candidates.filter((c) => c.seasonWear.includes(dto.season!));
    }

    const ctx = {
      userColorType: dto.userColorType,
      vibe: dto.vibe?.length
        ? dto.vibe
        : [...new Set(selected.flatMap((s) => s.vibe))],
    };

    const scored: SuggestMatch[] = candidates
      .map((item) => {
        const totals = selected.map(
          (s) => computeTotalScore(s, item, ctx).total,
        );
        const score = Math.round(
          totals.reduce((sum, t) => sum + t, 0) / totals.length,
        );
        return { item, score };
      })
      .filter((s) => isRecommendableScore(s.score))
      .sort((a, b) => b.score - a.score);

    const matches = {} as Record<Category, SuggestMatch[]>;
    for (const category of Object.values(Category)) {
      matches[category] = scored.filter((s) => s.item.category === category);
    }

    return { selected, matches };
  }
}
