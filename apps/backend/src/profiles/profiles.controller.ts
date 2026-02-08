import { Controller, Get, Param, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileEntity } from './profiles.entity';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GoalEntity } from '../goals/goal.entity';
import { GoalsService } from '../goals/goals.service';
import { UserExceptionFilter } from '../users/filters/user.exceptionFilter';

@Controller('profiles')
@UseFilters(UserExceptionFilter)
@ApiTags('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly goalsService: GoalsService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username')
  @ApiOkResponse({ type: ProfileEntity })
  findByUsername(@Req() req, @Param('username') username: string) {
    const userId = req?.user?.id;
    return this.profilesService.findByUsername(username, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username/goals')
  @ApiOkResponse({ type: GoalEntity, isArray: true })
  findManyByUsername(@Req() req, @Param('username') username: string) {
    const userId = req.user.id;
    return this.goalsService.findManyByUsername(username, userId);
  }
}
