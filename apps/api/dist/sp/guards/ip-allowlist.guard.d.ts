import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SpService } from '../sp.service';
export declare class IpAllowlistGuard implements CanActivate {
    private readonly spService;
    private readonly logger;
    constructor(spService: SpService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
