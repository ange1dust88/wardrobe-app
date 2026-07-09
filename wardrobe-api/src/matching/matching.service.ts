import { Injectable } from '@nestjs/common';
import { SeasonPalette } from '../items/dto/item.dto';
import { ItemsService } from '../items/items.service';
import {
  MatchCell,
  MatchMap,
  MatchMapCacheService,
} from './match-map-cache.service';
import { categoriesConflict, categoryStacks } from './category-compat';
import { seasonsConflict } from './season-compat';
import { computeTotalScore } from './match-scoring';

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
        if (!allowConflicts) {
          if (candidate.category === anchor.category) {
            if (
              !categoryStacks(anchor.category) ||
              seasonsConflict(anchor.seasonWear, candidate.seasonWear)
            ) {
              continue;
            }
          } else if (
            categoriesConflict(anchor.category, candidate.category) ||
            seasonsConflict(anchor.seasonWear, candidate.seasonWear)
          ) {
            continue;
          }
        }
        const { total, breakdown } = computeTotalScore(anchor, candidate, ctx);
        scores[candidate.id] = { score: total, breakdown };
      }
      map[anchor.id] = scores;
    }
    this.matchMapCache.set(userId, map, userColorType, allowConflicts);
    return map;
  }
}
