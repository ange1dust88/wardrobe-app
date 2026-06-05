import { Module } from '@nestjs/common';
import { ItemsModule } from '../items/items.module';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [ItemsModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
