import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MatchQueryDto } from './dto/match-query.dto';
import { SuggestMatchesDto } from './dto/suggest-matches.dto';
import { MatchingService } from './matching.service';

@Controller('items')
@UseGuards(AuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':anchorId/matches')
  getMatches(
    @CurrentUser() user: AuthUser,
    @Param('anchorId') anchorId: string,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchingService.getMatches(user.id, anchorId, query);
  }

  @Post('matches')
  suggestMatches(
    @CurrentUser() user: AuthUser,
    @Body() dto: SuggestMatchesDto,
  ) {
    return this.matchingService.suggestMatches(user.id, dto);
  }
}
