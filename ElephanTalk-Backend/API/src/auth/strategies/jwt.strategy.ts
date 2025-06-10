import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import appConfig from 'src/config/app.config';
import { ConfigType } from '@nestjs/config';
import { TokenPayload } from '../models/token.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(appConfig.KEY) config: ConfigType<typeof appConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: TokenPayload) {
    return { id: payload.sub, role: payload.role };
  }
}
