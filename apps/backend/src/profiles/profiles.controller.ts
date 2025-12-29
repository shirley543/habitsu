import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileEntity } from './profiles.entity';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username')
  @ApiOkResponse({ type: ProfileEntity })
  findByUsername(
    @Req() req,
    @Param('username') username: string
  ) {
    const userId = req?.user?.id;
    return this.profilesService.findByUsername(username, userId);
  }
}