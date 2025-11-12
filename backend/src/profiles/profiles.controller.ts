import {
  Controller,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileEntity } from './profiles.entity';

@Controller('profiles')
@ApiTags('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
