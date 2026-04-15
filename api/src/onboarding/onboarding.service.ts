import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnBoardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class OnBoardingService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertOnBoarding(userId: string, dto: UpdateOnBoardingDto) {
    return this.prisma.onBoardingSettings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async getOnBoarding(userId: string) {
    return this.prisma.onBoardingSettings.findUnique({
      where: { userId },
    });
  }
}
