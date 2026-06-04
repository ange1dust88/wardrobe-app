import { Module } from '@nestjs/common';
import { ItemsModule } from '../items/items.module';
import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';

@Module({
  imports: [ItemsModule],
  controllers: [OutfitsController],
  providers: [OutfitsService],
})
export class OutfitsModule {}
