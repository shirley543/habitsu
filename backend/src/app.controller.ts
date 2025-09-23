import { Controller, Get, HttpCode, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Return JWT access token via cookie upon successful login
    const { access_token } = await this.authService.login(req.user);
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
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // TODOs invalidate refresh token, once refresh tokens implemented?

    // Clear the JWT cookie
    res.clearCookie('jwt', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    console.log(`User ${req.user['email']} logged out`);
    return { message: 'Logged out' };
  }
}

// TODOs 28-July-2025 / TODOs 29-July-2025
// Figure out which routes to protect with JwtAuthGuard + how to handle profiles being:
// - private (only goal's creator user, i.e. check logged in user is goal's creator user)
// - public (profile visible to all users)
// As well as goals being
// - private (only shown on profile if profile viewer user is the creator)
// - public (shown on profile for all users)
// Refactor .env so that:
// - there are local, dev, and prod versions of variables
