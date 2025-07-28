import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "jwtsecret", ///< TODOs to refactor and define in ConfigService. Currently symmetric secret. Future work: investigate PEM-encoded (asymmetric) public key
    });
  }

  async validate(payload: any) {
    // Future work: currently "stateless JWT" model i.e. each API call immediately authorized based on presence of a valid JWT, 
    // with some info about requestor (userId and username) available in Request pipeline.
    // To investigate whether other info needed (e.g. DB lookup to extract more info about user and return a more detailed user-obj).
    // Or if further token validation useful (see if userId is in revoked tokens list, then perform token revocation)
    return { userId: payload.sub, username: payload.username };
  }
}