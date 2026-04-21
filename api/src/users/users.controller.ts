import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/push-token')
  async updatePushToken(@Req() req: any, @Body() dto: UpdatePushTokenDto) {
    return this.usersService.updatePushToken(req.user.sub, dto.expoPushToken);
  }
}
