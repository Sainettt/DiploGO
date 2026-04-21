import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updatePushToken(userId: string, token: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
    return { success: true };
  }
}
