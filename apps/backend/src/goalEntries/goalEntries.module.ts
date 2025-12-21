import { Module } from '@nestjs/common';
import { GoalEntriesService } from './goalEntries.service';
import { GoalEntriesController } from './goalEntries.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GoalsModule } from 'src/goals/goals.module';

@Module({
  controllers: [GoalEntriesController],
  providers: [GoalEntriesService],
  imports: [PrismaModule, GoalsModule],
})
export class GoalEntriesModule {}