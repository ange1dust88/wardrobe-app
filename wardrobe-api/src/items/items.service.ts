import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { CreateItemDto, Item, UpdateItemDto } from './dto/item.dto';
import { deriveItemData } from './item-derivation';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

export type UploadedItemImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@Injectable()
export class ItemsService {
  private items: Item[] = [];

  findAll(): Item[] {
    return this.items;
  }

  findByIds(ids: string[]): Item[] {
    return this.items.filter((i) => ids.includes(i.id));
  }

  missingIds(ids: string[]): string[] {
    return ids.filter((id) => !this.items.some((i) => i.id === id));
  }

  findOne(id: string): Item {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return item;
  }

  create(dto: CreateItemDto, image?: UploadedItemImage): Item {
    const imageUrl = image ? this.saveImage(image) : undefined;
    const item: Item = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name: dto.name,
      category: dto.category,
      pattern: dto.pattern,
      vibe: dto.vibe,
      seasonWear: dto.seasonWear,
      ...(imageUrl ? { imageUrl } : {}),
      ...deriveItemData(dto.hex),
    };
    this.items.push(item);
    return item;
  }

  update(id: string, dto: UpdateItemDto): Item {
    const item = this.findOne(id);
    if (dto.name !== undefined) {
      item.name = dto.name;
    }
    if (dto.category !== undefined) {
      item.category = dto.category;
    }
    if (dto.pattern !== undefined) {
      item.pattern = dto.pattern;
    }
    if (dto.vibe !== undefined) {
      item.vibe = dto.vibe;
    }
    if (dto.seasonWear !== undefined) {
      item.seasonWear = dto.seasonWear;
    }
    if (dto.hex !== undefined) {
      Object.assign(item, deriveItemData(dto.hex));
    }
    return item;
  }

  remove(id: string): { deleted: true; id: string } {
    const item = this.findOne(id);
    this.items = this.items.filter((i) => i.id !== item.id);
    this.removeImage(item.imageUrl);
    return { deleted: true, id };
  }

  private saveImage(image: UploadedItemImage): string {
    mkdirSync(UPLOADS_DIR, { recursive: true });
    const filename = `${randomUUID()}${this.extensionFor(image.mimetype)}`;
    writeFileSync(join(UPLOADS_DIR, filename), image.buffer);
    return `/uploads/${filename}`;
  }

  private removeImage(imageUrl?: string) {
    if (!imageUrl?.startsWith('/uploads/')) {
      return;
    }

    try {
      unlinkSync(join(UPLOADS_DIR, basename(imageUrl)));
    } catch {
      // Ignore missing files; the in-memory item is the source of truth here.
    }
  }

  private extensionFor(mimetype: string): string {
    switch (mimetype) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      default:
        return '';
    }
  }
}
