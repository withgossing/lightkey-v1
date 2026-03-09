import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthSession } from './entities/auth-session.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly authSessionRepository;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, authSessionRepository: Repository<AuthSession>);
    validateUser(employeeId: string, pass: string): Promise<User | null>;
    login(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
}
