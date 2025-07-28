import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: "jwtsecret", ///< TODOs to refactor and define in ConfigService
      signOptions: { expiresIn: "60s" } ///< TODOs to refactor and define in ConfigService
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
