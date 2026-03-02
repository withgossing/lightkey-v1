import { UsersService } from '../users/users.service';
export declare class AdminController {
    private readonly usersService;
    constructor(usersService: UsersService);
    registerUser(body: Record<string, string>): Promise<{
        message: string;
        userId: string;
        employeeId: string;
    }>;
}
