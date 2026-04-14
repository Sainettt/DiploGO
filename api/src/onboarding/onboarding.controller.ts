import { Controller, Post, Body } from '@nestjs/common';
import { OnBoardingService } from './onboarding.service';
import { UpdateOnBoardingDto } from './dto/update-onboarding.dto';

@Controller('onboarding')
export class OnBoardingController {
  constructor(private readonly onboardingService: OnBoardingService) {}

  @Post()
  async updateOnBoarding(@Body() dto: UpdateOnBoardingDto) {
    return this.onboardingService.updateOnBoarding(dto);
  }
}
