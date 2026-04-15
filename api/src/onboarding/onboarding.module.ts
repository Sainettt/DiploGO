import { Module } from '@nestjs/common';
import { OnBoardingController } from './onboarding.controller';
import { OnBoardingService } from './onboarding.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Module({
  controllers: [OnBoardingController],
  providers: [OnBoardingService, JwtGuard],
})
export class OnBoardingModule {}
