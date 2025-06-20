import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GoalsModule } from './goals/goals.module';
import { GoalEntriesModule } from './goalEntries/goalEntries.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, GoalsModule, GoalEntriesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
