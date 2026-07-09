import { BadGatewayException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async exportData(userId: string): Promise<unknown> {
    const [items, outfits, folders, profile, feedback] = await Promise.all([
      this.prisma.item.findMany({ where: { userId } }),
      this.prisma.outfit.findMany({ where: { userId } }),
      this.prisma.folder.findMany({ where: { userId } }),
      this.prisma.userProfile.findFirst({ where: { userId } }),
      this.prisma.feedback.findMany({ where: { userId } }),
    ]);
    return { items, outfits, folders, profile, feedback };
  }

  async remove(userId: string): Promise<{ deleted: true }> {
    const items = await this.prisma.item.findMany({
      where: { userId },
      select: { imageUrl: true },
    });
    await Promise.all(
      items
        .map((i) => i.imageUrl)
        .filter((url): url is string => !!url)
        .map((url) => this.storage.deleteImage(url)),
    );

    await this.prisma.outfit.deleteMany({ where: { userId } });
    await this.prisma.folder.deleteMany({ where: { userId } });
    await this.prisma.item.deleteMany({ where: { userId } });
    await this.prisma.userProfile.deleteMany({ where: { userId } });
    await this.prisma.feedback.deleteMany({ where: { userId } });

    const authDeleted = await this.storage.deleteAuthUser(userId);
    if (!authDeleted) {
      throw new BadGatewayException(
        'Your data was removed, but the sign-in account could not be deleted. Please retry.',
      );
    }
    return { deleted: true };
  }
}
