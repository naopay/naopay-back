import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { TokenService } from './token.service';

@Controller('auth/token')
export class TokenControler {
  constructor(private readonly tokenService: TokenService) { }


  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Refresh Access Token with refresh token', })
  async refreshAccessToken(@Body() refreshAccessTokenDto: RefreshAccessTokenDto) {
    return this.tokenService.useRefreshToken(refreshAccessTokenDto.token);
  }
}
