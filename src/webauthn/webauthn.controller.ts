import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { WebauthnService } from './webauthn.service';

@Controller('webauthn')
export class WebauthnController {
  constructor(private readonly webauthnService: WebauthnService) {
  }

  @Post('/register')
  register(@Body() createTransactionDto: RegisterDto) {
    return this.webauthnService.create(createTransactionDto);
  }
}
