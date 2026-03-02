import type { Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(body: Record<string, string>, res: Response): Promise<{
        message: string;
        employeeId: string;
    }>;
    logout(req: Request & {
        user?: {
            id: string;
        };
    }, res: Response): Promise<{
        message: string;
    }>;
}
