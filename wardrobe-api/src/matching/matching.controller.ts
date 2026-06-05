import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchQueryDto } from './dto/match-query.dto';
import { MatchingService } from './matching.service';

@Controller('items')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':anchorId/matches')
  getMatches(
    @Param('anchorId') anchorId: string,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchingService.getMatches(anchorId, query);
  }
}
