import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {Document} from 'mongoose'

@Schema()
export class WebAuthn extends Document {

    @Prop({
        required: true,
        index: true
    })
    username: string

    @Prop({
        required: true
    })
    id: string

    @Prop({
        default: false
    })
    registred: boolean

    @Prop({default: Date.now})
    created: Date

}


export const WebAuthnSchema = SchemaFactory.createForClass(WebAuthn)