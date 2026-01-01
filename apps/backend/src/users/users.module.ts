import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EnvModule } from '../env/env.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, EnvModule],
  exports: [UsersService],
})
export class UsersModule {}
