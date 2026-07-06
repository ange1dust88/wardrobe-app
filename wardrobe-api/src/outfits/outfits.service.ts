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

  async findAll(userId: string): Promise<Outfit[]> {
    const rows = await this.prisma.outfit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toOutfit(r));
  }

  async findOne(userId: string, id: string): Promise<OutfitWithItems> {
    const row = await this.prisma.outfit.findFirst({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    const outfit = this.toOutfit(row);
    const items = await this.itemsService.findByIds(userId, outfit.itemIds);
    return { ...outfit, items };
  }

  async create(userId: string, dto: CreateOutfitDto): Promise<Outfit> {
    const itemIds = this.dedupe(dto.itemIds);
    await this.assertItemsExist(userId, itemIds);
    const folderId = dto.folderId ?? null;
    await this.assertFolderExists(userId, folderId);
    const row = await this.prisma.outfit.create({
      data: { userId, name: dto.name, itemIds, folderId },
    });
    return this.toOutfit(row);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateOutfitDto,
  ): Promise<Outfit> {
    const existing = await this.prisma.outfit.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    const data: {
      name?: string;
      itemIds?: string[];
      folderId?: string | null;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.itemIds !== undefined) {
      const itemIds = this.dedupe(dto.itemIds);
      await this.assertItemsExist(userId, itemIds);
      data.itemIds = itemIds;
    }
    if (dto.folderId !== undefined) {
      await this.assertFolderExists(userId, dto.folderId);
      data.folderId = dto.folderId;
    }
    const row = await this.prisma.outfit.update({ where: { id }, data });
    return this.toOutfit(row);
  }

  async remove(
    userId: string,
    id: string,
  ): Promise<{ deleted: true; id: string }> {
    const existing = await this.prisma.outfit.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Outfit ${id} not found`);
    }
    await this.prisma.outfit.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async assertItemsExist(userId: string, ids: string[]): Promise<void> {
    const missing = await this.itemsService.missingIds(userId, ids);
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown item ids: ${missing.join(', ')}`);
    }
  }

  private async assertFolderExists(
    userId: string,
    folderId: string | null,
  ): Promise<void> {
    if (!folderId) return;
    const found = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });
    if (!found) {
      throw new BadRequestException(`Unknown folder id: ${folderId}`);
    }
  }

  private dedupe(ids: string[]): string[] {
    return [...new Set(ids)];
  }

  private toOutfit(row: {
    id: string;
    name: string;
    itemIds: string[];
    folderId: string | null;
    createdAt: Date;
  }): Outfit {
    return {
      id: row.id,
      name: row.name,
      itemIds: row.itemIds,
      folderId: row.folderId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
