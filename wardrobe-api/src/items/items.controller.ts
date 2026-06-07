import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import type { UploadedItemImage } from './items.service';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateItemDto,
    @UploadedFile() image?: UploadedItemImage,
  ) {
    if (image && !ALLOWED_IMAGE_MIME_TYPES.has(image.mimetype)) {
      throw new BadRequestException('Image must be a JPG, PNG, WebP, or GIF');
    }
    return this.itemsService.create(dto, image);
  }

  @Post('extract-color')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  extractColor(@UploadedFile() image?: UploadedItemImage) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(image.mimetype)) {
      throw new BadRequestException('Image must be a JPG, PNG, WebP, or GIF');
    }
    return this.itemsService.extractColor(image);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
