import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from '../users/users.service';
import { EnvModule } from '../env/env.module';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService, UsersService],
  imports: [PrismaModule, EnvModule],
  exports: [GoalsService],
})
export class GoalsModule {}
