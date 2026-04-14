import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOnBoardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class OnBoardingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateOnBoarding(dto: UpdateOnBoardingDto) {
    return this.prisma.onBoardingSettings.update({
        where: { userId: dto.userId },
            data: dto,
        });
    }
}