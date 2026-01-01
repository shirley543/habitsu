import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envConfigService: EnvService) => ({
        secret: envConfigService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: envConfigService.get('JWT_EXPIRY'),
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, EnvService],
  exports: [AuthService],
})
export class AuthModule {}
