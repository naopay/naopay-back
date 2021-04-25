import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TokenControler } from './token.controller';
import { TokenSchema } from './token.model';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache:true
    }),
    PassportModule.register({defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'Token', schema: TokenSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('ACCESS_JWT_SECRET')
        }
      },
      inject: [ConfigService]
    })
  ],
  controllers: [TokenControler],
  providers: [TokenService, JwtStrategy],
  exports: [TokenService]
})
export class TokenModule {}
