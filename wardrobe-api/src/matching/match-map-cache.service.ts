import { Injectable } from '@nestjs/common';
import { ScoreBreakdown } from './match-scoring';

export type MatchCell = { score: number; breakdown: ScoreBreakdown };
export type MatchMap = Record<string, Record<string, MatchCell>>;

@Injectable()
export class MatchMapCacheService {
  private cache = new Map<string, MatchMap>();

  private key(
    userId: string,
    colorType?: string,
    allowConflicts = false,
  ): string {
    return `${userId}::${colorType ?? ''}::${allowConflicts ? '1' : '0'}`;
  }

  get(
    userId: string,
    colorType?: string,
    allowConflicts = false,
  ): MatchMap | undefined {
    return this.cache.get(this.key(userId, colorType, allowConflicts));
  }

  set(
    userId: string,
    map: MatchMap,
    colorType?: string,
    allowConflicts = false,
  ): void {
    this.cache.set(this.key(userId, colorType, allowConflicts), map);
  }

  invalidate(userId: string): void {
    const prefix = `${userId}::`;
    for (const k of this.cache.keys()) {
      if (k.startsWith(prefix)) this.cache.delete(k);
    }
  }
}
