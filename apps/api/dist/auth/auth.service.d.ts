import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly redisClient;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, redisClient: Redis);
    validateUser(employeeId: string, pass: string): Promise<User | null>;
    login(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
}
