import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FoldersModule } from './folders/folders.module';
import { ItemsModule } from './items/items.module';
import { MatchMapCacheModule } from './matching/match-map-cache.module';
import { MatchingModule } from './matching/matching.module';
import { OutfitsModule } from './outfits/outfits.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    AuthModule,
    MatchMapCacheModule,
    ItemsModule,
    OutfitsModule,
    FoldersModule,
    MatchingModule,
    ProfileModule,
  ],
})
export class AppModule {}
