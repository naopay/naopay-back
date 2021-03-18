import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import base64url from 'base64url';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import * as cbor from 'cbor'
import { LoginDto, RegisterDto } from './dto/webauthn.dto';
import { WebAuthnResponseDto } from './dto/response.dto';
import { WebAuthn } from './schemas/webauthn.model';
import * as NodeRSA from 'node-rsa';

/**
 * U2F Presence constant
 */
const U2F_USER_PRESENTED = 0x01;
const U2F_USER_VERIFIED = 0x04;

@Injectable()
export class WebauthnService {

    constructor(
        @InjectModel('WebAuthn') private webAuthnModel: Model<WebAuthn>) { }

    async create(createTransactionDto: RegisterDto) {
        createTransactionDto.id = base64url(crypto.randomBytes(32))
        let user = await this.webAuthnModel.findOne({ username: createTransactionDto.username })
        if (user) {
            throw new UnauthorizedException("User must not be already registered")
        }
        user = new this.webAuthnModel(createTransactionDto)
        const makeCred = this.generateMakeCredRequest(createTransactionDto.username, createTransactionDto.id)
        user.challenge = makeCred.challenge
        user.cipher = createTransactionDto.cipher;
        await user.save();
        return makeCred;
    }

    async login(loginDto: LoginDto) {
        const user = await this.webAuthnModel.findOne({ username: loginDto.username, registred: true })
        if (!user) throw new UnauthorizedException("User must be already registered")
        const getAssertion = await this.generateServerGetAssertion(user.authenticators);
        user.challenge = getAssertion.challenge;
        await user.save();
        return getAssertion;
    }

    async response(responseDto: WebAuthnResponseDto) {
        const user = await this.webAuthnModel.findOne({ username: responseDto.username })
        if (!user) throw new UnauthorizedException("User does not exists")
        const clientData = JSON.parse(base64url.decode(responseDto.response.clientDataJSON))
        // Store challenge to reddis ?
        if (clientData.challenge !== user.challenge) {
            throw new UnauthorizedException("Challenges don't match!")
        }
        //Check origin if(clientData.origin !== config.origin)

        if (responseDto.response.attestationObject) {
            // This is create cred
            const authnInfo = await this.verifyAuthenticatorAttestationResponse(responseDto)

            user.authenticators.push(authnInfo);
            user.registred = true;
            user.challenge = "";
            await user.save();
        } else if (responseDto.response.authenticatorData) {
            const credID = base64url.decode(responseDto.rawId, 'hex');
            const authr = user.authenticators.find(value => credID === base64url.decode(value.credID, 'hex'))
            const counter = this.verifyAuthenticatorAssertionResponse(responseDto, authr);
            user.authenticators = user.authenticators.map((value) => {
                if (value.credID === credID) {
                    value.counter = counter;
                    return value
                }
                return value
            });
            await user.save();
        } else {
            throw new UnauthorizedException("Not handled");
        }

        return user.cipher;
    }

    async generateServerGetAssertion(authenticators) {
        const allowCredentials = [];
        authenticators.forEach((authr) => {
            allowCredentials.push({
                type: 'public-key',
                id: authr.credID,
                // Not available yet on browser
                //transports: ['internal']
            })
        })
        return {
            challenge: base64url(crypto.randomBytes(32)),
            allowCredentials: allowCredentials
        }
    }



    async verifyAuthenticatorAssertionResponse(webAuthnResponse, authr) {
        const authenticatorData = base64url.toBuffer(webAuthnResponse.response.authenticatorData);
        let verified = false;
        if (authr.fmt === 'packed') {
            const authrData = this.parseGetAssertAuthData(authenticatorData)
            // STEP 14
            if (!(authrData.flags & U2F_USER_PRESENTED)) throw new UnauthorizedException("User not presented during auth")
            // STEP 15
            if (!(authrData.flags & U2F_USER_VERIFIED)) throw new UnauthorizedException("User verification is required for this registration")
            const digest = base64url.toBuffer(webAuthnResponse.response.clientDataJSON)
            // STEP 11
            const hash = Buffer.from(crypto.createHash('sha256').update(digest).digest('hex'), 'hex')
            const signatureBase = Buffer.concat([authenticatorData, hash]);
            const signature = base64url.toBuffer(webAuthnResponse.response.signature);
            
            verified = await this.verifyRS256Signature(base64url.toBuffer(authr.publicKey), signatureBase, signature);
            if (verified) {
                if(authrData.counter <= authr.counter) {
                    throw new UnauthorizedException("Authr counter did not increase")
                }
                return authrData.counter;
            }
        }
        throw new UnauthorizedException("Case not handled");
    }

