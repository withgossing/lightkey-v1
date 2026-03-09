import { UsersService } from '../users/users.service';
import { SpService } from '../sp/sp.service';
export declare class AdminController {
    private readonly usersService;
    private readonly spService;
    constructor(usersService: UsersService, spService: SpService);
    registerUser(body: Record<string, string>): Promise<{
        message: string;
        userId: string;
        employeeId: string;
    }>;
    getAllSp(): Promise<import("../sp/entities/service-provider.entity").ServiceProvider[]>;
    createSp(body: {
        name: string;
        description: string;
        allowedIps: string[];
    }): Promise<{
        message: string;
        sp: import("../sp/entities/service-provider.entity").ServiceProvider;
        rawSecret: string;
    }>;
    updateSp(id: string, body: {
        name?: string;
        description?: string;
        allowedIps?: string[];
    }): Promise<{
        message: string;
        sp: import("../sp/entities/service-provider.entity").ServiceProvider;
    }>;
    deleteSp(id: string): Promise<{
        message: string;
    }>;
    getAllUsers(): Promise<{
        id: string;
        employeeId: string;
        email: string;
        roles: string[];
        isLocked: boolean;
        failedLoginAttempts: number;
        lastLoginAt: Date;
        createdAt: Date;
    }[]>;
    unlockUser(id: string): Promise<{
        message: string;
    }>;
}
