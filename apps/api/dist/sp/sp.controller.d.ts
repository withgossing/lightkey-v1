import type { Request } from 'express';
import { SpService } from './sp.service';
export declare class SpController {
    private readonly spService;
    private readonly logger;
    constructor(spService: SpService);
    getAllProviders(req: Request): Promise<{
        id: string;
        clientId: string;
        name: string;
        description: string;
        canAccess: boolean;
        reason: string | null;
    }[]>;
}
