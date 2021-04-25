import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy, AuthGuard } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TokenService } from './token.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private tokenService: TokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    return payload.sub;
  }
}
