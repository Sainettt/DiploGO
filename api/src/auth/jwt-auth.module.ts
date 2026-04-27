import { Global, Module } from '@nestjs/common';
import { JwtGuard } from './guards/jwt.guard';

@Global()
@Module({
  providers: [JwtGuard],
  exports: [JwtGuard],
})
export class JwtAuthModule {}
