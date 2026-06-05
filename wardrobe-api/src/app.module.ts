import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { MatchingModule } from './matching/matching.module';
import { OutfitsModule } from './outfits/outfits.module';

@Module({
  imports: [ItemsModule, OutfitsModule, MatchingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
