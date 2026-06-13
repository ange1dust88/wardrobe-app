import { Injectable } from '@nestjs/common';

export type MatchMap = Record<string, Record<string, number>>;

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
