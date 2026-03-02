import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import * as ipaddr from 'ipaddr.js';
import { SpService } from '../sp.service';

@Injectable()
export class IpAllowlistGuard implements CanActivate {
  private readonly logger = new Logger(IpAllowlistGuard.name);

  constructor(private readonly spService: SpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Attempt to extract the IP address of the requester
    const clientIpStr = request.ip || request.connection.remoteAddress;

    // We expect the Service Provider's client ID to be provided in headers or query
    // depending on the exact OAuth/OIDC flow step
    const clientId =
      (request.headers['x-client-id'] as string) ||
      (request.query['client_id'] as string);

    if (!clientId) {
      // If there's no client ID, this route might not be SP-specific,
      // or it's a generic login. For strictness, if this guard is applied, we demand it.
      this.logger.warn(
        'IP Allowlist Check Failed: Missing client_id in request',
      );
      throw new ForbiddenException(
        'Missing Client ID for Service Provider validation',
      );
    }

    if (!clientIpStr) {
      throw new ForbiddenException('Cannot determine client IP address');
    }

    try {
      const sp = await this.spService.findByClientId(clientId);
      if (!sp) {
        throw new ForbiddenException('Invalid Service Provider');
      }

      // If the SP doesn't have an allowlist defined, we might default to allow or deny.
      // Usually, empty means "allow all" or "deny all".
      // Based on PRD we assume if it's there it's an extra restriction. Assuming empty = allow all.
      // If strict behavior is needed, change to `if (!sp.allowedIps || sp.allowedIps.length === 0) return false;`
      if (!sp.allowedIps || sp.allowedIps.length === 0) {
        return true;
      }

      const clientIp = ipaddr.process(clientIpStr);

      const isAllowed = sp.allowedIps.some((allowedRange: string) => {
        try {
          if (allowedRange.includes('/')) {
            // It's a CIDR
            const range = ipaddr.parseCIDR(allowedRange);
            return clientIp.match(range);
          } else {
            // It's a single IP
            const allowedIp = ipaddr.process(allowedRange);
            return clientIp.toString() === allowedIp.toString();
          }
        } catch (e) {
          this.logger.error(
            `Failed to parse IP or CIDR range from DB: ${allowedRange}`,
            e,
          );
          return false;
        }
      });

      if (!isAllowed) {
        this.logger.warn(
          `Access Denied. IP ${clientIpStr} is not in the allowlist for SP ${clientId}`,
        );
        throw new ForbiddenException(
          'IP Address is not allowed for this Service Provider',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error('Error during IP allowlist validation', error);
      throw new ForbiddenException('Failed to validate IP address');
    }
  }
}
