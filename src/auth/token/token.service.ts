import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'
import { InfoRefreshToken, Token, TokenPairAuth } from './token.model'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel('Token') private tokenModel: Model<Token>
  ) { }

  private async buildRefreshToken(userID: string, oldUUIDToken?: string): Promise<string> {
    const userTokens = await this.getUserTokens(userID);
    const uuidToken: string = uuid();
    const tokenString = this.jwtService.sign(
      {
        sub: userID,
        token: uuidToken,
      },
      {
        secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_JWT_DURATION'),
      },
    )
    if (oldUUIDToken) {
      const index = userTokens.refreshTokens.indexOf(oldUUIDToken);
      if (index > -1) {
        userTokens.refreshTokens.splice(index, 1);
      }
    }
    userTokens.refreshTokens.push(uuidToken);
    await userTokens.save();
    return tokenString;
  }

  private async buildAccessToken(username: string): Promise<string> {
    return this.jwtService.sign(
      { sub: username },
      {
        expiresIn: this.configService.get<string>('ACCESS_JWT_DURATION'),
      },
    )
  }

  async generateTokenPair(username: string, oldUUIDToken?: string): Promise<TokenPairAuth> {
    return new TokenPairAuth(await this.buildAccessToken(username), await this.buildRefreshToken(username, oldUUIDToken))
  }

  async useRefreshToken(refreshToken: string, logout = false): Promise<TokenPairAuth | null> {
    try {
      const decodedRtoken: InfoRefreshToken = await this.getInfoRefreshToken(refreshToken);
      const user = await this.getUserTokens(decodedRtoken.sub);

      if (!user || !user.refreshTokens.includes(decodedRtoken.token)) {
        throw new UnauthorizedException("User or refresh token not found");
      }

      if (logout) {
        await user.updateOne({
          $pull: {
            refreshTokens: decodedRtoken.token,
          },
        });
      }

      return logout ? null : this.generateTokenPair(decodedRtoken.sub, decodedRtoken.token);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getInfoRefreshToken(refreshToken: string): Promise<InfoRefreshToken> {
    return this.jwtService.verifyAsync<InfoRefreshToken>(refreshToken, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
    });
  }

  

  private async getUserTokens(sub: string): Promise<Token> {
    const userTokens = await this.tokenModel.findOne({ username: sub }).exec();
    if (!userTokens) { return new this.tokenModel({username: sub}) }
    return userTokens;
  }

}
