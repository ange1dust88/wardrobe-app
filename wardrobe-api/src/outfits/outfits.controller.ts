import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OutfitsService } from './outfits.service';
import { CreateOutfitDto, UpdateOutfitDto } from './dto/outfit.dto';

@Controller('outfits')
export class OutfitsController {
  constructor(private readonly outfitsService: OutfitsService) {}

  @Get()
  findAll() {
    return this.outfitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.outfitsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOutfitDto) {
    return this.outfitsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOutfitDto) {
    return this.outfitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.outfitsService.remove(id);
  }
}
