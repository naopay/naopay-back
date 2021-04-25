import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from 'mongoose'

export class TokenPairAuth {
  constructor(private accessToken: string, private refreshToken: string) { }
}

export type InfoRefreshToken = {
  sub: string
  token: string
  iat: number
  exp: number
}

@Schema()
export class Token extends Document {
  @Prop({
    required: true,
    index: true,
    unique: true
  })
  username: string

  @Prop({ default: [] })
  refreshTokens: string[]

  @Prop({ default: Date.now })
  created: Date
}


export const TokenSchema = SchemaFactory.createForClass(Token)