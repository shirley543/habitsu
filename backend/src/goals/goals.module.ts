import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from 'src/users/users.service';
import { EnvModule } from 'src/env/env.module';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService, UsersService],
  imports: [PrismaModule, EnvModule],
  exports: [GoalsService]
})
export class GoalsModule {}