import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto, Item, UpdateItemDto } from './dto/item.dto';
import { deriveItemData } from './item-derivation';

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

  create(dto: CreateItemDto): Item {
    const item: Item = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      name: dto.name,
      category: dto.category,
      pattern: dto.pattern,
      vibe: dto.vibe,
      seasonWear: dto.seasonWear,
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
    return { deleted: true, id };
  }
}
