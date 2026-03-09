import { Controller, Get, Req, UseGuards, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpService } from './sp.service';
import * as ipaddr from 'ipaddr.js';

@Controller('sp')
export class SpController {
    private readonly logger = new Logger(SpController.name);

    constructor(private readonly spService: SpService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllProviders(@Req() req: Request) {
        const user = req.user as any;
        const sps = await this.spService.findAll();
        const clientIpStr = req.ip || req.connection?.remoteAddress || '127.0.0.1';
        let clientIp: ipaddr.IPv4 | ipaddr.IPv6 | null = null;

        try {
            clientIp = ipaddr.process(clientIpStr);
        } catch {
            // ignore invalid IP format
        }

        const checkIp = (sp: any) => {
            if (!sp.allowedIps || sp.allowedIps.length === 0) return true;
            if (!clientIp) return false;
            return sp.allowedIps.some((allowedRange: string) => {
                try {
                    if (allowedRange.includes('/')) {
                        return clientIp!.match(ipaddr.parseCIDR(allowedRange));
                    } else {
                        return clientIp!.toString() === ipaddr.process(allowedRange).toString();
                    }
                } catch {
                    return false;
                }
            });
        };

        return sps.map(sp => {
            let canAccess = true;
            let reason = null;

            // 1. IP Check
            const isIpAllowed = checkIp(sp);
            if (!isIpAllowed) {
                canAccess = false;
                reason = '접근 허용 IP 아님';
            }

            // 2. Role Check (Mocking logic for restriction)
            // Note: For now, if the app name contains '관리자' (Admin), we restrict it to ROLE_ADMIN users.
            const roles = user.roles ? user.roles.map((r: any) => r.name) : [];
            if (sp.name.includes('관리자') && !roles.includes('ROLE_ADMIN')) {
                canAccess = false;
                reason = '관리자 권한 필요';
            }

            return {
                id: sp.id,
                clientId: sp.clientId,
                name: sp.name,
                description: sp.description,
                canAccess,
                reason
            };
        });
    }
}
