import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    // Return JWT access token via cookie upon successful login
    const { access_token } = await this.authService.login(req.user);
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).send({ message: 'Logged in' });
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    console.log("Logout req", req)
    console.log("TODOs invalidate refresh token, once refresh tokens implemented?")
    // return req.logout();
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
