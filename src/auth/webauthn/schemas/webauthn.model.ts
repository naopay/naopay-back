import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose'

export type Authenticator = {
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    // ['usb' | 'ble' | 'nfc' | 'internal'] not supported yet by browser
    transports?: AuthenticatorTransport[];
};

@Schema()
export class WebAuthn extends Document {

    @Prop({
        required: true,
        index: true,
        unique: true
    })
    username: string

    @Prop()
    challenge: string

    @Prop()
    cipher: string

    @Prop({
        required: true
    })
    id: string

    @Prop({
        default: false
    })
    registred: boolean

    @Prop({ default: Date.now })
    created: Date

    @Prop()
    authenticators: Authenticator[]

    @Prop({ default: [] })
    refreshTokens: string[]
}


export const WebAuthnSchema = SchemaFactory.createForClass(WebAuthn)