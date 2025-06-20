import { Module } from '@nestjs/common';
import { GoalEntriesService } from './goalEntries.service';
import { GoalEntriesController } from './goalEntries.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GoalEntriesController],
  providers: [GoalEntriesService],
  imports: [PrismaModule],
})
export class GoalEntriesModule {}