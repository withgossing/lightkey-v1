import type { Request } from 'express';
export declare class UsersController {
    getProfile(req: Request): {
        id: string;
        employeeId: string;
        email: string;
        roles: string[];
        lastLoginAt: Date;
    };
}
