import { Module } from '@nestjs/common';
import { WebauthnService } from './webauthn.service';
import { WebauthnController } from './webauthn.controller';
import { WebAuthnSchema } from './schemas/webauthn.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'WebAuthn', schema: WebAuthnSchema }])],
  controllers: [WebauthnController],
  providers: [WebauthnService]
})
export class WebauthnModule {}
