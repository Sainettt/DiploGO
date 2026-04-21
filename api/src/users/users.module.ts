import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtGuard],
})
export class UsersModule {}
