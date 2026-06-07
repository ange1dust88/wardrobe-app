import { Injectable } from '@nestjs/common';
import { Category, Item } from '../items/dto/item.dto';
import { ItemsService } from '../items/items.service';
import { MatchQueryDto } from './dto/match-query.dto';
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

@Injectable()
export class MatchingService {
  constructor(private readonly itemsService: ItemsService) {}

  async getMatches(
    anchorId: string,
    query: MatchQueryDto,
  ): Promise<MatchResult> {
    const anchor = await this.itemsService.findOne(anchorId);

    let candidates = (await this.itemsService.findAll()).filter(
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
}
