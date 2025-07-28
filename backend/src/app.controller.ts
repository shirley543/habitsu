import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    // Return JWT access token upon successful login
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  // Dummy protected route to confirm JwtAuthGuard working as intended (i.e. said route only accessible with valid access_token)
  // TODOs: remove later
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
