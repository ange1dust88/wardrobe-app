import { Module } from '@nestjs/common';
import { ItemsModule } from './items/items.module';
import { MatchingModule } from './matching/matching.module';
import { OutfitsModule } from './outfits/outfits.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    ItemsModule,
    OutfitsModule,
    MatchingModule,
  ],
})
export class AppModule {}
