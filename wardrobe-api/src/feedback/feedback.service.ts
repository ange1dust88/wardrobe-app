import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.guard';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateFeedbackDto): Promise<{ ok: true }> {
    await this.prisma.feedback.create({
      data: {
        userId: user.id,
        email: user.email ?? null,
        message: dto.message,
        page: dto.page ?? null,
      },
    });
    return { ok: true };
  }
}
