import { Role } from './role.entity';
export declare class User {
    id: string;
    employeeId: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    isLocked: boolean;
    failedLoginAttempts: number;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    roles: Role[];
}
