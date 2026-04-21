import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import * as bcrypt from 'bcrypt';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passHash,
      },
    });

    return this.buildTokenResponse(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passHash) {
      throw new BadRequestException(
        'This account uses Google Sign-In. Please login with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildTokenResponse(user.id, user.email);
  }

  async googleAuth(dto: GoogleAuthDto) {
    // Native Android/iOS OAuth clients do not return id_token, only access_token.
    // We verify the access_token by calling Google's userinfo endpoint server-side.
    const userinfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${dto.accessToken}` },
      },
    ).catch(() => {
      throw new UnauthorizedException('Failed to reach Google');
    });

    if (!userinfoRes.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const userInfo: GoogleUserInfo = await userinfoRes.json();

    if (!userInfo.email) {
      throw new UnauthorizedException('Google token missing email');
    }

    const { email, sub: googleId, name, picture } = userInfo;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link googleId if user registered via email before
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: picture },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          username: name ?? email.split('@')[0],
          googleId,
          avatarUrl: picture,
        },
      });
    }

    return this.buildTokenResponse(user.id, user.email);
  }

  private async buildTokenResponse(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: userId, email },
    };
  }
}
