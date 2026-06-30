import { Injectable } from '@nestjs/common';
import { ScoreBreakdown } from './match-scoring';

export type MatchCell = { score: number; breakdown: ScoreBreakdown };
export type MatchMap = Record<string, Record<string, MatchCell>>;

@Injectable()
export class MatchMapCacheService {
  private cache = new Map<string, MatchMap>();

  get(userId: string): MatchMap | undefined {
    return this.cache.get(userId);
  }

  set(userId: string, map: MatchMap): void {
    this.cache.set(userId, map);
  }

  invalidate(userId: string): void {
    this.cache.delete(userId);
  }
}
