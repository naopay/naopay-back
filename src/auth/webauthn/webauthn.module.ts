import { Module } from '@nestjs/common';
import { WebauthnService } from './webauthn.service';
import { WebauthnController } from './webauthn.controller';
import { WebAuthnSchema } from './schemas/webauthn.model';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from '../token/token.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'WebAuthn', schema: WebAuthnSchema }]),
    TokenModule
  ],
  controllers: [WebauthnController],
  providers: [
    WebauthnService,
    ConfigService
  ],
  exports: [
    WebauthnService
  ]
})
export class WebauthnModule {}
