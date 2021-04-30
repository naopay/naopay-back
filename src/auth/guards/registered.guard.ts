
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RegisteredGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException("Forbiden by registered guard");
    }
    return user;
  }
}
