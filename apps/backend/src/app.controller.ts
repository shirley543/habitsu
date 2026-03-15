import {
  Controller,
  HttpCode,
  Post,
  Request as Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Response } from 'express';
import { JwtAuthenticatedRequest } from './auth/jwt-auth.types';

@Controller('auth')
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  login(
    @Req() req: JwtAuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Return JWT access token via cookie upon successful login
    const { access_token } = this.authService.login(req.user);
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { message: 'Logged in' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  logout(
    @Req() req: JwtAuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // TODOs #28 invalidate refresh token, if refresh tokens implemented
    // Clear the JWT cookie
    res.clearCookie('jwt', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    console.log(`User ${req.user.email} logged out`);
    return { message: 'Logged out' };
  }
}

// TODOs #29 Check if any routes missing JwtAuthGuard

// TODOs #31 Refactor .env so that there are local, dev, and prod versions of variables
