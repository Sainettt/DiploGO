import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OnBoardingModule } from './onboarding/onboarding.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, OnBoardingModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
