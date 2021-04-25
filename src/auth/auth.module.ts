import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { WebauthnModule } from './webauthn/webauthn.module'
import { TokenModule } from './token/token.module'

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      cache:true
    }),
    TokenModule,
    WebauthnModule
  ],
  providers: [ConfigService]
})
export class AuthModule { }
