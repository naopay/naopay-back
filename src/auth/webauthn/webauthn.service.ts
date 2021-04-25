import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import base64url from 'base64url';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { LoginDto, RegisterDto, SuccessLoginDto } from './dto/webauthn.dto';
import { WebAuthnResponseDto } from './dto/response.dto';
import { Authenticator, WebAuthn } from './schemas/webauthn.model';
import { generateAssertionOptions, generateAttestationOptions, verifyAssertionResponse, verifyAttestationResponse } from '@simplewebauthn/server';
import { TokenService } from '../token/token.service';

// Human-readable title for your website
const rpName = 'NaoPay';
// A unique identifier for your website
const rpID = 'localhost';
// The URL at which attestations and assertions should occur
const origin = `http://${rpID}:8081`;

@Injectable()
export class WebauthnService {
    constructor(
        @InjectModel('WebAuthn') private webAuthnModel: Model<WebAuthn>,
        private tokenService: TokenService
    ) {}

    async create(createTransactionDto: RegisterDto) {
        createTransactionDto.id = base64url(crypto.randomBytes(32))
        let user = await this.webAuthnModel.findOne({ username: createTransactionDto.username })
        if (user) {
            throw new UnauthorizedException("User must not be already registered")
        }
        user = new this.webAuthnModel(createTransactionDto)
        const options = generateAttestationOptions({
            rpName,
            rpID,
            userID: user.id,
            userName: user.username,
            // Don't prompt users for additional information about the authenticator
            // (Recommended for smoother UX)
            attestationType: 'indirect',
        });
        user.challenge = options.challenge;
        user.cipher = createTransactionDto.cipher;
        await user.save();
        return options;
    }

    async login(loginDto: LoginDto) {
        const user = await this.webAuthnModel.findOne({ username: loginDto.username, registred: true })
        if (!user) throw new UnauthorizedException("User must be already registered")

        const options = generateAssertionOptions({
            // Require users to use a previously-registered authenticator
            allowCredentials: user.authenticators.map(authenticator => ({
                id: base64url.toBuffer(authenticator.credentialID),
                type: 'public-key',
                // Optional
                transports: authenticator.transports,
            })),
            userVerification: 'preferred',
        });
        user.challenge = options.challenge;
        await user.save();
        return options;
    }

    async response(responseDto: WebAuthnResponseDto): Promise<SuccessLoginDto> {
        const user = await this.webAuthnModel.findOne({ username: responseDto.username })
        if (!user) throw new UnauthorizedException("User does not exists")
        const clientData = JSON.parse(base64url.decode(responseDto.response.clientDataJSON))
        // TODO : Store challenge to reddis

        let verification;
        if (responseDto.response.attestationObject) {
            // Register
            try {
                verification = await verifyAttestationResponse({
                    credential: {
                        response: responseDto.response,
                        id: responseDto.id,
                        type: responseDto.type,
                        rawId: base64url.fromBase64(responseDto.rawId),
                        clientExtensionResults: {}
                    },
                    expectedChallenge: user.challenge,
                    expectedOrigin: origin,
                    expectedRPID: rpID
                })
            } catch (error) {
                console.error(error);
                throw new UnauthorizedException("Bad Attestation response");
            }
            const { verified, attestationInfo } = verification;
            if (!verified) { throw new UnauthorizedException("Bad Attestation response verification") }

            const { credentialPublicKey, credentialID, counter } = attestationInfo;

            const newAuthenticator: Authenticator = {
                credentialID: base64url.encode(credentialID),
                credentialPublicKey: base64url.encode(credentialPublicKey),
                counter,
            };
            user.authenticators.push(newAuthenticator);

            user.registred = true;
            user.challenge = "";
            await user.save();
        } else if (responseDto.response.authenticatorData) {
            // Log In
            try {
                const credID = responseDto.id;
                const authr = user.authenticators.find(value => credID === value.credentialID)
                verification = await verifyAssertionResponse({
                    credential: {
                        response: {
                            authenticatorData: base64url.fromBase64(responseDto.response.authenticatorData),
                            clientDataJSON: base64url.fromBase64(responseDto.response.clientDataJSON),
                            signature: base64url.fromBase64(responseDto.response.signature),
                            userHandle: responseDto.response.userHandle ? base64url.fromBase64(responseDto.response.userHandle) : ""
                        },
                        id: responseDto.id,
                        type: responseDto.type,
                        rawId: base64url.fromBase64(responseDto.rawId),
                        clientExtensionResults: {}
                    },
                    expectedChallenge: user.challenge,
                    expectedOrigin: origin,
                    expectedRPID: rpID,
                    authenticator: {
                        counter: authr.counter,
                        credentialID: base64url.toBuffer(authr.credentialID),
                        credentialPublicKey: base64url.toBuffer(authr.credentialPublicKey)
                    }
                });
            } catch (error) {
                console.error(error);
                throw new UnauthorizedException("Assertion Response");
            }

            const { verified, assertionInfo } = verification;
            if (!verified) { throw new UnauthorizedException("Assertion Response verificaiton KO"); }
            const { newCounter } = assertionInfo;

            user.authenticators = user.authenticators.map((value) => {
                if (value.credentialID === responseDto.id) {
                    value.counter = newCounter;
                    return value
                }
                return value
            });
            user.markModified("authenticators");
            await user.save();
        } else {
            throw new UnauthorizedException("Not handled");
        }

        const tokenPair = await this.tokenService.generateTokenPair(user.username);

        return {cipher: user.cipher, tokens:tokenPair};
    }

    findByPublicKey(publicKey: string): Promise<WebAuthn | undefined> {
        return this.webAuthnModel.findOne({username: publicKey}).exec();
    }
}