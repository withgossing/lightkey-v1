import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { roles: string[] } }>();
    const user = request.user;

    // User must be present (assumes JwtAuthGuard runs first)
    if (!user || user.roles === undefined || !Array.isArray(user.roles)) {
      return false;
    }

    // Check if the user has any of the required roles
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
