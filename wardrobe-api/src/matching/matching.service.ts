import { Injectable } from '@nestjs/common';
import { SeasonPalette } from '../items/dto/item.dto';
import { ItemsService } from '../items/items.service';
import { MatchCell, MatchMap, MatchMapCacheService } from './match-map-cache.service';
import { categoriesConflict } from './category-compat';
import { seasonsConflict } from './season-compat';
import { computeTotalScore, isRecommendableScore } from './match-scoring';

@Injectable()
export class MatchingService {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly matchMapCache: MatchMapCacheService,
  ) {}

  async getMatchMap(
    userId: string,
    userColorType?: SeasonPalette,
    allowConflicts = false,
  ): Promise<MatchMap> {
    const useCache = !userColorType && !allowConflicts;
    if (useCache) {
      const cached = this.matchMapCache.get(userId);
      if (cached) {
        return cached;
      }
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
        if (candidate.category === anchor.category) {
          if (!allowConflicts) {
            continue;
          }
        } else if (
          !allowConflicts &&
          (categoriesConflict(anchor.category, candidate.category) ||
            seasonsConflict(anchor.seasonWear, candidate.seasonWear))
        ) {
          continue;
        }
        const { total, breakdown } = computeTotalScore(anchor, candidate, ctx);
        if (isRecommendableScore(total)) {
          scores[candidate.id] = { score: total, breakdown };
        }
      }
      map[anchor.id] = scores;
    }
    if (useCache) {
      this.matchMapCache.set(userId, map);
    }
    return map;
  }
}
