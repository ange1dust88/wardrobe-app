import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto, Folder, UpdateFolderDto } from './dto/folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Folder[]> {
    const rows = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toFolder(r));
  }

  async create(userId: string, dto: CreateFolderDto): Promise<Folder> {
    const row = await this.prisma.folder.create({
      data: { userId, name: dto.name },
    });
    return this.toFolder(row);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateFolderDto,
  ): Promise<Folder> {
    await this.assertOwned(userId, id);
    const row = await this.prisma.folder.update({
      where: { id },
      data: { name: dto.name },
    });
    return this.toFolder(row);
  }

  async remove(
    userId: string,
    id: string,
  ): Promise<{ deleted: true; id: string }> {
    await this.assertOwned(userId, id);
    await this.prisma.folder.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async assertOwned(userId: string, id: string): Promise<void> {
    const found = await this.prisma.folder.findFirst({ where: { id, userId } });
    if (!found) {
      throw new NotFoundException(`Folder ${id} not found`);
    }
  }

  private toFolder(row: { id: string; name: string; createdAt: Date }): Folder {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