    async verifyAuthenticatorAttestationResponse(webAuthnResponse) {
        let attestationBuffer = base64url.toBuffer(webAuthnResponse.response.attestationObject);

        const digest = base64url.toBuffer(webAuthnResponse.response.clientDataJSON)
        // STEP 11
        const hash = Buffer.from(crypto.createHash('sha256').update(digest).digest('hex'), 'hex')
        let verified = false;

        // STEP 12
        let ctapMakeCredResp = (await cbor.decodeAll((attestationBuffer)))[0];
        const authData = this.parseMakeCredAuthData(ctapMakeCredResp.authData)
        // TODO Change local host by the domain name
        // STEP 13
        const rpIdHash = crypto.createHash('sha256').update('localhost').digest('hex')
        if (authData.rpIdHash.toString('hex') !== rpIdHash) throw new UnauthorizedException("Rp Hash doesen't match")
        // STEP 14
        if (!(authData.flags & U2F_USER_PRESENTED)) throw new UnauthorizedException("User not presented during auth")
        // STEP 15
        if (!(authData.flags & U2F_USER_VERIFIED)) throw new UnauthorizedException("User verification is required for this registration")
        // STEP 16
        // TODO
        // STEP 17
        // TODO
        // STEP 18
        if (ctapMakeCredResp.fmt === 'packed') {
            // STEP 19
            // Verification Procedure (VP)
            // VP 1 (verify attStmt match with {alg:,sig:})
            // VP 3 (If x5c is not present)
            //if (ctapMakeCredResp.attStmt.alg !== authData.COSEPublicKey.alg)
            const signatureBase = Buffer.concat([ctapMakeCredResp.authData, hash]);
            const signature = ctapMakeCredResp.attStmt.sig;
            verified = await this.verifyRS256Signature(authData.COSEPublicKey, signatureBase, signature);

            if (verified) {
                return {
                    fmt: 'packed',
                    publicKey: base64url.encode(authData.COSEPublicKey),
                    credID: base64url.encode(authData.credID),
                    counter: authData.counter
                }
            }
        }
        throw new Error("Auth not handled");
    }

    async verifyRS256Signature(COSEPublicKey, data, signature) {
        /* 
            {
                1:   3,  ; kty: RSA key type
                3:-257,  ; alg: RS256
                -1:   n,  ; n:   RSA modulus n byte string 256 bytes in length
                            ;      e.g., in hex (middle bytes elided for brevity): DB5F651550...6DC6548ACC3
                -2:   e   ; e:   RSA public exponent e byte string 3 bytes in length
                            ;      e.g., in hex: 010001
            }
          */
        const coseStruct = (await cbor.decodeAll(COSEPublicKey))[0];
        if (coseStruct.get(3) !== -257) throw new Error("Alg not matching")
        const n = coseStruct.get(-1);
        const e = coseStruct.get(-2);
        const key = new NodeRSA()
        key.importKey({ n, e })
        return key.verify(data, signature);
    };

    parseGetAssertAuthData(buffer) {
        let rpIdHash = buffer.slice(0, 32); buffer = buffer.slice(32);
        let flagsBuf = buffer.slice(0, 1); buffer = buffer.slice(1);
        let flags = flagsBuf[0];
        let counterBuf = buffer.slice(0, 4); buffer = buffer.slice(4);
        let counter = counterBuf.readUInt32BE(0);

        return { rpIdHash, flagsBuf, flags, counter, counterBuf }
    }

    parseMakeCredAuthData(buffer) {
        let rpIdHash = buffer.slice(0, 32);
        buffer = buffer.slice(32);
        let flagsBuf = buffer.slice(0, 1);
        buffer = buffer.slice(1);
        let flags = flagsBuf[0];
        let counterBuf = buffer.slice(0, 4);
        buffer = buffer.slice(4);
        let counter = counterBuf.readUInt32BE(0);
        let aaguid = buffer.slice(0, 16);
        buffer = buffer.slice(16);
        let credIDLenBuf = buffer.slice(0, 2);
        buffer = buffer.slice(2);
        let credIDLen = credIDLenBuf.readUInt16BE(0);
        let credID = buffer.slice(0, credIDLen);
        buffer = buffer.slice(credIDLen);
        let COSEPublicKey = buffer;

        return {
            rpIdHash,
            flagsBuf,
            flags,
            counter,
            counterBuf,
            aaguid,
            credID,
            COSEPublicKey
        };
    };

    generateMakeCredRequest(username, id) {
        return {
            challenge: base64url(crypto.randomBytes(32)),

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
                    "alg": -257
                }
            ],

            authenticatorSelection: {
                authenticatorAttachment: "platform",
            },

            attestation: "direct"
        }
    }

}

/*

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
*/