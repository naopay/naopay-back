
import { Injectable, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RegisteredGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info: Error, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException("Forbiden by registered guard");
    }
    return user;
  }
}
