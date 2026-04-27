import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthModule } from './auth/jwt-auth.module';
import { OnBoardingModule } from './onboarding/onboarding.module';
import { UsersModule } from './users/users.module';
import { TopicsModule } from './topics/topics.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtAuthModule,
    OnBoardingModule,
    UsersModule,
    AiModule,
    TopicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
