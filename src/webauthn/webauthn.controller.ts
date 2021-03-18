import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/webauthn.dto';
import { WebAuthnResponseDto } from './dto/response.dto';
import { WebauthnService } from './webauthn.service';

@Controller('webauthn')
export class WebauthnController {
  constructor(private readonly webauthnService: WebauthnService) {
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.webauthnService.create(registerDto);
  }

  @HttpCode(202)
  @Post('/response')
  response(@Body() responseDto: WebAuthnResponseDto) {
    return this.webauthnService.response(responseDto);
  }

  @HttpCode(200)
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.webauthnService.login(loginDto);
  }
}
