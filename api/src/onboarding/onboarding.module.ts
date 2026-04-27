import { Module } from '@nestjs/common';
import { OnBoardingController } from './onboarding.controller';
import { OnBoardingService } from './onboarding.service';

@Module({
  controllers: [OnBoardingController],
  providers: [OnBoardingService],
})
export class OnBoardingModule {}
