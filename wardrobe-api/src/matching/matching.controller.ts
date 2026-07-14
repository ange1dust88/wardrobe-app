import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SeasonPalette } from '../items/dto/item.dto';
import { MatchingService } from './matching.service';
import { PreviewItemDto } from './dto/preview-item.dto';

function parseColorType(colorType?: string): SeasonPalette | undefined {
  const seasons: string[] = [
    SeasonPalette.Spring,
    SeasonPalette.Summer,
    SeasonPalette.Autumn,
    SeasonPalette.Winter,
  ];
  return seasons.includes(colorType ?? '')
    ? (colorType as SeasonPalette)
    : undefined;
}

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
    return this.matchingService.getMatchMap(
      user.id,
      parseColorType(colorType),
      allowConflicts === 'true',
    );
  }

  @Post('matches/preview')
  previewMatches(
    @CurrentUser() user: AuthUser,
    @Body() dto: PreviewItemDto,
    @Query('colorType') colorType?: string,
    @Query('allowConflicts') allowConflicts?: string,
  ) {
    return this.matchingService.previewMatches(
      user.id,
      dto,
      parseColorType(colorType),
      allowConflicts === 'true',
    );
  }
}
