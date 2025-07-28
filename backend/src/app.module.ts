import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GoalsModule } from './goals/goals.module';
import { GoalEntriesModule } from './goalEntries/goalEntries.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';

@Module({
  imports: [
    PrismaModule,
    GoalsModule,
    GoalEntriesModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
