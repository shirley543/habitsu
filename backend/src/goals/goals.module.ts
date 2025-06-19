import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService],
  imports: [PrismaModule],
})
export class GoalsModule {}