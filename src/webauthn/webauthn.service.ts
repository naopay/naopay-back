import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import base64url from 'base64url';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { WebAuthn } from './schemas/webauthn.model';

@Injectable()
export class WebauthnService {
    constructor(
        @InjectModel('WebAuthn') private webAuthnModel: Model<WebAuthn>){}
    
    async create(createTransactionDto: RegisterDto) {
        createTransactionDto.id = base64url(randomBytes(32))
        const user = new this.webAuthnModel(createTransactionDto);
        try {
            await user.save()
        } catch {
            throw new UnauthorizedException("User must not be already registered")
        }

        return this.generateMakeCredRequest(createTransactionDto.username,createTransactionDto.id)
    }

    generateMakeCredRequest(username, id) {
        return {
            challenge: base64url(randomBytes(32)),

            rp: {
                name: "NanoPOS"
            },

            user: {
                id: id,
                name: username,
                displayName: username
            },
            
                pubKeyCredParams: [
                    {
                        "type": "public-key",
                        "alg": -7
                    },
                    {
                        "type": "public-key",
                        "alg": -35
                    },
                    {
                        "type": "public-key",
                        "alg": -36
                    },
                    {
                        "type": "public-key",
                        "alg": -257
                    },
                    {
                        "type": "public-key",
                        "alg": -258
                    },
                    {
                        "type": "public-key",
                        "alg": -259
                    },
                    {
                        "type": "public-key",
                        "alg": -37
                    },
                    {
                        "type": "public-key",
                        "alg": -38
                    },
                    {
                        "type": "public-key",
                        "alg": -39
                    },
                    {
                        "type": "public-key",
                        "alg": -8
                    }
                ],

            authenticatorSelection: {
                authenticatorAttachment: "platform",
            },

            attestation: "direct"
        }
    }

}
