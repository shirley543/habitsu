import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from '../users/users.service';
import { EnvModule } from '../env/env.module';
import { GoalsService } from '../goals/goals.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, UsersService, GoalsService],
  imports: [PrismaModule, EnvModule],
  exports: [ProfilesService],
})
export class ProfilesModule {}
