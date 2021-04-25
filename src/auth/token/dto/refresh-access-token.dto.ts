import { IsNotEmpty, IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'

export class RefreshAccessTokenDto {
  @ApiProperty({
    description: 'JSON Refresh Token',
    format: 'string',
    uniqueItems: true,
  })
  @IsJWT()
  @IsNotEmpty()
  token: string
}
