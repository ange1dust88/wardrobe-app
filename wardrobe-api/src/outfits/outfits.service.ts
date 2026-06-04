import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemsService } from '../items/items.service';
import {
  CreateOutfitDto,
  Outfit,
  OutfitWithItems,
  UpdateOutfitDto,
} from './dto/outfit.dto';

@Injectable()
export class OutfitsService {
  private outfits: Outfit[] = [];

  constructor(private readonly itemsService: ItemsService) {}

  findAll(): Outfit[] {
    return this.outfits;
  }

  findOne(id: string): OutfitWithItems {
    const outfit = this.outfits.find((o) => o.id === id);
    if (!outfit) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    return { ...outfit, items: this.itemsService.findByIds(outfit.itemIds) };
  }

  create(dto: CreateOutfitDto): Outfit {
    this.assertItemsExist(dto.itemIds);
    const outfit: Outfit = {
      id: Date.now().toString(),
      name: dto.name,
      itemIds: this.dedupe(dto.itemIds),
      createdAt: new Date().toISOString(),
    };
    this.outfits.push(outfit);
    return outfit;
  }

  update(id: string, dto: UpdateOutfitDto): Outfit {
    const outfit = this.outfits.find((o) => o.id === id);
    if (!outfit) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    if (dto.itemIds) {
      this.assertItemsExist(dto.itemIds);
      outfit.itemIds = this.dedupe(dto.itemIds);
    }
    if (dto.name !== undefined) {
      outfit.name = dto.name;
    }
    return outfit;
  }

  remove(id: string): { deleted: true; id: string } {
    const exists = this.outfits.some((o) => o.id === id);
    if (!exists) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    this.outfits = this.outfits.filter((o) => o.id !== id);
    return { deleted: true, id };
  }

  private assertItemsExist(ids: string[]): void {
    const missing = this.itemsService.missingIds(this.dedupe(ids));
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown item ids: ${missing.join(', ')}`);
    }
  }

  private dedupe(ids: string[]): string[] {
    return [...new Set(ids)];
  }
}
