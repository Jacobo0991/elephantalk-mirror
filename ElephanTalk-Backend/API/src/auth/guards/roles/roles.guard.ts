import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { TokenPayload } from '../../models/token.model';
import { Request } from 'express';
import { Role } from '../../../common/models/roles.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    if (!roles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const user = request.user as TokenPayload;

    const isAuth = roles.some((role) => role === user.role);

    if (!isAuth) {
      throw new ForbiddenException("You don't have permission (Roles).");
    }

    return true;
  }
}
