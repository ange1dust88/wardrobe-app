import { Injectable, NotFoundException } from '@nestjs/common';
import { Item as DbItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  Brightness,
  Category,
  CreateItemDto,
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
import { deriveItemData } from './item-derivation';
import { StorageService, UploadedImage } from '../storage/storage.service';

export type UploadedItemImage = UploadedImage;

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(): Promise<Item[]> {
    const rows = await this.prisma.item.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toItem(r));
  }

  async findByIds(ids: string[]): Promise<Item[]> {
    const rows = await this.prisma.item.findMany({
      where: { id: { in: ids } },
    });
    return rows.map((r) => this.toItem(r));
  }

  async missingIds(ids: string[]): Promise<string[]> {
    const rows = await this.prisma.item.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const found = new Set(rows.map((r) => r.id));
    return ids.filter((id) => !found.has(id));
  }

  async findOne(id: string): Promise<Item> {
    const row = await this.prisma.item.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return this.toItem(row);
  }

  async create(dto: CreateItemDto, image?: UploadedItemImage): Promise<Item> {
    const derived = deriveItemData(dto.hex);
    const imageUrl = image ? await this.storage.uploadImage(image) : null;
    const row = await this.prisma.item.create({
      data: {
        name: dto.name,
        category: dto.category,
        pattern: dto.pattern,
        vibe: dto.vibe,
        seasonWear: dto.seasonWear,
        imageUrl,
        hex: derived.color.hex,
        hue: derived.color.hue,
        temperature: derived.color.temperature,
        brightness: derived.color.brightness,
        saturation: derived.color.saturation,
        isNeutral: derived.color.isNeutral,
        wardrobeRole: derived.wardrobeRole,
        seasonPaletteCompatibility: derived.seasonPaletteCompatibility,
      },
    });
    return this.toItem(row);
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.pattern !== undefined) data.pattern = dto.pattern;
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
    const row = await this.prisma.item.update({ where: { id }, data });
    return this.toItem(row);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const item = await this.findOne(id);

    const outfits = await this.prisma.outfit.findMany({
      where: { itemIds: { has: id } },
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
    return { deleted: true, id };
  }

  async setImage(id: string, file: UploadedItemImage): Promise<Item> {
    const current = await this.findOne(id);
    const imageUrl = await this.storage.uploadImage(file);

    let row: DbItem;
    try {
      row = await this.prisma.item.update({
        where: { id },
        data: { imageUrl },
      });
    } catch (err) {
      await this.storage.deleteImage(imageUrl);
      throw err;
    }

    if (current.imageUrl) {
      await this.storage.deleteImage(current.imageUrl);
    }
    return this.toItem(row);
  }

  private toItem(row: DbItem): Item {
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      name: row.name,
      category: row.category as Category,
      imageUrl: row.imageUrl,
      color: {
        hex: row.hex,
        hue: row.hue,
        temperature: row.temperature as Temperature,
        brightness: row.brightness as Brightness,
        saturation: row.saturation as Saturation,
        isNeutral: row.isNeutral,
      },
      wardrobeRole: row.wardrobeRole as WardrobeRole,
      pattern: row.pattern as Pattern,
      vibe: row.vibe as Vibe[],
      seasonPaletteCompatibility:
        row.seasonPaletteCompatibility as SeasonPalette[],
      seasonWear: row.seasonWear as SeasonWear[],
    };
  }
}
