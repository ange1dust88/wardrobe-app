import { Global, Module } from '@nestjs/common';
import { MatchMapCacheService } from './match-map-cache.service';

@Global()
@Module({
  providers: [MatchMapCacheService],
  exports: [MatchMapCacheService],
})
export class MatchMapCacheModule {}
