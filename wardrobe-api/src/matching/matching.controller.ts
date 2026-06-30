import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SeasonPalette } from '../items/dto/item.dto';
import { MatchingService } from './matching.service';

@Controller('items')
@UseGuards(AuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('matches/map')
  getMatchMap(
    @CurrentUser() user: AuthUser,
    @Query('colorType') colorType?: string,
    @Query('allowConflicts') allowConflicts?: string,
  ) {
    const seasons: string[] = [
      SeasonPalette.Spring,
      SeasonPalette.Summer,
      SeasonPalette.Autumn,
      SeasonPalette.Winter,
    ];
    const userColorType = seasons.includes(colorType ?? '')
      ? (colorType as SeasonPalette)
      : undefined;
    return this.matchingService.getMatchMap(
      user.id,
      userColorType,
      allowConflicts === 'true',
    );
  }
}
