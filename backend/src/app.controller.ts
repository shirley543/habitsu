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

// TODOs 28-July-2025 / 29-July-2025
// Figure out which routes to protect with JwtAuthGuard + how to handle profiles being:
// - private (only goal's creator user, i.e. check logged in user is goal's creator user)
// - public (profile visible to all users)
// As well as goals being
// - private (only shown on profile if profile viewer user is the creator)
// - public (shown on profile for all users)
// Refactor .env so that:
// - there is type-safety
// - there are local, dev, and prod versions of variables
// - saltRounds is actually used

