import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemsService } from '../items/items.service';
import {
  CreateOutfitDto,
  Outfit,
  OutfitWithItems,
  UpdateOutfitDto,
} from './dto/outfit.dto';

@Injectable()
export class OutfitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly itemsService: ItemsService,
  ) {}

  async findAll(): Promise<Outfit[]> {
    const rows = await this.prisma.outfit.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toOutfit(r));
  }

  async findOne(id: string): Promise<OutfitWithItems> {
    const row = await this.prisma.outfit.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    const outfit = this.toOutfit(row);
    const items = await this.itemsService.findByIds(outfit.itemIds);
    return { ...outfit, items };
  }

  async create(dto: CreateOutfitDto): Promise<Outfit> {
    const itemIds = this.dedupe(dto.itemIds);
    await this.assertItemsExist(itemIds);
    const row = await this.prisma.outfit.create({
      data: { name: dto.name, itemIds },
    });
    return this.toOutfit(row);
  }

  async update(id: string, dto: UpdateOutfitDto): Promise<Outfit> {
    const existing = await this.prisma.outfit.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    const data: { name?: string; itemIds?: string[] } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.itemIds !== undefined) {
      const itemIds = this.dedupe(dto.itemIds);
      await this.assertItemsExist(itemIds);
      data.itemIds = itemIds;
    }
    const row = await this.prisma.outfit.update({ where: { id }, data });
    return this.toOutfit(row);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const existing = await this.prisma.outfit.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    await this.prisma.outfit.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async assertItemsExist(ids: string[]): Promise<void> {
    const missing = await this.itemsService.missingIds(ids);
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown item ids: ${missing.join(', ')}`);
    }
  }

  private dedupe(ids: string[]): string[] {
    return [...new Set(ids)];
  }

  private toOutfit(row: {
    id: string;
    name: string;
    itemIds: string[];
    createdAt: Date;
  }): Outfit {
    return {
      id: row.id,
      name: row.name,
      itemIds: row.itemIds,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
