import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Item as DbItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { extractDominantHex } from './color-extraction';
import {
  Brightness,
  Category,
  CreateItemDto,
  Formality,
  Item,
  Pattern,
  Saturation,
  SeasonPalette,
  SeasonWear,
  Temperature,
  UpdateItemDto,
  Vibe,
  WardrobeRole,
} from './dto/item.dto';
import { deriveColor, deriveItemData } from './item-derivation';
import { StorageService, UploadedImage } from '../storage/storage.service';
import { MatchMapCacheService } from '../matching/match-map-cache.service';

export type UploadedItemImage = UploadedImage;

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly matchMapCache: MatchMapCacheService,
  ) {}

  async findAll(userId: string): Promise<Item[]> {
    const rows = await this.prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toItem(r));
  }

  async findByIds(userId: string, ids: string[]): Promise<Item[]> {
    const rows = await this.prisma.item.findMany({
      where: { userId, id: { in: ids } },
    });
    return rows.map((r) => this.toItem(r));
  }

  async missingIds(userId: string, ids: string[]): Promise<string[]> {
    const rows = await this.prisma.item.findMany({
      where: { userId, id: { in: ids } },
      select: { id: true },
    });
    const found = new Set(rows.map((r) => r.id));
    return ids.filter((id) => !found.has(id));
  }

  async findOne(userId: string, id: string): Promise<Item> {
    const row = await this.prisma.item.findFirst({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return this.toItem(row);
  }

  async create(
    userId: string,
    dto: CreateItemDto,
    image?: UploadedItemImage,
  ): Promise<Item> {
    let hex = dto.hex;
    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await this.storage.uploadImage(image);
      if (!hex) {
        hex = await extractDominantHex(image.buffer);
      }
    }
    if (!hex) {
      throw new BadRequestException('Provide an image or a hex color');
    }
    const derived = deriveItemData(hex);
    const row = await this.prisma.item.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        subType: dto.subType ?? null,
        pattern: dto.pattern,
        formality: dto.formality ?? null,
        vibe: dto.vibe,
        seasonWear: dto.seasonWear,
        imageUrl,
        hex: derived.color.hex,
        accentHex: dto.accentHex ?? null,
        hue: derived.color.hue,
        temperature: derived.color.temperature,
        brightness: derived.color.brightness,
        saturation: derived.color.saturation,
        isNeutral: derived.color.isNeutral,
        wardrobeRole: derived.wardrobeRole,
        seasonPaletteCompatibility: derived.seasonPaletteCompatibility,
      },
    });
    this.matchMapCache.invalidate(userId);
    return this.toItem(row);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateItemDto,
    image?: UploadedItemImage,
  ): Promise<Item> {
    const current = await this.findOne(userId, id);
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.subType !== undefined) data.subType = dto.subType || null;
    if (dto.pattern !== undefined) data.pattern = dto.pattern;
    if (dto.formality !== undefined) data.formality = dto.formality ?? null;
    if (dto.accentHex !== undefined) data.accentHex = dto.accentHex || null;
    if (dto.vibe !== undefined) data.vibe = dto.vibe;
    if (dto.seasonWear !== undefined) data.seasonWear = dto.seasonWear;
    if (dto.hex !== undefined) {
      const derived = deriveItemData(dto.hex);
      data.hex = derived.color.hex;
      data.hue = derived.color.hue;
      data.temperature = derived.color.temperature;
      data.brightness = derived.color.brightness;
      data.saturation = derived.color.saturation;
      data.isNeutral = derived.color.isNeutral;
      data.wardrobeRole = derived.wardrobeRole;
      data.seasonPaletteCompatibility = derived.seasonPaletteCompatibility;
    }

    let newImageUrl: string | null = null;
    if (image) {
      newImageUrl = await this.storage.uploadImage(image);
      data.imageUrl = newImageUrl;
    }

    let row: DbItem;
    try {
      row = await this.prisma.item.update({ where: { id }, data });
    } catch (err) {
      if (newImageUrl) {
        await this.storage.deleteImage(newImageUrl);
      }
      throw err;
    }

    if (image && current.imageUrl) {
      await this.storage.deleteImage(current.imageUrl);
    }
    this.matchMapCache.invalidate(userId);
    return this.toItem(row);
  }

  async remove(
    userId: string,
    id: string,
  ): Promise<{ deleted: true; id: string }> {
    const item = await this.findOne(userId, id);

    const outfits = await this.prisma.outfit.findMany({
      where: { userId, itemIds: { has: id } },
      select: { id: true, itemIds: true },
    });

    await this.prisma.$transaction([
      this.prisma.item.delete({ where: { id } }),
      ...outfits.map((o) =>
        this.prisma.outfit.update({
          where: { id: o.id },
          data: { itemIds: o.itemIds.filter((itemId) => itemId !== id) },
        }),
      ),
    ]);

    if (item.imageUrl) {
      await this.storage.deleteImage(item.imageUrl);
    }
    this.matchMapCache.invalidate(userId);
    return { deleted: true, id };
  }

  async extractColor(image: UploadedItemImage): Promise<{ hex: string }> {
    return { hex: await extractDominantHex(image.buffer) };
  }

  private toItem(row: DbItem): Item {
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      name: row.name,
      category: row.category as Category,
      subType: row.subType,
      imageUrl: row.imageUrl,
      color: {
        hex: row.hex,
        hue: row.hue,
        temperature: row.temperature as Temperature,
        brightness: row.brightness as Brightness,
        saturation: row.saturation as Saturation,
        isNeutral: row.isNeutral,
      },
      accent: row.accentHex ? deriveColor(row.accentHex) : null,
      wardrobeRole: row.wardrobeRole as WardrobeRole,
      pattern: row.pattern as Pattern,
      formality: row.formality as Formality | null,
      vibe: row.vibe as Vibe[],
      seasonPaletteCompatibility:
        row.seasonPaletteCompatibility as SeasonPalette[],
      seasonWear: row.seasonWear as SeasonWear[],
    };
  }
}
