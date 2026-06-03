import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto, Item, UpdateItemDto } from './dto/item.dto';

@Injectable()
export class ItemsService {
  private items: Item[] = [];

  findAll(): Item[] {
    return this.items;
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
      ...dto,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  update(id: string, dto: UpdateItemDto): Item {
    const item = this.findOne(id);
    Object.assign(item, dto);
    return item;
  }

  remove(id: string): { deleted: true; id: string } {
    const item = this.findOne(id);
    this.items = this.items.filter((i) => i.id !== item.id);
    return { deleted: true, id };
  }
}
