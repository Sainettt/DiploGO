import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { OnBoardingService } from './onboarding.service';
import { UpdateOnBoardingDto } from './dto/update-onboarding.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('onboarding')
export class OnBoardingController {
  constructor(private readonly onboardingService: OnBoardingService) {}

  @Post()
  async upsertOnBoarding(@Req() req: any, @Body() dto: UpdateOnBoardingDto) {
    return this.onboardingService.upsertOnBoarding(req.user.sub, dto);
  }

  @Get()
  async getOnBoarding(@Req() req: any) {
    return this.onboardingService.getOnBoarding(req.user.sub);
  }
}
