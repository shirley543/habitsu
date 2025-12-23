import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { JwtPayload } from './jwt-auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(envConfigService: EnvService) {
    const jwtSecret = envConfigService.get('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req.cookies.jwt; ///< Get token from cookie
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, ///< Future work: Currently symmetric secret. Investigate PEM-encoded (asymmetric) public key
    });
  }

  validate(payload: JwtPayload) {
    // Future work: currently "stateless JWT" model i.e. each API call immediately authorized based on presence of a valid JWT,
    // with some info about requestor (userId and username) available in Request pipeline.
    // To investigate whether other info needed (e.g. DB lookup to extract more info about user and return a more detailed user-obj).
    // Or if further token validation useful (see if userId is in revoked tokens list, then perform token revocation)
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    }; ///< i.e. req.user
  }
}
