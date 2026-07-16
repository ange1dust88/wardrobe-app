import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.userProfile.findUnique({ where: { userId } });
  }

  upsert(userId: string, dto: UpsertProfileDto) {
    const data = {
      who: dto.who ?? null,
      climate: dto.climate ?? null,
      palettes: dto.palettes ?? [],
      hair: dto.hair ?? null,
      eyes: dto.eyes ?? null,
      skin: dto.skin ?? null,
      undertone: dto.undertone ?? null,
      onboardedAt: new Date(),
    };
    return this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
